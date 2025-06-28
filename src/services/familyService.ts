import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  familyName: string;
  invitedByName: string;
  email: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  expiresAt: string;
  message?: string;
}

export class FamilyService {
  /**
   * Create a new family group
   */
  static async createFamily(
    name: string,
    description?: string
  ): Promise<{ success: boolean; family?: FamilyGroup; error?: string }> {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        return { success: false, error: 'You must be logged in to create a family' };
      }
      
      // Create the family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name,
          description,
          created_by: user.id
        })
        .select()
        .single();
      
      if (familyError) {
        throw new Error(`Failed to create family: ${familyError.message}`);
      }
      
      // Add current user as admin
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'admin'
        });
      
      if (memberError) {
        throw new Error(`Failed to add you as admin: ${memberError.message}`);
      }
      
      // Update user's profile with family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: family.id })
        .eq('id', user.id);
      
      if (profileError) {
        console.warn(`Failed to update profile: ${profileError.message}`);
        // Non-critical error, continue
      }
      
      return { 
        success: true, 
        family: {
          id: family.id,
          name: family.name,
          description: family.description,
          created_by: family.created_by,
          created_at: family.created_at,
          updated_at: family.updated_at
        }
      };
    } catch (error) {
      console.error('Error creating family:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create family' 
      };
    }
  }
  
  /**
   * Get the current user's family
   */
  static async getUserFamily(): Promise<{ family: FamilyGroup | null; error?: string }> {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        return { family: null, error: 'Not authenticated' };
      }
      
      // Get user's family using the RPC function
      const { data, error } = await supabase
        .rpc('get_user_families');
      
      if (error) {
        throw new Error(`Failed to get user family: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        return { family: null };
      }
      
      // Return the first family (users typically belong to only one family)
      return { 
        family: {
          id: data[0].id,
          name: data[0].name,
          description: data[0].description,
          created_by: data[0].created_by,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at
        }
      };
    } catch (error) {
      console.error('Error getting user family:', error);
      return { 
        family: null, 
        error: error instanceof Error ? error.message : 'Failed to get user family' 
      };
    }
  }
  
  /**
   * Get all members of a family
   */
  static async getFamilyMembers(
    familyId: string
  ): Promise<{ members: FamilyMember[]; error?: string }> {
    try {
      // Get family members using the RPC function
      const { data, error } = await supabase
        .rpc('get_family_members', { p_family_id: familyId });
      
      if (error) {
        throw new Error(`Failed to get family members: ${error.message}`);
      }
      
      // Transform the data to match our FamilyMember type
      const members: FamilyMember[] = (data || []).map((member: any) => ({
        id: member.member_id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        role: member.is_admin ? 'admin' : 'member',
        avatar: member.profile_image_url,
        status: member.status
      }));
      
      return { members };
    } catch (error) {
      console.error('Error getting family members:', error);
      return { 
        members: [], 
        error: error instanceof Error ? error.message : 'Failed to get family members' 
      };
    }
  }
  
  /**
   * Invite a user to join a family
   */
  static async inviteToFamily(
    familyId: string,
    email: string,
    role: 'admin' | 'member',
    message?: string,
    relationship?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the RPC function to invite a user
      const { data, error } = await supabase
        .rpc('invite_to_family', {
          p_family_id: familyId,
          p_email: email,
          p_role: role,
          p_is_admin: role === 'admin'
        });
      
      if (error) {
        throw new Error(`Failed to invite user: ${error.message}`);
      }
      
      // Check the result
      const result = data as { success: boolean; message: string; invitation_id?: string };
      
      if (!result.success) {
        return { success: false, error: result.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error inviting to family:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to invite user' 
      };
    }
  }
  
  /**
   * Get pending invitations for the current user
   */
  static async getPendingInvitations(): Promise<{ invitations: FamilyInvitation[]; error?: string }> {
    try {
      // Get pending invitations using the RPC function
      const { data, error } = await supabase
        .rpc('get_pending_invitations');
      
      if (error) {
        throw new Error(`Failed to get invitations: ${error.message}`);
      }
      
      // Transform the data to match our FamilyInvitation type
      const invitations: FamilyInvitation[] = (data || []).map((invitation: any) => ({
        id: invitation.invitation_id,
        familyId: invitation.family_id,
        familyName: invitation.family_name,
        invitedByName: invitation.invited_by_name,
        email: invitation.email,
        role: invitation.is_admin ? 'admin' : 'member',
        status: invitation.status,
        expiresAt: invitation.expires_at,
        message: ''
      }));
      
      return { invitations };
    } catch (error) {
      console.error('Error getting invitations:', error);
      return { 
        invitations: [], 
        error: error instanceof Error ? error.message : 'Failed to get invitations' 
      };
    }
  }
  
  /**
   * Accept an invitation to join a family
   */
  static async acceptInvitation(
    invitationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the RPC function to accept an invitation
      const { data, error } = await supabase
        .rpc('accept_invitation', { p_invitation_id: invitationId });
      
      if (error) {
        throw new Error(`Failed to accept invitation: ${error.message}`);
      }
      
      // Check the result
      const result = data as { success: boolean; message: string };
      
      if (!result.success) {
        return { success: false, error: result.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to accept invitation' 
      };
    }
  }
  
  /**
   * Decline an invitation to join a family
   */
  static async declineInvitation(
    invitationId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the RPC function to decline an invitation
      const { data, error } = await supabase
        .rpc('decline_invitation', { p_invitation_id: invitationId });
      
      if (error) {
        throw new Error(`Failed to decline invitation: ${error.message}`);
      }
      
      // Check the result
      const result = data as { success: boolean; message: string };
      
      if (!result.success) {
        return { success: false, error: result.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error declining invitation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to decline invitation' 
      };
    }
  }
  
  /**
   * Update a family member's role
   */
  static async updateFamilyMember(
    familyId: string,
    memberId: string,
    updates: {
      role?: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other';
      isAdmin?: boolean;
      status?: 'active' | 'pending' | 'inactive';
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the RPC function to update a family member
      const { data, error } = await supabase
        .rpc('update_family_member', {
          p_family_id: familyId,
          p_member_id: memberId,
          p_role: updates.role,
          p_is_admin: updates.isAdmin,
          p_status: updates.status
        });
      
      if (error) {
        throw new Error(`Failed to update member: ${error.message}`);
      }
      
      // Check the result
      const result = data as { success: boolean; message: string };
      
      if (!result.success) {
        return { success: false, error: result.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating family member:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update member' 
      };
    }
  }
  
  /**
   * Remove a member from a family
   */
  static async removeFamilyMember(
    familyId: string,
    memberId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the RPC function to remove a family member
      const { data, error } = await supabase
        .rpc('remove_family_member', {
          p_family_id: familyId,
          p_member_id: memberId
        });
      
      if (error) {
        throw new Error(`Failed to remove member: ${error.message}`);
      }
      
      // Check the result
      const result = data as { success: boolean; message: string };
      
      if (!result.success) {
        return { success: false, error: result.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error removing family member:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove member' 
      };
    }
  }
  
  /**
   * Add a new family member
   */
  static async addFamilyMember(
    familyId: string,
    firstName: string,
    lastName: string,
    email: string,
    role: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other',
    isAdmin: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the RPC function to add a family member
      const { data, error } = await supabase
        .rpc('add_family_member', {
          p_family_id: familyId,
          p_first_name: firstName,
          p_last_name: lastName,
          p_email: email,
          p_role: role,
          p_is_admin: isAdmin
        });
      
      if (error) {
        throw new Error(`Failed to add member: ${error.message}`);
      }
      
      // Check the result
      const result = data as { success: boolean; message: string; member_id?: string };
      
      if (!result.success) {
        return { success: false, error: result.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error adding family member:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add member' 
      };
    }
  }
}