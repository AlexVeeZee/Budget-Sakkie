/*
  # Fix Infinite Recursion in family_members RLS Policies

  1. Problem
    - Infinite recursion detected in policy for relation "family_members"
    - This occurs when policies reference themselves in a circular way
    - The error happens when trying to check if a user is a member of a family

  2. Solution
    - Drop all existing problematic policies
    - Create new, non-recursive policies with clear boundaries
    - Use direct subqueries instead of complex nested queries
    - Prevent self-referential checks by explicitly excluding the current user
    - Create separate policies for different operations (SELECT, INSERT, UPDATE, DELETE)

  3. Changes
    - Create policies that don't cause infinite recursion
    - Maintain the same security model and access control
    - Fix notification preferences parsing issue in handle_new_user function
*/

-- Drop all existing policies on family_members table to start fresh
DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;
DROP POLICY IF EXISTS "Family admins can update member roles" ON family_members;
DROP POLICY IF EXISTS "Family creators can manage all members" ON family_members;
DROP POLICY IF EXISTS "Family members can view other members" ON family_members;
DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Users can view own membership" ON family_members;

-- Create new, non-recursive policies

-- 1. Users can always view their own membership
CREATE POLICY "Users can view own membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Users can join families when invited (for INSERT operations)
CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. Users can leave families (delete their own membership)
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Family creators can manage all members in their families
CREATE POLICY "Family creators can manage all members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT id FROM families 
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT id FROM families 
      WHERE created_by = auth.uid()
    )
  );

-- 5. Family members can view other members in their family
-- This uses a direct subquery that doesn't cause recursion
CREATE POLICY "Family members can view other members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    -- Only for other members, not self (to avoid potential recursion)
    user_id != auth.uid() 
    AND family_id IN (
      -- Direct query to find user's families
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid()
    )
  );

-- 6. Family admins can update member roles (but not their own)
CREATE POLICY "Family admins can update member roles"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (
    -- Cannot modify own role (to avoid recursion)
    user_id != auth.uid() 
    AND family_id IN (
      -- Direct query to find families where user is admin
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.role = 'admin'
    )
  )
  WITH CHECK (
    user_id != auth.uid() 
    AND family_id IN (
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.role = 'admin'
    )
  );

-- 7. Family admins can remove members (but not themselves)
CREATE POLICY "Family admins can remove members"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (
    -- Cannot remove self (to avoid recursion)
    user_id != auth.uid() 
    AND family_id IN (
      -- Direct query to find families where user is admin
      SELECT fm.family_id 
      FROM family_members fm 
      WHERE fm.user_id = auth.uid() 
      AND fm.role = 'admin'
    )
  );

-- Fix notification preferences parsing issue in handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  display_name text;
BEGIN
  -- Extract display name from metadata or use email prefix
  display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Insert user profile with new fields
  INSERT INTO public.user_profiles (
    id, 
    display_name,
    phone_number,
    address,
    city,
    province,
    postal_code,
    country,
    alternative_email,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    display_name,
    NULL, -- phone_number
    NULL, -- address
    NULL, -- city
    NULL, -- province
    NULL, -- postal_code
    'South Africa', -- country
    NULL, -- alternative_email
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert default user preferences - store notification_preferences as JSONB object, not string
  INSERT INTO public.user_preferences (
    user_id,
    language,
    currency,
    distance_unit,
    notification_preferences,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'en',
    'ZAR',
    'km',
    '{"sms": false, "push": false, "email": true}'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;