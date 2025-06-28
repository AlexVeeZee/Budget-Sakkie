/*
  # Fix infinite recursion in family_members RLS policies

  1. Problem
    - Current RLS policies on family_members table are causing infinite recursion
    - Policies that check for admin roles are querying the same table they protect
    - This creates a circular dependency

  2. Solution
    - Drop existing problematic policies
    - Create new policies that avoid circular references
    - Use direct user ID checks and family creator checks instead of recursive queries

  3. Security
    - Maintain proper access control
    - Users can view their own membership
    - Family creators can manage all members
    - Admins can manage members (using a safer approach)
*/

-- Drop all existing policies on family_members to start fresh
DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;
DROP POLICY IF EXISTS "Family admins can update member roles" ON family_members;
DROP POLICY IF EXISTS "Family admins can view all members" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage members" ON family_members;
DROP POLICY IF EXISTS "Family creators can view all members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Users can view own membership" ON family_members;

-- Create new, safer policies

-- 1. Users can view their own membership
CREATE POLICY "Users can view own membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Users can leave families (delete their own membership)
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 3. Users can join families when invited (insert their own membership)
CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 4. Family creators can view all members in their families
CREATE POLICY "Family creators can view all members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  );

-- 5. Family creators can manage all members in their families
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

-- 6. Create a function to safely check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_family_admin(check_family_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = check_family_id 
    AND user_id = check_user_id 
    AND role = 'admin'
  );
$$;

-- 7. Family admins can view members (using the safe function)
CREATE POLICY "Family admins can view members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    user_id != auth.uid() AND 
    is_family_admin(family_id, auth.uid())
  );

-- 8. Family admins can update member roles (excluding themselves)
CREATE POLICY "Family admins can update member roles"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (
    user_id != auth.uid() AND 
    is_family_admin(family_id, auth.uid())
  )
  WITH CHECK (
    user_id != auth.uid() AND 
    is_family_admin(family_id, auth.uid())
  );

-- 9. Family admins can remove members (excluding themselves)
CREATE POLICY "Family admins can remove members"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (
    user_id != auth.uid() AND 
    is_family_admin(family_id, auth.uid())
  );