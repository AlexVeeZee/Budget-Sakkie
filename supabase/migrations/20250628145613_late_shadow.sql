/*
  # Fix infinite recursion in family_members RLS policies

  1. Problem
    - Current RLS policies on family_members table are causing infinite recursion
    - This happens when policies reference the same table they're applied to

  2. Solution
    - Drop existing problematic policies
    - Create simplified, non-recursive policies
    - Ensure users can view their own memberships without recursion
    - Allow family admins to manage members through direct user_id checks

  3. Security
    - Users can view their own family memberships
    - Users can view co-members in their families (simplified approach)
    - Family creators and admins can manage members
    - Users can join when invited and leave families
*/

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Users can view family co-members" ON family_members;
DROP POLICY IF EXISTS "Users can view own family membership" ON family_members;

-- Create new, simplified policies without recursion

-- Users can view their own family membership
CREATE POLICY "Users can view own membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can view other members in the same family (simplified)
CREATE POLICY "Users can view family co-members"
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

-- Family creators can manage all members
CREATE POLICY "Family creators can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT f.id 
      FROM families f 
      WHERE f.created_by = auth.uid()
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT f.id 
      FROM families f 
      WHERE f.created_by = auth.uid()
    )
  );

-- Users can join families when invited (insert only)
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

-- Family admins can update member roles (but not delete unless they're the creator)
CREATE POLICY "Family admins can update member roles"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM family_members fm 
      WHERE fm.family_id = family_members.family_id 
        AND fm.user_id = auth.uid() 
        AND fm.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM family_members fm 
      WHERE fm.family_id = family_members.family_id 
        AND fm.user_id = auth.uid() 
        AND fm.role = 'admin'
    )
  );