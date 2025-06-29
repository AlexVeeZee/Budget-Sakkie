/*
  # Family Management API Functions

  1. New Functions
    - `get_user_families` - Get all families a user belongs to
    - `get_family_members` - Get all members of a family
    - `add_family_member` - Add a new or existing member to a family
    - `update_family_member` - Update a family member's role or status
    - `remove_family_member` - Remove a member from a family
*/

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
BEGIN
  -- Check if user is admin of this family
  IF NOT is_family_admin(p_family_id, auth.uid()) THEN
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
BEGIN
  -- Check if user is admin of this family
  IF NOT is_family_admin(p_family_id, auth.uid()) THEN
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
BEGIN
  -- Check if user is admin of this family
  IF NOT is_family_admin(p_family_id, auth.uid()) THEN
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