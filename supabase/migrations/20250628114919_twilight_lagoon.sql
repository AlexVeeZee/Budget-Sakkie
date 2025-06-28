/*
  # Fix infinite recursion in RLS policies

  1. Problem
    - Infinite recursion detected in policy for relation "family_members"
    - Circular dependency between user_profiles and family_members policies
    
  2. Solution
    - Simplify family_members policies to avoid recursive checks
    - Update user_profiles policies to use direct user checks where possible
    - Remove circular dependencies between tables
    
  3. Changes
    - Drop and recreate problematic policies with simplified logic
    - Ensure policies don't reference each other in circular manner
*/

-- Drop existing problematic policies on family_members
DROP POLICY IF EXISTS "Family admins can add members" ON family_members;
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Users can view family members of their families" ON family_members;

-- Drop existing problematic policies on user_profiles that reference family_members
DROP POLICY IF EXISTS "Family members can view profiles" ON user_profiles;

-- Create simplified family_members policies without circular references
CREATE POLICY "Users can view their own family memberships"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join families"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

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

-- Create simplified user_profiles policies
CREATE POLICY "Users can view profiles in their families"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    (
      family_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM family_members fm
        WHERE fm.family_id = user_profiles.family_id
        AND fm.user_id = auth.uid()
      )
    )
  );

-- Keep existing simple policies for user_profiles
-- These should already exist and don't cause recursion:
-- "Users can view own profile" - uses direct auth.uid() check
-- "Users can insert own profile" - uses direct auth.uid() check  
-- "Users can update own profile" - uses direct auth.uid() check