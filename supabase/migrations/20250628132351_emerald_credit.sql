/*
  # Fix User Profiles and Add Location Fields

  1. New Columns
    - Add missing location fields to user_profiles table:
      - `phone_number` (text)
      - `address` (text)
      - `city` (text)
      - `province` (text)
      - `postal_code` (text)
      - `country` (text, default 'South Africa')
      - `alternative_email` (text)

  2. Security
    - Fix infinite recursion in RLS policies
    - Create SECURITY DEFINER functions to safely check family membership
    - Update policies to use these functions

  3. Functions
    - Update handle_new_user function to initialize new fields
*/

-- Add new columns to user_profiles table if they don't exist
DO $$
BEGIN
  -- Check if columns exist before adding them
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'phone_number') THEN
    ALTER TABLE user_profiles ADD COLUMN phone_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'address') THEN
    ALTER TABLE user_profiles ADD COLUMN address text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'city') THEN
    ALTER TABLE user_profiles ADD COLUMN city text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'province') THEN
    ALTER TABLE user_profiles ADD COLUMN province text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'postal_code') THEN
    ALTER TABLE user_profiles ADD COLUMN postal_code text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'country') THEN
    ALTER TABLE user_profiles ADD COLUMN country text DEFAULT 'South Africa';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'alternative_email') THEN
    ALTER TABLE user_profiles ADD COLUMN alternative_email text;
  END IF;
END $$;

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
CREATE OR REPLACE FUNCTION check_users_in_same_family(user_id1 uuid, user_id2 uuid)
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

-- Create a function to check if a user is a family admin
CREATE OR REPLACE FUNCTION check_user_is_family_admin(user_id uuid, family_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
STABLE -- Result depends only on the input parameters
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM family_members 
    WHERE user_id = $1 
    AND family_id = $2 
    AND role = 'admin'
  );
END;
$$;

-- Update the handle_new_user function to initialize new fields
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
  
  -- Insert default user preferences
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

-- Drop problematic policies that cause recursion
DROP POLICY IF EXISTS "Family members can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view family member profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;

-- Create new policies using the SECURITY DEFINER functions
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Family members can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR -- Users can always view their own profile
    check_users_in_same_family(auth.uid(), id) -- Users can view profiles of family members
  );