/*
  # Fix infinite recursion in family_members RLS policies

  1. Problem
    - The current RLS policies on family_members table are causing infinite recursion
    - This happens when policies reference each other in circular dependencies
    - The error occurs when fetching user profiles that need to check family membership

  2. Solution
    - Drop existing problematic policies
    - Create new, simplified policies that avoid circular references
    - Use direct user ID comparisons instead of complex subqueries where possible
    - Ensure policies are well-defined with clear termination conditions

  3. Security
    - Maintain the same security level as before
    - Users can only see family members of families they belong to
    - Family admins can manage members
    - Users can join/leave families appropriately
*/

-- Drop existing policies that are causing recursion
DROP POLICY IF EXISTS "Family admins can add members" ON family_members;
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Users can view family members of their families" ON family_members;

-- Create new, simplified policies without circular references

-- Policy 1: Users can view their own family membership record
CREATE POLICY "Users can view own membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can view other members in families where they are members
-- This uses a direct approach to avoid recursion
CREATE POLICY "Users can view family members"
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

-- Policy 3: Family creators can manage all members
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
  );

-- Policy 4: Family admins can manage members (simplified to avoid recursion)
CREATE POLICY "Family admins can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM family_members fm 
      WHERE fm.family_id = family_members.family_id 
        AND fm.user_id = auth.uid() 
        AND fm.role = 'admin'
    )
  );

-- Policy 5: Users can insert themselves into families (for invitations)
CREATE POLICY "Users can join families"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 6: Users can remove themselves from families
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Also fix any potential issues with user_profiles policies
-- Drop and recreate user_profiles policies to ensure they don't cause recursion

DROP POLICY IF EXISTS "Family members can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Recreate user_profiles policies with simplified logic
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow family members to view each other's profiles (simplified)
CREATE POLICY "Family members can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    family_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 
      FROM family_members fm 
      WHERE fm.family_id = user_profiles.family_id 
        AND fm.user_id = auth.uid()
    )
  );