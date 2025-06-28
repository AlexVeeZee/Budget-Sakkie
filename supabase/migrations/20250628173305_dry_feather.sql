/*
  # Family Sharing System Schema

  1. New Tables
    - `families` - Stores family groups
    - `family_members` - Stores individual member profiles
    - `family_relationships` - Junction table connecting members to families with roles
    - `family_invitations` - Stores pending invitations to join families

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Create helper functions for permission checks

  3. Changes
    - Add triggers for updated_at timestamps
    - Add functions for family management operations
*/

-- Create families table
CREATE TABLE IF NOT EXISTS families (
  family_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
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

-- Create family_invitations table
CREATE TABLE IF NOT EXISTS family_invitations (
  invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child', 'guardian', 'spouse', 'sibling', 'other')),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  invitation_token UUID DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
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

CREATE TRIGGER update_family_members_updated_at
BEFORE UPDATE ON family_members
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_relationships_updated_at
BEFORE UPDATE ON family_relationships
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_invitations_updated_at
BEFORE UPDATE ON family_invitations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Helper function to check if a user is a family admin
CREATE OR REPLACE FUNCTION is_family_admin(p_family_id UUID, p_user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_user_email TEXT;
BEGIN
  -- Get user's email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_uuid;
  
  -- Check if user is admin
  SELECT fr.is_admin INTO v_is_admin
  FROM family_relationships fr
  JOIN family_members fm ON fr.member_id = fm.member_id
  WHERE fr.family_id = p_family_id
  AND fm.email = v_user_email
  AND fr.status = 'active';
  
  RETURN COALESCE(v_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user is a family member
CREATE OR REPLACE FUNCTION is_family_member(p_family_id UUID, p_user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_member BOOLEAN;
  v_user_email TEXT;
BEGIN
  -- Get user's email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_uuid;
  
  -- Check if user is a member
  SELECT EXISTS (
    SELECT 1
    FROM family_relationships fr
    JOIN family_members fm ON fr.member_id = fm.member_id
    WHERE fr.family_id = p_family_id
    AND fm.email = v_user_email
    AND fr.status = 'active'
  ) INTO v_is_member;
  
  RETURN COALESCE(v_is_member, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all families a user belongs to
CREATE OR REPLACE FUNCTION get_user_families()
RETURNS SETOF families AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get current user's email
  v_user_email := auth.email();
  
  IF v_user_email IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
    SELECT f.*
    FROM families f
    JOIN family_relationships fr ON f.family_id = fr.family_id
    JOIN family_members fm ON fr.member_id = fm.member_id
    WHERE fm.email = v_user_email
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
DECLARE
  v_user_email TEXT;
  v_user_uuid UUID;
BEGIN
  -- Get current user
  v_user_email := auth.email();
  v_user_uuid := auth.uid();
  
  IF v_user_email IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if user has access to this family
  IF NOT is_family_member(p_family_id, v_user_uuid) THEN
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
  v_user_uuid UUID;
BEGIN
  -- Get current user
  v_user_uuid := auth.uid();
  
  IF v_user_uuid IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;
  
  -- Check if user is admin of this family
  IF NOT is_family_admin(p_family_id, v_user_uuid) THEN
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
  v_user_uuid UUID;
BEGIN
  -- Get current user
  v_user_uuid := auth.uid();
  
  IF v_user_uuid IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;
  
  -- Check if user is admin of this family
  IF NOT is_family_admin(p_family_id, v_user_uuid) THEN
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
  v_user_uuid UUID;
  v_admin_count INT;
  v_is_admin BOOLEAN;
BEGIN
  -- Get current user
  v_user_uuid := auth.uid();
  
  IF v_user_uuid IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;
  
  -- Check if user is admin of this family
  IF NOT is_family_admin(p_family_id, v_user_uuid) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Only family admins can remove members'
    );
  END IF;

  -- Check if member is an admin
  SELECT is_admin INTO v_is_admin
  FROM family_relationships
  WHERE family_id = p_family_id
  AND member_id = p_member_id;
  
  -- Count active admins in the family
  SELECT COUNT(*) INTO v_admin_count
  FROM family_relationships
  WHERE family_id = p_family_id
  AND is_admin = true
  AND status = 'active';

  -- Check if trying to remove the last admin
  IF v_is_admin AND v_admin_count <= 1 THEN
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

-- Function to get pending invitations for current user
CREATE OR REPLACE FUNCTION get_pending_invitations()
RETURNS TABLE (
  invitation_id UUID,
  family_id UUID,
  family_name TEXT,
  invited_by UUID,
  invited_by_name TEXT,
  email TEXT,
  role TEXT,
  is_admin BOOLEAN,
  status TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get current user's email
  v_user_email := auth.email();
  
  IF v_user_email IS NULL THEN
    RETURN;
  END IF;
  
  RETURN QUERY
    SELECT 
      fi.invitation_id,
      fi.family_id,
      f.family_name,
      fi.invited_by,
      COALESCE(fm.first_name || ' ' || fm.last_name, 'Unknown User') AS invited_by_name,
      fi.email,
      fi.role,
      fi.is_admin,
      fi.status,
      fi.expires_at,
      fi.created_at
    FROM family_invitations fi
    JOIN families f ON fi.family_id = f.family_id
    LEFT JOIN auth.users u ON fi.invited_by = u.id
    LEFT JOIN family_members fm ON u.email = fm.email
    WHERE fi.email = v_user_email
    AND fi.status = 'pending'
    AND fi.expires_at > now()
    ORDER BY fi.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept an invitation
CREATE OR REPLACE FUNCTION accept_invitation(p_invitation_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_uuid UUID;
  v_user_email TEXT;
  v_invitation RECORD;
  v_member_id UUID;
BEGIN
  -- Get current user
  v_user_uuid := auth.uid();
  v_user_email := auth.email();
  
  IF v_user_uuid IS NULL OR v_user_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;
  
  -- Get the invitation
  SELECT * INTO v_invitation
  FROM family_invitations
  WHERE invitation_id = p_invitation_id
  AND email = v_user_email
  AND status = 'pending'
  AND expires_at > now();
  
  IF v_invitation IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid or expired invitation'
    );
  END IF;
  
  -- Check if user has a member profile
  SELECT member_id INTO v_member_id
  FROM family_members
  WHERE email = v_user_email;
  
  -- Create member profile if it doesn't exist
  IF v_member_id IS NULL THEN
    INSERT INTO family_members (
      first_name,
      last_name,
      email
    ) VALUES (
      COALESCE(split_part(v_user_email, '@', 1), 'User'),
      '',
      v_user_email
    )
    RETURNING member_id INTO v_member_id;
  END IF;
  
  -- Add member to family
  INSERT INTO family_relationships (
    family_id,
    member_id,
    role,
    is_admin,
    status
  ) VALUES (
    v_invitation.family_id,
    v_member_id,
    v_invitation.role,
    v_invitation.is_admin,
    'active'
  );
  
  -- Update invitation status
  UPDATE family_invitations
  SET status = 'accepted',
      updated_at = now()
  WHERE invitation_id = p_invitation_id;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Invitation accepted successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline an invitation
CREATE OR REPLACE FUNCTION decline_invitation(p_invitation_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get current user's email
  v_user_email := auth.email();
  
  IF v_user_email IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;
  
  -- Update invitation status
  UPDATE family_invitations
  SET status = 'declined',
      updated_at = now()
  WHERE invitation_id = p_invitation_id
  AND email = v_user_email
  AND status = 'pending';
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Invalid invitation'
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Invitation declined successfully'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invite a user to a family
CREATE OR REPLACE FUNCTION invite_to_family(
  p_family_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_is_admin BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
  v_user_uuid UUID;
  v_invitation_id UUID;
BEGIN
  -- Get current user
  v_user_uuid := auth.uid();
  
  IF v_user_uuid IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Not authenticated'
    );
  END IF;
  
  -- Check if user is admin of this family
  IF NOT is_family_admin(p_family_id, v_user_uuid) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Only family admins can send invitations'
    );
  END IF;
  
  -- Check if invitation already exists
  IF EXISTS (
    SELECT 1 FROM family_invitations
    WHERE family_id = p_family_id
    AND email = p_email
    AND status = 'pending'
    AND expires_at > now()
  ) THEN
    RETURN json_build_object(
      'success', false,
      'message', 'An invitation has already been sent to this email'
    );
  END IF;
  
  -- Create invitation
  INSERT INTO family_invitations (
    family_id,
    invited_by,
    email,
    role,
    is_admin
  ) VALUES (
    p_family_id,
    v_user_uuid,
    p_email,
    p_role,
    p_is_admin
  )
  RETURNING invitation_id INTO v_invitation_id;
  
  -- In a real app, we would send an email here
  
  RETURN json_build_object(
    'success', true,
    'message', 'Invitation sent successfully',
    'invitation_id', v_invitation_id
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
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Family admins can update families" ON families
  FOR UPDATE
  USING (is_family_admin(family_id, auth.uid()));

CREATE POLICY "Family admins can delete families" ON families
  FOR DELETE
  USING (is_family_admin(family_id, auth.uid()));

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
    ) OR email = auth.email()
  );

CREATE POLICY "Users can create their own member profile" ON family_members
  FOR INSERT
  WITH CHECK (email = auth.email());

CREATE POLICY "Users can update their own member profile" ON family_members
  FOR UPDATE
  USING (email = auth.email());

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
  USING (is_family_admin(family_id, auth.uid()));

-- Create RLS policies for family_invitations table
CREATE POLICY "Users can view their own invitations" ON family_invitations
  FOR SELECT
  USING (email = auth.email());

CREATE POLICY "Family admins can create invitations" ON family_invitations
  FOR INSERT
  WITH CHECK (is_family_admin(family_id, auth.uid()));

CREATE POLICY "Family admins can update invitations" ON family_invitations
  FOR UPDATE
  USING (is_family_admin(family_id, auth.uid()));

CREATE POLICY "Users can update their own invitations" ON family_invitations
  FOR UPDATE
  USING (email = auth.email());