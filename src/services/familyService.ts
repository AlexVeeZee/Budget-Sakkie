import { supabase } from '../lib/supabase';
import { Family, FamilyMember, FamilyRelationship } from '../types/family';

export class FamilyService {
  /**
   * Get all families the current user belongs to
   */
  static async getUserFamilies(): Promise<{ families: Family[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_families');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { families: data || [] };
    } catch (error) {
      console.error('Error fetching user families:', error);
      return { 
        families: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch families' 
      };
    }
  }
  
  /**
   * Get user's primary family
   */
  static async getUserFamily(): Promise<{ family: Family | null; error?: string }> {
    try {
      const { families, error } = await this.getUserFamilies();
      
      if (error) {
        throw new Error(error);
      }
      
      // Return the first family or null if none exists
      const family = families.length > 0 ? families[0] : null;
      
      if (family) {
        // Get family members
        const { members } = await this.getFamilyMembers(family.family_id);
        family.members = members;
      }
      
      return { family };
    } catch (error) {
      console.error('Error fetching user family:', error);
      return { 
        family: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch family' 
      };
    }
  }
  
  /**
   * Create a new family
   */
  static async createFamily(familyName: string): Promise<{ family: Family | null; error?: string }> {
    try {
      // First create a member profile if it doesn't exist
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { family: null, error: 'User not authenticated' };
      }
      
      // Check if member exists
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('member_id')
        .eq('email', user.email)
        .maybeSingle();
      
      let memberId = existingMember?.member_id;
      
      // Create member if doesn't exist
      if (!memberId) {
        const { data: newMember, error: memberError } = await supabase
          .from('family_members')
          .insert({
            first_name: user.user_metadata?.first_name || 'User',
            last_name: user.user_metadata?.last_name || '',
            email: user.email
          })
          .select('member_id')
          .single();
        
        if (memberError) {
          throw new Error(`Failed to create member profile: ${memberError.message}`);
        }
        
        memberId = newMember.member_id;
      }
      
      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          family_name: familyName
        })
        .select()
        .single();
      
      if (familyError) {
        throw new Error(`Failed to create family: ${familyError.message}`);
      }
      
      // Add creator as admin member
      const { error: relationshipError } = await supabase
        .from('family_relationships')
        .insert({
          family_id: family.family_id,
          member_id: memberId,
          role: 'parent',
          is_admin: true,
          status: 'active'
        });
      
      if (relationshipError) {
        throw new Error(`Failed to add member to family: ${relationshipError.message}`);
      }
      
      return { family };
    } catch (error) {
      console.error('Error creating family:', error);
      return { 
        family: null, 
        error: error instanceof Error ? error.message : 'Failed to create family' 
      };
    }
  }
  
  /**
   * Get all members of a family
   */
  static async getFamilyMembers(familyId: string): Promise<{ members: FamilyMember[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .rpc('get_family_members', { p_family_id: familyId });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { members: data || [] };
    } catch (error) {
      console.error('Error fetching family members:', error);
      return { 
        members: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch family members' 
      };
    }
  }
  
  /**
   * Add a new or existing member to a family
   */
  static async addFamilyMember(
    familyId: string,
    firstName: string,
    lastName: string,
    email: string,
    role: 'parent' | 'child' | 'guardian' | 'spouse' | 'sibling' | 'other',
    isAdmin: boolean = false
  ): Promise<{ success: boolean; memberId?: string; error?: string }> {
    try {
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
        throw new Error(error.message);
      }
      
      if (!data.success) {
        return { success: false, error: data.message };
      }
      
      return { success: true, memberId: data.member_id };
    } catch (error) {
      console.error('Error adding family member:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add family member' 
      };
    }
  }
  
  /**
   * Update a family member's role or status
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
      const { data, error } = await supabase
        .rpc('update_family_member', {
          p_family_id: familyId,
          p_member_id: memberId,
          p_role: updates.role,
          p_is_admin: updates.isAdmin,
          p_status: updates.status
        });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        return { success: false, error: data.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating family member:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update family member' 
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
      const { data, error } = await supabase
        .rpc('remove_family_member', {
          p_family_id: familyId,
          p_member_id: memberId
        });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        return { success: false, error: data.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error removing family member:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove family member' 
      };
    }
  }
  
  /**
   * Get current user's member profile
   */
  static async getCurrentMemberProfile(): Promise<{ member: FamilyMember | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { member: null, error: 'User not authenticated' };
      }
      
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { member: data };
    } catch (error) {
      console.error('Error fetching member profile:', error);
      return { 
        member: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch member profile' 
      };
    }
  }
  
  /**
   * Create or update current user's member profile
   */
  static async updateMemberProfile(
    updates: {
      firstName: string;
      lastName: string;
      dateOfBirth?: string;
      profileImageUrl?: string;
    }
  ): Promise<{ success: boolean; memberId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Check if member exists
      const { data: existingMember } = await supabase
        .from('family_members')
        .select('member_id')
        .eq('email', user.email)
        .maybeSingle();
      
      if (existingMember) {
        // Update existing member
        const { error } = await supabase
          .from('family_members')
          .update({
            first_name: updates.firstName,
            last_name: updates.lastName,
            date_of_birth: updates.dateOfBirth,
            profile_image_url: updates.profileImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('member_id', existingMember.member_id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        return { success: true, memberId: existingMember.member_id };
      } else {
        // Create new member
        const { data: newMember, error } = await supabase
          .from('family_members')
          .insert({
            first_name: updates.firstName,
            last_name: updates.lastName,
            email: user.email,
            date_of_birth: updates.dateOfBirth,
            profile_image_url: updates.profileImageUrl
          })
          .select('member_id')
          .single();
        
        if (error) {
          throw new Error(error.message);
        }
        
        return { success: true, memberId: newMember.member_id };
      }
    } catch (error) {
      console.error('Error updating member profile:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update member profile' 
      };
    }
  }
  
  /**
   * Get pending invitations for the current user
   */
  static async getPendingInvitations(): Promise<{ invitations: any[]; error?: string }> {
    try {
      // This is a placeholder - in a real implementation, we would fetch invitations from the database
      // For now, we'll return an empty array
      return { invitations: [] };
    } catch (error) {
      console.error('Error fetching invitations:', error);
      return { 
        invitations: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch invitations' 
      };
    }
  }
  
  /**
   * Accept an invitation
   */
  static async acceptInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This is a placeholder - in a real implementation, we would accept the invitation in the database
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
   * Decline an invitation
   */
  static async declineInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This is a placeholder - in a real implementation, we would decline the invitation in the database
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
   * Invite to family by email
   */
  static async inviteToFamily(
    familyId: string,
    email: string,
    role: 'admin' | 'member',
    message?: string,
    relationship?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // This is a placeholder - in a real implementation, we would send an invitation
      return { success: true };
    } catch (error) {
      console.error('Error inviting to family:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send invitation' 
      };
    }
  }
}