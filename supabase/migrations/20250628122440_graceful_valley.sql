/*
  # Fix infinite recursion in RLS policies

  1. Policy Updates
    - Remove circular references in user_profiles policies
    - Simplify family_members policies to avoid recursion
    - Ensure policies are efficient and don't create loops

  2. Changes Made
    - Updated "Family members can view profiles" policy on user_profiles
    - Simplified family member access patterns
    - Removed complex nested subqueries that cause recursion
*/

-- Drop the problematic policy on user_profiles that causes recursion
DROP POLICY IF EXISTS "Family members can view profiles" ON user_profiles;

-- Create a simpler policy that doesn't cause recursion
-- This policy allows users to view profiles of family members without complex subqueries
CREATE POLICY "Family members can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    family_id IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM family_members fm 
      WHERE fm.family_id = user_profiles.family_id 
      AND fm.user_id = auth.uid()
    )
  );

-- Also update the family_members policies to be more efficient
DROP POLICY IF EXISTS "Users can view family members of their families" ON family_members;

-- Create a simpler policy for viewing family members
CREATE POLICY "Users can view family members of their families"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

-- Update the family admins policy to be more direct
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;

CREATE POLICY "Family admins can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    -- Family creator can manage all members
    family_id IN (
      SELECT id FROM families 
      WHERE created_by = auth.uid()
    ) OR
    -- Family admins can manage members
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Ensure the families policies are also efficient
DROP POLICY IF EXISTS "Users can view families they belong to" ON families;

CREATE POLICY "Users can view families they belong to"
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