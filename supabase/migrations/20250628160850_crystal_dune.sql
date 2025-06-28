-- Drop all existing policies on family_members table to start fresh
DO $$
BEGIN
  -- Drop all existing policies on family_members
  DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;
  DROP POLICY IF EXISTS "Family admins can update member roles" ON family_members;
  DROP POLICY IF EXISTS "Family members can view other members" ON family_members;
  DROP POLICY IF EXISTS "Family creators can manage all members" ON family_members;
  DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
  DROP POLICY IF EXISTS "Users can leave families" ON family_members;
  DROP POLICY IF EXISTS "Users can view own membership" ON family_members;
END $$;

-- Create a function to safely check if user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION is_family_admin(check_family_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = check_family_id 
    AND user_id = check_user_id 
    AND role = 'admin'
  );
$$;

-- Create a function to check if user is in a family
CREATE OR REPLACE FUNCTION is_in_family(check_family_id uuid, check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = check_family_id 
    AND user_id = check_user_id
  );
$$;

-- Create new, non-recursive policies
-- 1. Users can view their own membership
CREATE POLICY "Users can view own membership"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Users can view other members in the same family (using SECURITY DEFINER function)
CREATE POLICY "Family members can view other members"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    user_id != auth.uid() AND
    is_in_family(family_id, auth.uid())
  );

-- 3. Family creators can manage all members
CREATE POLICY "Family creators can manage all members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  );

-- 4. Family admins can update member roles (using the safe function)
CREATE POLICY "Family admins can update member roles"
  ON family_members
  FOR UPDATE
  TO authenticated
  USING (
    user_id != auth.uid() AND 
    is_family_admin(family_id, auth.uid())
  )
  WITH CHECK (
    user_id != auth.uid() AND 
    is_family_admin(family_id, auth.uid())
  );

-- 5. Family admins can remove members (using the safe function)
CREATE POLICY "Family admins can remove members"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (
    user_id != auth.uid() AND 
    is_family_admin(family_id, auth.uid())
  );

-- 6. Users can join families when invited
CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 7. Users can leave families
CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Fix notification preferences parsing issue
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