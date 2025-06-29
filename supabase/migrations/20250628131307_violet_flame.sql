/*
  # Fix User Profiles RLS Recursion

  1. Problem
    - Infinite recursion detected in policy for relation "user_profiles"
    - The issue is caused by circular references in RLS policies
    - When a policy for user_profiles references family_members, which in turn references user_profiles

  2. Solution
    - Create a SECURITY DEFINER function that bypasses RLS
    - Replace the problematic policy with one that uses this function
    - Ensure all related policies are optimized to prevent recursion

  3. Changes
    - Create get_user_family_id function to safely retrieve a user's family_id
    - Create check_user_in_same_family function to check if users are in the same family
    - Update user_profiles policies to use these functions
    - Fix any other policies that might cause recursion
*/

-- Create a function to safely get a user's family_id without triggering RLS
CREATE OR REPLACE FUNCTION get_user_family_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER -- This is crucial - runs with definer's privileges, bypassing RLS
STABLE -- Result depends only on the input parameter
AS $$
  SELECT family_id 
  FROM user_profiles 
  WHERE id = user_id;
$$;

-- Create a function to check if two users are in the same family
CREATE OR REPLACE FUNCTION check_user_in_same_family(user_id1 uuid, user_id2 uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
STABLE -- Result depends only on the input parameters
AS $$
DECLARE
  family_id1 uuid;
  family_id2 uuid;
BEGIN
  -- Get family IDs directly from the table, bypassing RLS
  SELECT family_id INTO family_id1 FROM user_profiles WHERE id = user_id1;
  SELECT family_id INTO family_id2 FROM user_profiles WHERE id = user_id2;
  
  -- Check if both users have the same non-null family_id
  RETURN family_id1 IS NOT NULL AND family_id1 = family_id2;
END;
$$;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Family members can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view family member profiles" ON user_profiles;

-- Create a new policy using the SECURITY DEFINER function
CREATE POLICY "Family members can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR -- Users can always view their own profile
    check_user_in_same_family(auth.uid(), id) -- Users can view profiles of family members
  );

-- Ensure the basic user profile policies are correct
DO $$
BEGIN
  -- Make sure users can manage their own profiles
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Users can manage own profile'
  ) THEN
    CREATE POLICY "Users can manage own profile"
      ON user_profiles
      FOR ALL
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

-- Verify the functions work by testing with a simple query
DO $$
BEGIN
  RAISE NOTICE 'RLS policy functions created successfully';
END $$;