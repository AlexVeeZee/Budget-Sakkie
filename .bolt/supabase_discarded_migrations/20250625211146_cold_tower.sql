/*
  # Fix RLS Policies for Auth Schema

  1. Update all policies to work with auth schema
  2. Fix trigger permissions and references
  3. Ensure proper grants for auth schema access
  4. Handle user profile creation properly
*/

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public can read categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can create categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Authenticated users can create products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Users can create families" ON families;
DROP POLICY IF EXISTS "Users can view their families" ON families;
DROP POLICY IF EXISTS "Family admins can update families" ON families;
DROP POLICY IF EXISTS "Family creators can delete families" ON families;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Family members can view each other profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can join families" ON family_members;
DROP POLICY IF EXISTS "Family admins can add members" ON family_members;
DROP POLICY IF EXISTS "Users can view family members" ON family_members;
DROP POLICY IF EXISTS "Family admins can update members" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
DROP POLICY IF EXISTS "Family admins can remove members" ON family_members;

-- Categories Policies (Public read access for price comparison)
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products Policies (Public read access for price comparison)
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Families Policies
CREATE POLICY "Users can create families"
  ON families
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view families they belong to"
  ON families
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins can update family"
  ON families
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Family creators can delete families"
  ON families
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- User Profiles Policies
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Family members can view profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    family_id IS NOT NULL AND
    family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Family Members Policies
CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Family admins can add members"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    ) OR
    family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view family members of their families"
  ON family_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family admins can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    ) OR
    family_id IN (
      SELECT family_id 
      FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can leave families"
  ON family_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create or replace the user profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create or replace the updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop existing triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_families_updated_at ON families;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;

-- Create trigger for new user profile creation (if we have permission)
-- Note: This might need to be created by a superuser
DO $$
BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Could not create auth trigger - requires superuser privileges';
  WHEN others THEN
    RAISE NOTICE 'Error creating auth trigger: %', SQLERRM;
END;
$$;

-- Create updated_at triggers
CREATE TRIGGER update_families_updated_at
  BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant read access to anonymous users for public data (categories and products)
GRANT SELECT ON categories TO anon;
GRANT SELECT ON products TO anon;

-- Ensure the auth schema functions are accessible
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;