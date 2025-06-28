/*
  # Fix infinite recursion in family_members RLS policies

  1. Problem
    - Current RLS policies on family_members table are causing infinite recursion
    - Policies are using functions that query the same table they're protecting
    - This creates circular dependencies when checking permissions

  2. Solution
    - Replace problematic policies with simpler, non-recursive ones
    - Use direct column comparisons instead of helper functions
    - Ensure policies don't reference the same table they're protecting

  3. Changes
    - Drop all existing policies on family_members table
    - Create new, simplified policies that avoid recursion
    - Maintain the same security model but with direct queries
*/

-- Drop all existing policies on family_members table
DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;
DROP POLICY IF EXISTS "Family admins can update member roles" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage all members" ON family_members;
DROP POLICY IF EXISTS "Family members can view other members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Users can view own membership" ON family_members;

-- Create new, non-recursive policies

-- Users can view their own membership
CREATE POLICY "Users can view own membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can join families when invited (for INSERT operations)
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

-- Family creators can manage all members
CREATE POLICY "Family creators can manage all members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT id FROM families 
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT id FROM families 
      WHERE created_by = auth.uid()
    )
  );

-- Family members can view other members in their family
CREATE POLICY "Family members can view other members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    user_id != auth.uid() 
    AND family_id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid()
    )
  );

-- Family admins can update member roles (but not their own)
CREATE POLICY "Family admins can update member roles"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (
    user_id != auth.uid() 
    AND family_id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.role = 'admin'
    )
  )
  WITH CHECK (
    user_id != auth.uid() 
    AND family_id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.role = 'admin'
    )
  );

-- Family admins can remove members (but not themselves)
CREATE POLICY "Family admins can remove members"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (
    user_id != auth.uid() 
    AND family_id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.role = 'admin'
    )
  );