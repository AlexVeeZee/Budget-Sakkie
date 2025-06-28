/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - The current RLS policies on user_profiles table are causing infinite recursion
    - Policy "Family members can view profiles" references family_members table
    - This creates a circular dependency when querying user profiles

  2. Solution
    - Simplify the user_profiles policies to avoid circular references
    - Remove the problematic "Family members can view profiles" policy
    - Keep only essential policies for user profile access
    - Ensure users can view their own profiles and update them

  3. Changes
    - Drop the problematic policy that causes recursion
    - Keep simple, direct policies for user profile access
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Family members can view profiles" ON user_profiles;

-- Ensure we have the basic policies for user profiles
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- If family functionality is needed, create a separate view or function
-- that handles family member profile access without causing recursion
-- For now, we'll keep it simple to avoid the infinite recursion issue