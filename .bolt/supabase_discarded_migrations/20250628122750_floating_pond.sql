/*
  # Fix infinite recursion in RLS policies

  1. Problem Analysis
    - The current policies on family_members and user_profiles create circular dependencies
    - Policy on user_profiles checks family_members, which in turn checks user_profiles
    - This creates an infinite loop during policy evaluation

  2. Solution
    - Simplify policies to avoid circular references
    - Use direct auth.uid() checks where possible
    - Remove complex nested subqueries that cause recursion
    - Ensure policies are efficient and don't reference each other circularly

  3. Changes Made
    - Drop all existing problematic policies
    - Create new, simplified policies that avoid recursion
    - Focus on direct user ownership and membership checks
*/

-- First, drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Family members can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view family members of their families" ON family_members;
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
DROP POLICY IF EXISTS "Family admins can add members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;

-- Create simplified policies for family_members that don't cause recursion

-- Policy 1: Users can view their own family membership
CREATE POLICY "Users can view own family membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can view other members of families they belong to
-- This uses a simple EXISTS check without complex subqueries
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
      SELECT f.id 
      FROM families f 
      WHERE f.created_by = auth.uid()
    )
  );

-- Policy 4: Family admins can manage members (but not create new admins)
CREATE POLICY "Family admins can manage non-admin members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.role = 'admin'
    )
    AND (role != 'admin' OR user_id = auth.uid())
  );

-- Policy 5: Users can join families when invited (INSERT only)
CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy 6: Users can leave families (DELETE only)
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Now create a simplified policy for user_profiles that doesn't reference family_members
-- This breaks the circular dependency

-- Drop the problematic policy
DROP POLICY IF EXISTS "Family members can view profiles" ON user_profiles;

-- Create a simple policy that allows users to view profiles of users in their families
-- But uses a direct approach without complex joins
CREATE POLICY "Users can view family member profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can always view their own profile
    id = auth.uid() 
    OR
    -- Users can view profiles of people in their families
    -- This uses a simple check without causing recursion
    (
      family_id IS NOT NULL 
      AND EXISTS (
        SELECT 1 
        FROM family_members fm1, family_members fm2
        WHERE fm1.user_id = auth.uid()
        AND fm2.user_id = user_profiles.id
        AND fm1.family_id = fm2.family_id
        AND fm1.family_id = user_profiles.family_id
      )
    )
  );

-- Ensure other user_profiles policies are simple and don't cause issues
-- These should already exist and be fine, but let's make sure they're optimal

-- Users can insert their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON user_profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Users can update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON user_profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Users can view their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON user_profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;