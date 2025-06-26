/*
  # Enhanced Family Sharing System

  1. New Tables
    - `family_invitations` - Track pending invitations to join families
    - `shared_shopping_lists` - Track which lists are shared with which family members
    - `family_activity_log` - Track family member activities for transparency

  2. Enhanced Tables
    - Add more fields to existing `families` table
    - Enhance `family_members` with more detailed permissions
    - Add family-specific fields to user profiles

  3. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for family data access
    - Ensure proper permission checks for all operations

  4. Functions
    - Helper functions for family management
    - Invitation handling functions
    - Activity logging functions
*/

-- Create family invitations table
CREATE TABLE IF NOT EXISTS family_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  invitation_token uuid DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shared shopping lists table
CREATE TABLE IF NOT EXISTS shared_shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL, -- References shopping_lists table (to be created)
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  shared_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions jsonb DEFAULT '{"view": true, "edit": false, "delete": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(list_id, family_id)
);

-- Create family activity log table
CREATE TABLE IF NOT EXISTS family_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN (
    'member_joined', 'member_left', 'member_invited', 'member_role_changed',
    'list_shared', 'list_unshared', 'list_created', 'list_updated', 'list_deleted',
    'family_created', 'family_updated', 'family_deleted'
  )),
  activity_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add additional fields to families table
DO $$
BEGIN
  -- Add description field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'families' AND column_name = 'description'
  ) THEN
    ALTER TABLE families ADD COLUMN description text;
  END IF;

  -- Add family settings
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'families' AND column_name = 'settings'
  ) THEN
    ALTER TABLE families ADD COLUMN settings jsonb DEFAULT '{
      "allow_member_invites": false,
      "require_approval_for_sharing": false,
      "default_list_permissions": {"view": true, "edit": false, "delete": false}
    }'::jsonb;
  END IF;

  -- Add member count for optimization
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'families' AND column_name = 'member_count'
  ) THEN
    ALTER TABLE families ADD COLUMN member_count integer DEFAULT 1;
  END IF;
END $$;

-- Enhance family_members table with detailed permissions
DO $$
BEGIN
  -- Add permissions field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'family_members' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE family_members ADD COLUMN permissions jsonb DEFAULT '{
      "invite_members": false,
      "manage_members": false,
      "create_lists": true,
      "share_lists": true,
      "view_activity": true
    }'::jsonb;
  END IF;

  -- Add status field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'family_members' AND column_name = 'status'
  ) THEN
    ALTER TABLE family_members ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
  END IF;

  -- Add last activity timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'family_members' AND column_name = 'last_activity_at'
  ) THEN
    ALTER TABLE family_members ADD COLUMN last_activity_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_activity_log ENABLE ROW LEVEL SECURITY;

-- Family Invitations Policies
CREATE POLICY "Family admins can manage invitations"
  ON family_invitations
  FOR ALL
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view invitations sent to them"
  ON family_invitations
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

CREATE POLICY "Users can update their own invitations"
  ON family_invitations
  FOR UPDATE
  TO authenticated
  USING (email = auth.email())
  WITH CHECK (email = auth.email());

-- Shared Shopping Lists Policies
CREATE POLICY "Family members can view shared lists"
  ON shared_shopping_lists
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Family members can share lists"
  ON shared_shopping_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    ) AND shared_by = auth.uid()
  );

CREATE POLICY "List owners and family admins can manage shared lists"
  ON shared_shopping_lists
  FOR ALL
  TO authenticated
  USING (
    shared_by = auth.uid() OR
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Family Activity Log Policies
CREATE POLICY "Family members can view activity log"
  ON family_activity_log
  FOR SELECT
  TO authenticated
  USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert activity log entries"
  ON family_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON family_invitations(email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON family_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_family_invitations_status ON family_invitations(status);

CREATE INDEX IF NOT EXISTS idx_shared_shopping_lists_list_id ON shared_shopping_lists(list_id);
CREATE INDEX IF NOT EXISTS idx_shared_shopping_lists_family_id ON shared_shopping_lists(family_id);

CREATE INDEX IF NOT EXISTS idx_family_activity_log_family_id ON family_activity_log(family_id);
CREATE INDEX IF NOT EXISTS idx_family_activity_log_user_id ON family_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_family_activity_log_created_at ON family_activity_log(created_at);

-- Create function to update family member count
CREATE OR REPLACE FUNCTION update_family_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE families 
    SET member_count = member_count + 1 
    WHERE id = NEW.family_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE families 
    SET member_count = member_count - 1 
    WHERE id = OLD.family_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update member count
DROP TRIGGER IF EXISTS trigger_update_family_member_count ON family_members;
CREATE TRIGGER trigger_update_family_member_count
  AFTER INSERT OR DELETE ON family_members
  FOR EACH ROW EXECUTE FUNCTION update_family_member_count();

-- Create function to log family activities
CREATE OR REPLACE FUNCTION log_family_activity(
  p_family_id uuid,
  p_user_id uuid,
  p_activity_type text,
  p_activity_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO family_activity_log (family_id, user_id, activity_type, activity_data)
  VALUES (p_family_id, p_user_id, p_activity_type, p_activity_data);
END;
$$ LANGUAGE plpgsql;

-- Create function to handle invitation acceptance
CREATE OR REPLACE FUNCTION accept_family_invitation(
  p_invitation_token uuid
)
RETURNS jsonb AS $$
DECLARE
  v_invitation family_invitations%ROWTYPE;
  v_user_id uuid;
  v_result jsonb;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Get invitation details
  SELECT * INTO v_invitation
  FROM family_invitations
  WHERE invitation_token = p_invitation_token
    AND status = 'pending'
    AND expires_at > now()
    AND email = auth.email();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired invitation'
    );
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = v_invitation.family_id AND user_id = v_user_id
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User is already a member of this family'
    );
  END IF;
  
  -- Add user to family
  INSERT INTO family_members (family_id, user_id, role)
  VALUES (v_invitation.family_id, v_user_id, v_invitation.role);
  
  -- Update invitation status
  UPDATE family_invitations
  SET status = 'accepted', updated_at = now()
  WHERE id = v_invitation.id;
  
  -- Log activity
  PERFORM log_family_activity(
    v_invitation.family_id,
    v_user_id,
    'member_joined',
    jsonb_build_object('invited_by', v_invitation.invited_by, 'role', v_invitation.role)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'family_id', v_invitation.family_id,
    'role', v_invitation.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send family invitation
CREATE OR REPLACE FUNCTION send_family_invitation(
  p_family_id uuid,
  p_email text,
  p_role text DEFAULT 'member'
)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_invitation_id uuid;
  v_token uuid;
BEGIN
  v_user_id := auth.uid();
  
  -- Check if user has permission to invite
  IF NOT EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = p_family_id 
      AND user_id = v_user_id 
      AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Only family admins can send invitations'
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
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invitation already sent to this email'
    );
  END IF;
  
  -- Create invitation
  INSERT INTO family_invitations (family_id, invited_by, email, role)
  VALUES (p_family_id, v_user_id, p_email, p_role)
  RETURNING id, invitation_token INTO v_invitation_id, v_token;
  
  -- Log activity
  PERFORM log_family_activity(
    p_family_id,
    v_user_id,
    'member_invited',
    jsonb_build_object('email', p_email, 'role', p_role)
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'invitation_id', v_invitation_id,
    'invitation_token', v_token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update updated_at timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers for new tables
CREATE TRIGGER update_family_invitations_updated_at
  BEFORE UPDATE ON family_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_shopping_lists_updated_at
  BEFORE UPDATE ON shared_shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();