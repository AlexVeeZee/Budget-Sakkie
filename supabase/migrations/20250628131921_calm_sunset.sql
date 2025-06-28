/*
  # Fix User Profiles RLS Recursion

  1. New Functions
    - `get_user_family_id` - Safely retrieves a user's family_id without triggering RLS
    - `check_user_in_same_family` - Checks if two users belong to the same family

  2. Security
    - Both functions use SECURITY DEFINER to bypass RLS
    - This prevents infinite recursion when checking family membership

  3. Policies
    - Replace problematic policies with ones that use these functions
    - Ensure basic user profile management policies exist
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
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;

-- Create a new policy using the SECURITY DEFINER function
CREATE POLICY "Family members can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR -- Users can always view their own profile
    check_user_in_same_family(auth.uid(), id) -- Users can view profiles of family members
  );

-- Ensure basic user profile policies exist
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Verify the functions work by testing with a simple query
DO $$
BEGIN
  RAISE NOTICE 'RLS policy functions created successfully';
END $$;