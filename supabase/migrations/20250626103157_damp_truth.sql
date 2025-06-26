/*
  # Enhanced Family Sharing System

  1. New Tables
    - `family_invitations` - Track pending family invitations
    - `shared_shopping_lists` - Link shopping lists to families with permissions
    - `family_activity_log` - Track family-related activities

  2. Enhanced Tables
    - Update `family_members` with enhanced permissions
    - Add indexes for better performance
    - Add proper constraints and validation

  3. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for family data access
    - Ensure proper permission checking

  4. Functions
    - Helper functions for permission checking
    - Family invitation management
    - Activity logging
*/

-- Create family invitations table
CREATE TABLE IF NOT EXISTS family_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES families(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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
  list_id uuid NOT NULL, -- Reference to shopping list (external table)
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
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type text NOT NULL CHECK (activity_type IN (
    'member_joined', 'member_left', 'member_role_changed', 
    'list_shared', 'list_unshared', 'invitation_sent', 
    'invitation_accepted', 'invitation_declined'
  )),
  activity_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add enhanced permissions to family_members if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'family_members' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE family_members ADD COLUMN permissions jsonb DEFAULT '{
      "view_lists": true,
      "edit_lists": true,
      "create_lists": true,
      "invite_members": false,
      "manage_members": false,
      "view_budget": true,
      "edit_budget": false
    }'::jsonb;
  END IF;
END $$;

-- Update permissions based on role
UPDATE family_members 
SET permissions = CASE 
  WHEN role = 'admin' THEN '{
    "view_lists": true,
    "edit_lists": true,
    "create_lists": true,
    "invite_members": true,
    "manage_members": true,
    "view_budget": true,
    "edit_budget": true
  }'::jsonb
  ELSE '{
    "view_lists": true,
    "edit_lists": true,
    "create_lists": true,
    "invite_members": false,
    "manage_members": false,
    "view_budget": true,
    "edit_budget": false
  }'::jsonb
END
WHERE permissions IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_invitations_family_id ON family_invitations(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invitations_email ON family_invitations(invited_email);
CREATE INDEX IF NOT EXISTS idx_family_invitations_token ON family_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_family_invitations_status ON family_invitations(status);
CREATE INDEX IF NOT EXISTS idx_shared_shopping_lists_family_id ON shared_shopping_lists(family_id);
CREATE INDEX IF NOT EXISTS idx_shared_shopping_lists_list_id ON shared_shopping_lists(list_id);
CREATE INDEX IF NOT EXISTS idx_family_activity_log_family_id ON family_activity_log(family_id);
CREATE INDEX IF NOT EXISTS idx_family_activity_log_user_id ON family_activity_log(user_id);

-- Enable Row Level Security
ALTER TABLE family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_activity_log ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is family admin
CREATE OR REPLACE FUNCTION is_family_admin(family_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = family_uuid 
    AND user_id = user_uuid 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is family member
CREATE OR REPLACE FUNCTION is_family_member(family_uuid uuid, user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = family_uuid 
    AND user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get user's family permissions
CREATE OR REPLACE FUNCTION get_family_permissions(family_uuid uuid, user_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  user_permissions jsonb;
BEGIN
  SELECT permissions INTO user_permissions
  FROM family_members 
  WHERE family_id = family_uuid 
  AND user_id = user_uuid;
  
  RETURN COALESCE(user_permissions, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for family_invitations
CREATE POLICY "Family admins can manage invitations"
  ON family_invitations
  FOR ALL
  TO authenticated
  USING (is_family_admin(family_id, auth.uid()));

CREATE POLICY "Users can view invitations sent to them"
  ON family_invitations
  FOR SELECT
  TO authenticated
  USING (invited_email = auth.email());

CREATE POLICY "Users can update their own invitations"
  ON family_invitations
  FOR UPDATE
  TO authenticated
  USING (invited_email = auth.email())
  WITH CHECK (invited_email = auth.email());

-- RLS Policies for shared_shopping_lists
CREATE POLICY "Family members can view shared lists"
  ON shared_shopping_lists
  FOR SELECT
  TO authenticated
  USING (is_family_member(family_id, auth.uid()));

CREATE POLICY "Family admins can manage shared lists"
  ON shared_shopping_lists
  FOR ALL
  TO authenticated
  USING (is_family_admin(family_id, auth.uid()));

CREATE POLICY "List owners can share their lists"
  ON shared_shopping_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "List owners can unshare their lists"
  ON shared_shopping_lists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = shared_by);

-- RLS Policies for family_activity_log
CREATE POLICY "Family members can view activity log"
  ON family_activity_log
  FOR SELECT
  TO authenticated
  USING (is_family_member(family_id, auth.uid()));

CREATE POLICY "System can insert activity log"
  ON family_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Enhanced RLS Policies for existing tables
DROP POLICY IF EXISTS "Family admins can manage members" ON family_members;
CREATE POLICY "Family admins can manage members"
  ON family_members
  FOR ALL
  TO authenticated
  USING (
    is_family_admin(family_id, auth.uid()) OR 
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can join families when invited" ON family_members;
CREATE POLICY "Users can join families when invited"
  ON family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM family_invitations 
      WHERE family_id = family_members.family_id 
      AND invited_email = auth.email() 
      AND status = 'accepted'
    )
  );

-- Create function to handle invitation acceptance
CREATE OR REPLACE FUNCTION accept_family_invitation(invitation_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  invitation_record family_invitations%ROWTYPE;
  new_member_id uuid;
  result jsonb;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM family_invitations 
  WHERE id = invitation_uuid 
  AND invited_email = auth.email()
  AND status = 'pending'
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Invalid or expired invitation"}'::jsonb;
  END IF;
  
  -- Check if user is already a family member
  IF EXISTS (
    SELECT 1 FROM family_members 
    WHERE family_id = invitation_record.family_id 
    AND user_id = auth.uid()
  ) THEN
    RETURN '{"success": false, "error": "Already a family member"}'::jsonb;
  END IF;
  
  -- Add user to family
  INSERT INTO family_members (family_id, user_id, role)
  VALUES (invitation_record.family_id, auth.uid(), invitation_record.role)
  RETURNING id INTO new_member_id;
  
  -- Update invitation status
  UPDATE family_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = invitation_uuid;
  
  -- Log activity
  INSERT INTO family_activity_log (family_id, user_id, activity_type, activity_data)
  VALUES (
    invitation_record.family_id, 
    auth.uid(), 
    'member_joined',
    jsonb_build_object('role', invitation_record.role, 'invited_by', invitation_record.invited_by)
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'member_id', new_member_id,
    'family_id', invitation_record.family_id,
    'role', invitation_record.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send family invitation
CREATE OR REPLACE FUNCTION send_family_invitation(
  family_uuid uuid, 
  email_to_invite text, 
  member_role text DEFAULT 'member'
)
RETURNS jsonb AS $$
DECLARE
  invitation_id uuid;
  family_name text;
BEGIN
  -- Check if user is family admin
  IF NOT is_family_admin(family_uuid, auth.uid()) THEN
    RETURN '{"success": false, "error": "Only family admins can send invitations"}'::jsonb;
  END IF;
  
  -- Check if email is already invited or is a member
  IF EXISTS (
    SELECT 1 FROM family_invitations 
    WHERE family_id = family_uuid 
    AND invited_email = email_to_invite 
    AND status = 'pending'
  ) THEN
    RETURN '{"success": false, "error": "Invitation already sent to this email"}'::jsonb;
  END IF;
  
  -- Get family name
  SELECT name INTO family_name FROM families WHERE id = family_uuid;
  
  -- Create invitation
  INSERT INTO family_invitations (family_id, invited_email, invited_by, role)
  VALUES (family_uuid, email_to_invite, auth.uid(), member_role)
  RETURNING id INTO invitation_id;
  
  -- Log activity
  INSERT INTO family_activity_log (family_id, user_id, activity_type, activity_data)
  VALUES (
    family_uuid, 
    auth.uid(), 
    'invitation_sent',
    jsonb_build_object('invited_email', email_to_invite, 'role', member_role)
  );
  
  RETURN jsonb_build_object(
    'success', true, 
    'invitation_id', invitation_id,
    'family_name', family_name,
    'expires_at', (now() + interval '7 days')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update member permissions
CREATE OR REPLACE FUNCTION update_member_permissions(
  member_uuid uuid,
  new_permissions jsonb
)
RETURNS jsonb AS $$
DECLARE
  member_family_id uuid;
  member_role text;
BEGIN
  -- Get member details
  SELECT family_id, role INTO member_family_id, member_role
  FROM family_members 
  WHERE id = member_uuid;
  
  IF NOT FOUND THEN
    RETURN '{"success": false, "error": "Member not found"}'::jsonb;
  END IF;
  
  -- Check if user is family admin
  IF NOT is_family_admin(member_family_id, auth.uid()) THEN
    RETURN '{"success": false, "error": "Only family admins can update permissions"}'::jsonb;
  END IF;
  
  -- Update permissions
  UPDATE family_members 
  SET permissions = new_permissions, updated_at = now()
  WHERE id = member_uuid;
  
  -- Log activity
  INSERT INTO family_activity_log (family_id, user_id, activity_type, activity_data)
  VALUES (
    member_family_id, 
    auth.uid(), 
    'member_role_changed',
    jsonb_build_object('member_id', member_uuid, 'new_permissions', new_permissions)
  );
  
  RETURN '{"success": true}'::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_family_invitations_updated_at
  BEFORE UPDATE ON family_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_shopping_lists_updated_at
  BEFORE UPDATE ON shared_shopping_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
DO $$
DECLARE
  sample_family_id uuid;
  admin_user_id uuid;
BEGIN
  -- Only insert if no families exist (for testing purposes)
  IF NOT EXISTS (SELECT 1 FROM families LIMIT 1) THEN
    -- Create a sample family
    INSERT INTO families (name, created_by) 
    VALUES ('Van Der Merwe Family', auth.uid())
    RETURNING id INTO sample_family_id;
    
    -- Add creator as admin
    INSERT INTO family_members (family_id, user_id, role)
    VALUES (sample_family_id, auth.uid(), 'admin');
    
    -- Log family creation
    INSERT INTO family_activity_log (family_id, user_id, activity_type, activity_data)
    VALUES (
      sample_family_id, 
      auth.uid(), 
      'member_joined',
      '{"role": "admin", "is_creator": true}'::jsonb
    );
  END IF;
END $$;