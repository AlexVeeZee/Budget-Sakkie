/*
# Family Sharing Database Schema

1. New Tables
   - `families` - Stores family groups with name and creator
   - `family_members` - Stores individual member profiles
   - `family_relationships` - Junction table connecting members to families with roles
   - `family_invitations` - Stores pending invitations to join families

2. Security
   - Row Level Security (RLS) enabled on all tables
   - Policies to ensure users can only access their own data
   - Helper functions to check permissions
*/

-- Create families table
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  relationship TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (family_id, user_id)
);

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  profile_image_url TEXT,
  family_id UUID REFERENCES families(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  phone_number TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'South Africa',
  alternative_email TEXT
);

-- Create family_invitations table
CREATE TABLE IF NOT EXISTS family_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

-- Enable Row Level Security
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;

-- Create trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_families_updated_at
BEFORE UPDATE ON families
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_invitations_updated_at
BEFORE UPDATE ON family_invitations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Drop existing functions if they exist to avoid parameter name conflicts
DROP FUNCTION IF EXISTS is_family_admin(UUID, UUID);
DROP FUNCTION IF EXISTS is_family_member(UUID, UUID);
DROP FUNCTION IF EXISTS check_users_in_same_family(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_family_id(UUID);
DROP FUNCTION IF EXISTS check_family_membership(UUID, UUID);
DROP FUNCTION IF EXISTS check_user_is_family_admin(UUID, UUID);

-- Helper function to check if a user is a family admin
CREATE OR REPLACE FUNCTION check_user_is_family_admin(family_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT role = 'admin' INTO v_is_admin
  FROM family_members
  WHERE family_id = $1
  AND user_id = $2;
  
  RETURN COALESCE(v_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user is a family member
CREATE OR REPLACE FUNCTION check_family_membership(family_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_member BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM family_members
    WHERE family_id = $1
    AND user_id = $2
  ) INTO v_is_member;
  
  RETURN v_is_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get a user's family ID
CREATE OR REPLACE FUNCTION get_user_family_id(user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_family_id UUID;
BEGIN
  SELECT family_id INTO v_family_id
  FROM user_profiles
  WHERE id = $1;
  
  RETURN v_family_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if two users are in the same family
CREATE OR REPLACE FUNCTION check_users_in_same_family(user_id1 UUID, user_id2 UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_family_id1 UUID;
  v_family_id2 UUID;
BEGIN
  SELECT family_id INTO v_family_id1
  FROM user_profiles
  WHERE id = $1;
  
  SELECT family_id INTO v_family_id2
  FROM user_profiles
  WHERE id = $2;
  
  RETURN v_family_id1 IS NOT NULL AND v_family_id1 = v_family_id2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for families table
CREATE POLICY "Family members can view their families" ON families
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_id = id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create families" ON families
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Family admins can update families" ON families
  FOR UPDATE
  USING (check_user_is_family_admin(id, auth.uid()));

CREATE POLICY "Family admins can delete families" ON families
  FOR DELETE
  USING (check_user_is_family_admin(id, auth.uid()));

-- Create RLS policies for family_members table
CREATE POLICY "Family members can view other members" ON family_members
  FOR SELECT
  USING (
    check_family_membership(family_id, auth.uid())
  );

CREATE POLICY "Family admins can insert members" ON family_members
  FOR INSERT
  WITH CHECK (
    check_user_is_family_admin(family_id, auth.uid()) OR
    (user_id = auth.uid() AND NOT EXISTS (
      SELECT 1 FROM family_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Family admins can update members" ON family_members
  FOR UPDATE
  USING (
    check_user_is_family_admin(family_id, auth.uid()) OR
    user_id = auth.uid()
  );

CREATE POLICY "Family admins can delete members" ON family_members
  FOR DELETE
  USING (
    check_user_is_family_admin(family_id, auth.uid())
  );

-- Create RLS policies for family_invitations table
CREATE POLICY "Users can view their own invitations" ON family_invitations
  FOR SELECT
  USING (
    invited_email = auth.email() OR
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_id = family_invitations.family_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Family admins can create invitations" ON family_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_id = family_invitations.family_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Family admins can update invitations" ON family_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_id = family_invitations.family_id
      AND user_id = auth.uid()
      AND role = 'admin'
    ) OR invited_email = auth.email()
  );

CREATE POLICY "Family admins can delete invitations" ON family_invitations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_id = family_invitations.family_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );