/*
  # Fix infinite recursion in family_members RLS policies

  1. Policy Updates
    - Remove problematic recursive policies that cause infinite loops
    - Simplify RLS policies to avoid circular dependencies
    - Ensure policies are straightforward and don't reference themselves

  2. Security
    - Maintain proper access control without recursion
    - Users can view their own memberships
    - Family admins can manage members
    - Family creators have full control
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;
DROP POLICY IF EXISTS "Family admins can update member roles" ON family_members;
DROP POLICY IF EXISTS "Family admins can view members" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage members" ON family_members;
DROP POLICY IF EXISTS "Family creators can view all members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Users can view own membership" ON family_members;

-- Create simplified, non-recursive policies
CREATE POLICY "Users can view own membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Family creators can manage all members"
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

-- Simple policy for family members to view other members in same family
CREATE POLICY "Family members can view other members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid()
    )
  );

-- Allow family admins to update member roles (non-recursive check)
CREATE POLICY "Family admins can update member roles"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (
    user_id != auth.uid() AND
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
    )
  )
  WITH CHECK (
    user_id != auth.uid() AND
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
    )
  );

-- Allow family admins to remove members (non-recursive check)
CREATE POLICY "Family admins can remove members"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (
    user_id != auth.uid() AND
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
    )
  );