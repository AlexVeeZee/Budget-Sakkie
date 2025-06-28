/*
  # Family Management Schema

  1. New Tables
    - `families` - Stores family units
    - `family_members` - Stores individual member information
    - `family_relationships` - Junction table connecting members to families with roles

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Create helper functions for permission checks
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
  role TEXT NOT NULL CHECK (role IN ('parent', 'child', 'guardian', 'spouse', 'sibling', 'other')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, member_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_relationships_family_id ON family_relationships(family_id);
CREATE INDEX IF NOT EXISTS idx_family_relationships_member_id ON family_relationships(member_id);
CREATE INDEX IF NOT EXISTS idx_family_relationships_status ON family_relationships(status);

-- Create updated_at triggers
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

-- Helper functions for security policies
CREATE OR REPLACE FUNCTION is_family_admin(family_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM family_relationships fr
    JOIN family_members fm ON fr.member_id = fm.member_id
    WHERE fr.family_id = $1
    AND fm.email = auth.email()
    AND fr.is_admin = true
    AND fr.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_family_member(family_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM family_relationships fr
    JOIN family_members fm ON fr.member_id = fm.member_id
    WHERE fr.family_id = $1
    AND fm.email = auth.email()
    AND fr.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_member_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT member_id FROM family_members
    WHERE email = auth.email()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;

-- Policies for families table
CREATE POLICY "Users can view families they belong to"
  ON families
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

CREATE POLICY "Users can create families"
  ON families
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only family admins can update families"
  ON families
  FOR UPDATE
  USING (is_family_admin(family_id, auth.uid()));

CREATE POLICY "Only family admins can delete families"
  ON families
  FOR DELETE
  USING (is_family_admin(family_id, auth.uid()));

-- Policies for family_members table
CREATE POLICY "Users can view their own member profile"
  ON family_members
  FOR SELECT
  USING (
    email = auth.email() OR
    EXISTS (
      SELECT 1 FROM family_relationships fr1
      JOIN family_relationships fr2 ON fr1.family_id = fr2.family_id
      WHERE fr1.member_id = family_members.member_id
      AND fr2.member_id = get_user_member_id()
      AND fr1.status = 'active'
      AND fr2.status = 'active'
    )
  );

CREATE POLICY "Users can create their own member profile"
  ON family_members
  FOR INSERT
  WITH CHECK (email = auth.email());

CREATE POLICY "Users can update their own member profile"
  ON family_members
  FOR UPDATE
  USING (email = auth.email());

-- Policies for family_relationships table
CREATE POLICY "Users can view relationships in their families"
  ON family_relationships
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

CREATE POLICY "Only family admins can create relationships"
  ON family_relationships
  FOR INSERT
  WITH CHECK (
    is_family_admin(family_id, auth.uid()) OR
    (
      member_id = get_user_member_id() AND
      NOT EXISTS (
        SELECT 1 FROM family_relationships
        WHERE family_id = family_relationships.family_id
        AND member_id = get_user_member_id()
      )
    )
  );

CREATE POLICY "Only family admins can update relationships"
  ON family_relationships
  FOR UPDATE
  USING (
    is_family_admin(family_id, auth.uid()) OR
    (member_id = get_user_member_id() AND NOT is_admin)
  );

CREATE POLICY "Only family admins can delete relationships"
  ON family_relationships
  FOR DELETE
  USING (is_family_admin(family_id, auth.uid()));