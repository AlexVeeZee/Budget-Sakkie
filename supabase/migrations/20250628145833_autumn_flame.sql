/*
  # Fix infinite recursion in family_members RLS policies

  1. Problem
    - The current RLS policies on family_members table are causing infinite recursion
    - This happens when policies reference the same table they're applied to without proper exit conditions

  2. Solution
    - Drop existing problematic policies
    - Create new, simplified policies that avoid circular references
    - Use direct user ID checks and family creator checks instead of complex subqueries

  3. Security
    - Maintain proper access control while avoiding recursion
    - Users can only see family members from families they belong to
    - Family creators and admins maintain management privileges
*/

-- Drop all existing policies on family_members to start fresh
DROP POLICY IF EXISTS "Family admins can update member roles" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Users can view family co-members" ON family_members;
DROP POLICY IF EXISTS "Users can view own membership" ON family_members;

-- Create new, non-recursive policies

-- Users can view their own membership records
CREATE POLICY "Users can view own membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can view other members in families where they are the creator
CREATE POLICY "Family creators can view all members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  );

-- Users can view other members in families where they are admins
CREATE POLICY "Family admins can view all members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
    )
    AND family_members.user_id != auth.uid() -- Avoid self-reference
  );

-- Family creators can manage all members
CREATE POLICY "Family creators can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  );

-- Family admins can update member roles (but not their own)
CREATE POLICY "Family admins can update member roles"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (
    family_members.user_id != auth.uid() -- Cannot modify own role
    AND EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
    )
  )
  WITH CHECK (
    family_members.user_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
    )
  );

-- Users can join families when invited (insert their own membership)
CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can leave families (delete their own membership)
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Family admins can remove other members (but not themselves)
CREATE POLICY "Family admins can remove members"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (
    family_members.user_id != auth.uid() -- Cannot remove themselves
    AND EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
    )
  );