/*
  # User Authentication System

  1. New Tables
    - `user_preferences` - Store user preferences like language, currency, etc.
  
  2. Updates to Existing Tables
    - Add additional fields to `user_profiles` table
  
  3. Security
    - Add RLS policies for user preferences
    - Update RLS policies for user profiles
  
  4. Functions
    - Update user profile trigger to include default preferences
*/

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  language text DEFAULT 'en' CHECK (language IN ('en', 'af')),
  currency text DEFAULT 'ZAR' CHECK (currency IN ('ZAR', 'USD', 'EUR', 'GBP')),
  distance_unit text DEFAULT 'km' CHECK (distance_unit IN ('km', 'mi')),
  notification_preferences jsonb DEFAULT '{"sms": false, "push": false, "email": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_preferences
CREATE POLICY "Users can manage their preferences"
  ON user_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating updated_at on user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update handle_new_user function to create user preferences
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
  
  -- Insert user profile
  INSERT INTO public.user_profiles (
    id, 
    display_name,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    display_name,
    NOW(),
    NOW()
  );
  
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
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert test data for sarah.vandermerwe@email.com if it doesn't exist
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Try to find the user ID for sarah.vandermerwe@email.com
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'sarah.vandermerwe@email.com';
  
  -- If user exists, ensure they have preferences
  IF test_user_id IS NOT NULL THEN
    INSERT INTO public.user_preferences (
      user_id,
      language,
      currency,
      distance_unit,
      notification_preferences,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      'en',
      'ZAR',
      'km',
      '{"sms": true, "push": true, "email": true}'::jsonb,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      notification_preferences = EXCLUDED.notification_preferences,
      updated_at = NOW();
  END IF;
END $$;