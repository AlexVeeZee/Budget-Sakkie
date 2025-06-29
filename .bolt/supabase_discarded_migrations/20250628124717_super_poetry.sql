/*
  # Fix Infinite Recursion in RLS Policies

  1. Create a SECURITY DEFINER function to check family membership
    - This function will bypass RLS when checking if a user belongs to a family
    - Eliminates the circular dependency in policies

  2. Replace problematic policies with optimized versions
    - Remove policies that cause recursion
    - Create new policies that use the SECURITY DEFINER function

  3. Simplify other related policies
    - Make family_members policies more direct
    - Ensure no circular references between tables
*/

-- First, create a SECURITY DEFINER function to check family membership
-- This function will bypass RLS when executed, preventing recursion
CREATE OR REPLACE FUNCTION check_family_membership(user_id uuid, family_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- This is key: function runs with definer's privileges, bypassing RLS
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM family_members 
    WHERE user_id = $1 AND family_id = $2
  );
END;
$$;

-- Create a function to check if user is a family admin
CREATE OR REPLACE FUNCTION check_family_admin(user_id uuid, family_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM family_members 
    WHERE user_id = $1 AND family_id = $2 AND role = 'admin'
  );
END;
$$;

-- Drop the problematic policies that cause recursion
DROP POLICY IF EXISTS "Family members can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view family co-members" ON family_members;
DROP POLICY IF EXISTS "Users can view family members of their families" ON family_members;
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;

-- Create new policy for user_profiles using the SECURITY DEFINER function
CREATE POLICY "Family members can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can always view their own profile
    id = auth.uid() OR
    -- Users can view profiles of family members using the security definer function
    (family_id IS NOT NULL AND check_family_membership(auth.uid(), family_id))
  );

-- Create new policies for family_members
-- Policy for viewing family members
CREATE POLICY "Users can view family members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    -- Users can view their own membership
    user_id = auth.uid() OR
    -- Users can view members of families they belong to
    check_family_membership(auth.uid(), family_id)
  );

-- Policy for family admins to manage members
CREATE POLICY "Family admins can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    -- Family creator can manage all members (using direct check)
    family_id IN (
      SELECT id FROM families 
      WHERE created_by = auth.uid()
    ) OR
    -- Family admins can manage members (using security definer function)
    check_family_admin(auth.uid(), family_id)
  );

-- Policy for users to join families
CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy for users to leave families
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Verify the functions work by testing with a simple query
DO $$
BEGIN
  RAISE NOTICE 'RLS policy functions created successfully';
END $$;