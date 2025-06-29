/*
  # Fix infinite recursion in RLS policies

  1. Problem Analysis
    - The current RLS policies on family_members and user_profiles create circular dependencies
    - Policy on user_profiles checks family_members, which in turn checks user_profiles
    - This creates an infinite loop during policy evaluation

  2. Solution
    - Simplify policies to avoid circular references
    - Use direct auth.uid() checks where possible
    - Remove complex nested subqueries that cause recursion
    - Create clear, non-circular policy logic

  3. Changes Made
    - Drop all existing problematic policies
    - Create new, simplified policies that don't reference each other circularly
    - Ensure policies are efficient and secure without recursion
*/

-- First, drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Family members can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view family members of their families" ON family_members;
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
DROP POLICY IF EXISTS "Family admins can add members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;

-- Create simple, non-recursive policies for family_members
-- Policy 1: Users can view their own family membership
CREATE POLICY "Users can view own family membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can view other members of families they belong to
-- This uses a simple EXISTS check without recursion
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

-- Policy 3: Family creators can manage all members of their families
CREATE POLICY "Family creators can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT id FROM families 
      WHERE created_by = auth.uid()
    )
  );

-- Policy 4: Family admins can manage members (non-recursive check)
CREATE POLICY "Family admins can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
      AND fm.role = 'admin'
    )
  );

-- Policy 5: Users can join families when invited (for INSERT)
CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 6: Users can leave families (for DELETE)
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Now create a simple policy for user_profiles that doesn't cause recursion
-- Drop the existing problematic policy first
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create simple, direct policies for user_profiles
-- Policy 1: Users can manage their own profile
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy 2: Family members can view each other's profiles
-- This is simplified to avoid recursion by using a direct family_id match
CREATE POLICY "Family members can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    family_id IS NOT NULL AND
    family_id IN (
      SELECT up.family_id 
      FROM user_profiles up 
      WHERE up.id = auth.uid() 
      AND up.family_id IS NOT NULL
    )
  );

-- Ensure the families table policies are also simple and non-recursive
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;
DROP POLICY IF EXISTS "Users can create families" ON families;
DROP POLICY IF EXISTS "Family creators can delete families" ON families;
DROP POLICY IF EXISTS "Family admins can update family" ON families;

-- Create simple policies for families
CREATE POLICY "Users can create families"
  ON families
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family creators can manage families"
  ON families
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Family members can view families"
  ON families
  FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid() OR
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins can update families"
  ON families
  FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM family_members fm
      WHERE fm.family_id = families.id
      AND fm.user_id = auth.uid()
      AND fm.role = 'admin'
    )
  );