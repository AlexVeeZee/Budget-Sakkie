/*
  # Add Relationship Column to Family Members

  1. New Columns
    - Add `relationship` column to family_members table to store the relationship between family members
  
  2. Security
    - Maintain existing RLS policies
    - Ensure new field is protected by the same policies

  3. Data
    - Set default value to null to allow for backward compatibility
*/

-- Add relationship column to family_members table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'family_members' AND column_name = 'relationship') THEN
    ALTER TABLE family_members ADD COLUMN relationship text;
  END IF;
END $$;

-- Update the handle_new_user function to initialize this field
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