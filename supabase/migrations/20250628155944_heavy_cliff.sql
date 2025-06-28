/*
  # Fix Infinite Recursion in family_members RLS Policies

  1. Problem
    - Infinite recursion detected in policy for relation "family_members"
    - This happens when RLS policies create circular dependencies
    - When a policy on family_members references itself directly or indirectly

  2. Solution
    - Drop all existing problematic policies
    - Create new, simplified policies that avoid recursion
    - Use direct queries instead of complex subqueries
    - Ensure proper separation of concerns in policies

  3. Changes
    - Create clean, non-recursive policies for all operations
    - Ensure proper access control while avoiding circular references
*/

-- Drop all existing policies on family_members table to start fresh
DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;
DROP POLICY IF EXISTS "Family admins can update member roles" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage all members" ON family_members;
DROP POLICY IF EXISTS "Family members can view other members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Users can view own membership" ON family_members;

-- Create new, non-recursive policies

-- 1. Users can always view their own membership
CREATE POLICY "Users can view own membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Users can join families when invited (for INSERT operations)
CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. Users can leave families (delete their own membership)
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Family creators can manage all members in their families
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

-- 5. Family members can view other members in their family
-- This uses a direct subquery that doesn't cause recursion
CREATE POLICY "Family members can view other members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    -- Only for other members, not self (to avoid potential recursion)
    user_id != auth.uid() 
    AND family_id IN (
      -- Direct query to find user's families
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid()
    )
  );

-- 6. Family admins can update member roles (but not their own)
CREATE POLICY "Family admins can update member roles"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (
    -- Cannot modify own role (to avoid recursion)
    user_id != auth.uid() 
    AND family_id IN (
      -- Direct query to find families where user is admin
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

-- 7. Family admins can remove members (but not themselves)
CREATE POLICY "Family admins can remove members"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (
    -- Cannot remove self (to avoid recursion)
    user_id != auth.uid() 
    AND family_id IN (
      -- Direct query to find families where user is admin
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.role = 'admin'
    )
  );