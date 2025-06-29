/*
  # Extended User Profile Schema

  1. New Columns
    - Add additional profile fields to user_profiles table
      - `phone_number` (text, optional)
      - `address` (text, optional)
      - `city` (text, optional)
      - `province` (text, optional)
      - `postal_code` (text, optional)
      - `country` (text, default 'South Africa')
      - `alternative_email` (text, optional)

  2. Security
    - Maintain existing RLS policies
    - Ensure new fields are protected by the same policies

  3. Triggers
    - Update the handle_new_user function to initialize these fields
*/

-- Add new columns to user_profiles table
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

-- Update the handle_new_user function to initialize these fields
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