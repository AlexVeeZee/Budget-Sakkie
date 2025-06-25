/*
  # Create User Profile Trigger

  1. Functions
    - `handle_new_user()` - Automatically creates user profile when user signs up
    - `update_updated_at_column()` - Updates the updated_at timestamp

  2. Triggers
    - Trigger on auth.users to create profile automatically
    - Trigger on user_profiles to update timestamp

  3. Test Data
    - Insert test profile for sarah.vandermerwe@email.com
*/

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create trigger for updating updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updating updated_at on families
DROP TRIGGER IF EXISTS update_families_updated_at ON families;
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert test profile for sarah.vandermerwe@email.com if it doesn't exist
-- This will be connected when the user confirms their email
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Try to find the user ID for sarah.vandermerwe@email.com
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'sarah.vandermerwe@email.com';
  
  -- If user exists, ensure they have a profile
  IF test_user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (
      id, 
      display_name, 
      profile_image_url,
      created_at, 
      updated_at
    ) VALUES (
      test_user_id,
      'Sarah Van Der Merwe',
      'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      profile_image_url = EXCLUDED.profile_image_url,
      updated_at = NOW();
  END IF;
END $$;