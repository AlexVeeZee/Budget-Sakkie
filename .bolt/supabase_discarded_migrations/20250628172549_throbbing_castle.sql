/*
  # Family Management System

  1. New Tables
    - `families` - Stores family units
    - `family_members` - Stores individual members
    - `family_relationships` - Junction table connecting members to families

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control

  3. Helper Functions
    - Functions to manage family relationships
    - API endpoints for family management
*/

-- Create families table
CREATE TABLE IF NOT EXISTS families (
  family_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  email TEXT UNIQUE NOT NULL,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create family_relationships junction table
CREATE TABLE IF NOT EXISTS family_relationships (
  relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES family_members(member_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child', 'guardian', 'spouse', 'other')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, member_id)
);

-- Enable Row Level Security
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;

-- Helper function to check if a user is a family admin
CREATE OR REPLACE FUNCTION is_family_admin(p_family_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT fr.is_admin INTO v_is_admin
  FROM family_relationships fr
  JOIN family_members fm ON fr.member_id = fm.member_id
  WHERE fr.family_id = p_family_id
  AND fm.email = (SELECT email FROM auth.users WHERE id = p_user_id)
  AND fr.status = 'active';
  
  RETURN COALESCE(v_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user is a family member
CREATE OR REPLACE FUNCTION is_family_member(p_family_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_member BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM family_relationships fr
    JOIN family_members fm ON fr.member_id = fm.member_id
    WHERE fr.family_id = p_family_id
    AND fm.email = (SELECT email FROM auth.users WHERE id = p_user_id)
    AND fr.status = 'active'
  ) INTO v_is_member;
  
  RETURN v_is_member;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all families a user belongs to
CREATE OR REPLACE FUNCTION get_user_families()
RETURNS SETOF families AS $$
BEGIN
  RETURN QUERY
    SELECT f.* FROM families f
    JOIN family_relationships fr ON f.family_id = fr.family_id
    JOIN family_members fm ON fr.member_id = fm.member_id
    WHERE fm.email = auth.email()
    AND fr.status = 'active'
    ORDER BY f.family_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all members of a family
CREATE OR REPLACE FUNCTION get_family_members(p_family_id UUID)
RETURNS TABLE (
  member_id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  profile_image_url TEXT,
  role TEXT,
  is_admin BOOLEAN,
  status TEXT
) AS $$
BEGIN
  -- Check if user has access to this family
  IF NOT EXISTS (
    SELECT 1 FROM family_relationships fr
    JOIN family_members fm ON fr.member_id = fm.member_id
    WHERE fr.family_id = p_family_id
    AND fm.email = auth.email()
    AND fr.status = 'active'
  ) THEN
    RAISE EXCEPTION 'Access denied: You are not a member of this family';
  END IF;

  RETURN QUERY
    SELECT 
      fm.member_id,
      fm.first_name,
      fm.last_name,
      fm.email,
      fm.profile_image_url,
      fr.role,
      fr.is_admin,
      fr.status
    FROM family_members fm
    JOIN family_relationships fr ON fm.member_id = fr.member_id
    WHERE fr.family_id = p_family_id
    ORDER BY fr.is_admin DESC, fm.first_name, fm.last_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add a new or existing member to a family
CREATE OR REPLACE FUNCTION add_family_member(
  p_family_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_role TEXT,
  p_is_admin BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
  v_member_id UUID;
  v_result JSON;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = auth.email();
  
  -- Check if user is admin of this family
  IF NOT is_family_admin(p_family_id, v_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Only family admins can add members'
    );
  END IF;

  -- Check if member with this email already exists
  SELECT member_id INTO v_member_id
  FROM family_members
  WHERE email = p_email;

  -- If member doesn't exist, create new member
  IF v_member_id IS NULL THEN
    INSERT INTO family_members (
      first_name,
      last_name,
      email,
      profile_image_url
    ) VALUES (
      p_first_name,
      p_last_name,
      p_email,
      NULL
    )
    RETURNING member_id INTO v_member_id;
  END IF;

  -- Check if member is already in this family
  IF EXISTS (
    SELECT 1 FROM family_relationships
    WHERE family_id = p_family_id
    AND member_id = v_member_id
  ) THEN
    -- Update existing relationship
    UPDATE family_relationships
    SET role = p_role,
        is_admin = p_is_admin,
        status = 'active',
        updated_at = now()
    WHERE family_id = p_family_id
    AND member_id = v_member_id;
    
    RETURN json_build_object(
      'success', true,
      'message', 'Member updated in family',
      'member_id', v_member_id
    );
  ELSE
    -- Add member to family
    INSERT INTO family_relationships (
      family_id,
      member_id,
      role,
      is_admin,
      status
    ) VALUES (
      p_family_id,
      v_member_id,
      p_role,
      p_is_admin,
      'active'
    );
    
    RETURN json_build_object(
      'success', true,
      'message', 'Member added to family',
      'member_id', v_member_id
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a family member's role or status
CREATE OR REPLACE FUNCTION update_family_member(
  p_family_id UUID,
  p_member_id UUID,
  p_role TEXT DEFAULT NULL,
  p_is_admin BOOLEAN DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_current_role TEXT;
  v_current_is_admin BOOLEAN;
  v_current_status TEXT;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = auth.email();
  
  -- Check if user is admin of this family
  IF NOT is_family_admin(p_family_id, v_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Only family admins can update members'
    );
  END IF;

  -- Get current values
  SELECT role, is_admin, status INTO v_current_role, v_current_is_admin, v_current_status
  FROM family_relationships
  WHERE family_id = p_family_id
  AND member_id = p_member_id;

  -- Check if relationship exists
  IF v_current_role IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Member not found in this family'
    );
  END IF;

  -- Update relationship
  UPDATE family_relationships
  SET role = COALESCE(p_role, v_current_role),
      is_admin = COALESCE(p_is_admin, v_current_is_admin),
      status = COALESCE(p_status, v_current_status),
      updated_at = now()
  WHERE family_id = p_family_id
  AND member_id = p_member_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Member updated successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove a member from a family
CREATE OR REPLACE FUNCTION remove_family_member(
  p_family_id UUID,
  p_member_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get current user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = auth.email();
  
  -- Check if user is admin of this family
  IF NOT is_family_admin(p_family_id, v_user_id) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Only family admins can remove members'
    );
  END IF;

  -- Check if trying to remove the last admin
  IF (
    SELECT COUNT(*) = 1 FROM family_relationships
    WHERE family_id = p_family_id
    AND is_admin = true
    AND status = 'active'
  ) AND (
    SELECT is_admin FROM family_relationships
    WHERE family_id = p_family_id
    AND member_id = p_member_id
  ) = true THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Cannot remove the last admin of a family'
    );
  END IF;

  -- Remove member from family
  DELETE FROM family_relationships
  WHERE family_id = p_family_id
  AND member_id = p_member_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Member removed from family'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for families table
CREATE POLICY "Users can view families they belong to" ON families
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_relationships fr
      JOIN family_members fm ON fr.member_id = fm.member_id
      WHERE fr.family_id = families.family_id
      AND fm.email = auth.email()
      AND fr.status = 'active'
    )
  );

CREATE POLICY "Users can create families" ON families
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Family admins can update families" ON families
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_relationships fr
      JOIN family_members fm ON fr.member_id = fm.member_id
      WHERE fr.family_id = families.family_id
      AND fm.email = auth.email()
      AND fr.is_admin = true
      AND fr.status = 'active'
    )
  );

CREATE POLICY "Family admins can delete families" ON families
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_relationships fr
      JOIN family_members fm ON fr.member_id = fm.member_id
      WHERE fr.family_id = families.family_id
      AND fm.email = auth.email()
      AND fr.is_admin = true
      AND fr.status = 'active'
    )
  );

-- Create RLS policies for family_members table
CREATE POLICY "Users can view family members they are connected to" ON family_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_relationships fr1
      JOIN family_relationships fr2 ON fr1.family_id = fr2.family_id
      JOIN family_members fm ON fr1.member_id = fm.member_id
      WHERE fr2.member_id = family_members.member_id
      AND fm.email = auth.email()
      AND fr1.status = 'active'
    )
  );

CREATE POLICY "Users can create their own member profile" ON family_members
  FOR INSERT
  WITH CHECK (
    email = auth.email() OR
    EXISTS (
      SELECT 1 FROM family_relationships fr
      JOIN family_members fm ON fr.member_id = fm.member_id
      WHERE fr.is_admin = true
      AND fm.email = auth.email()
      AND fr.status = 'active'
    )
  );

CREATE POLICY "Users can update their own member profile" ON family_members
  FOR UPDATE
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 FROM family_relationships fr
      JOIN family_members fm ON fr.member_id = fm.member_id
      WHERE fr.is_admin = true
      AND fm.email = auth.email()
      AND fr.status = 'active'
    )
  );

-- Create RLS policies for family_relationships table
CREATE POLICY "Users can view relationships they are connected to" ON family_relationships
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_relationships fr
      JOIN family_members fm ON fr.member_id = fm.member_id
      WHERE fr.family_id = family_relationships.family_id
      AND fm.email = auth.email()
      AND fr.status = 'active'
    )
  );

CREATE POLICY "Family admins can manage relationships" ON family_relationships
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM family_relationships fr
      JOIN family_members fm ON fr.member_id = fm.member_id
      WHERE fr.family_id = family_relationships.family_id
      AND fm.email = auth.email()
      AND fr.is_admin = true
      AND fr.status = 'active'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_families_updated_at
BEFORE UPDATE ON families
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
BEFORE UPDATE ON family_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_relationships_updated_at
BEFORE UPDATE ON family_relationships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();