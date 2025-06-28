import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { FamilyMember, FamilyGroup, FamilyInvitation } from '../types/family';

type FamilyInvitationRow = Database['public']['Tables']['family_invitations']['Row'];
type SharedShoppingList = Database['public']['Tables']['shared_shopping_lists']['Row'];
type SharedListItem = Database['public']['Tables']['shared_list_items']['Row'];
type FamilyBudget = Database['public']['Tables']['family_budgets']['Row'];
type FamilyExpense = Database['public']['Tables']['family_expenses']['Row'];
type FamilyMemberRow = Database['public']['Tables']['family_members']['Row'];
type Family = Database['public']['Tables']['families']['Row'];

export interface FamilyWithMembers extends Family {
  family_members: (FamilyMemberRow & {
    user_profiles: {
      display_name: string | null;
      profile_image_url: string | null;
      alternative_email: string | null;
    } | null;
    relationship: string | null;
  })[];
}

export interface SharedListWithItems extends SharedShoppingList {
  shared_list_items: SharedListItem[];
  created_by_profile: {
    display_name: string | null;
  } | null;
}

export interface FamilyBudgetWithExpenses extends FamilyBudget {
  family_expenses: FamilyExpense[];
}

export class FamilyService {
  /**
   * Create a new family
   */
  static async createFamily(name: string, description?: string): Promise<{ family: Family | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { family: null, error: 'User not authenticated' };
      }

      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name,
          created_by: user.id
        })
        .select()
        .single();

      if (familyError) {
        return { family: null, error: familyError.message };
      }

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'admin',
          relationship: 'self' // Add relationship for self
        });

      if (memberError) {
        return { family: null, error: memberError.message };
      }

      // Update user profile with family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          family_id: family.id,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.warn('Failed to update user profile:', profileError);
      }

      return { family };
    } catch (error) {
      return { family: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get user's family with members
   */
  static async getUserFamily(): Promise<{ family: FamilyWithMembers | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { family: null, error: 'User not authenticated' };
      }

      // Get user's family membership
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (membershipError) {
        if (membershipError.code === 'PGRST116') {
          // No membership found, not an error
          return { family: null };
        }
        return { family: null, error: membershipError.message };
      }

      // Get family with all members
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select(`
          *,
          family_members (
            *,
            user_profiles (
              display_name,
              profile_image_url,
              alternative_email
            )
          )
        `)
        .eq('id', membership.family_id)
        .single();

      if (familyError) {
        return { family: null, error: familyError.message };
      }

      return { family: family as FamilyWithMembers };
    } catch (error) {
      return { family: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Invite user to family
   */
  static async inviteToFamily(
    familyId: string, 
    email: string, 
    role: 'admin' | 'member' = 'member',
    message?: string,
    relationship?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user is admin of the family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();

      if (membershipError || membership?.role !== 'admin') {
        return { success: false, error: 'Only family admins can send invitations' };
      }

      // Check if invitation already exists
      const { data: existingInvitation } = await supabase
        .from('family_invitations')
        .select('id')
        .eq('family_id', familyId)
        .eq('invited_email', email)
        .eq('status', 'pending')
        .single();

      if (existingInvitation) {
        return { success: false, error: 'Invitation already sent to this email' };
      }

      // Create invitation
      const { error: inviteError } = await supabase
        .from('family_invitations')
        .insert({
          family_id: familyId,
          invited_email: email,
          invited_by: user.id,
          role,
          // Store relationship in the invitation message for now
          // In a real app, we would add a relationship column to the family_invitations table
          // and then copy it to the family_members table when the invitation is accepted
        });

      if (inviteError) {
        return { success: false, error: inviteError.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get pending invitations for current user
   */
  static async getPendingInvitations(): Promise<{ invitations: FamilyInvitationRow[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { invitations: [], error: 'User not authenticated' };
      }

      const { data: invitations, error } = await supabase
        .from('family_invitations')
        .select(`
          *,
          families (
            name,
            created_by
          ),
          invited_by_profile:user_profiles!family_invitations_invited_by_fkey (
            display_name
          )
        `)
        .eq('invited_email', user.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (error) {
        return { invitations: [], error: error.message };
      }

      return { invitations: invitations || [] };
    } catch (error) {
      return { invitations: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Accept family invitation
   */
  static async acceptInvitation(invitationId: string, relationship?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get the invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (invitationError) {
        return { success: false, error: invitationError.message };
      }

      if (!invitation) {
        return { success: false, error: 'Invitation not found' };
      }

      if (invitation.status !== 'pending') {
        return { success: false, error: 'Invitation is no longer pending' };
      }

      if (invitation.invited_email !== user.email) {
        return { success: false, error: 'This invitation is not for your email address' };
      }

      if (new Date(invitation.expires_at) < new Date()) {
        return { success: false, error: 'Invitation has expired' };
      }

      // Begin a transaction
      // 1. Update invitation status
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // 2. Add user to family members with relationship
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: invitation.family_id,
          user_id: user.id,
          role: invitation.role,
          relationship: relationship || null // Store the relationship
        });

      if (memberError) {
        return { success: false, error: memberError.message };
      }

      // 3. Update user profile with family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: invitation.family_id })
        .eq('id', user.id);

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Decline family invitation
   */
  static async declineInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get the invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (invitationError) {
        return { success: false, error: invitationError.message };
      }

      if (!invitation) {
        return { success: false, error: 'Invitation not found' };
      }

      if (invitation.invited_email !== user.email) {
        return { success: false, error: 'This invitation is not for your email address' };
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update family member role
   */
  static async updateMemberRole(familyId: string, userId: string, role: 'admin' | 'member'): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if current user is admin
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();

      if (membershipError || membership?.role !== 'admin') {
        return { success: false, error: 'Only family admins can change member roles' };
      }

      const { error } = await supabase
        .from('family_members')
        .update({ role })
        .eq('family_id', familyId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update family member relationship
   */
  static async updateMemberRelationship(familyId: string, userId: string, relationship: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if current user is admin
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();

      if (membershipError || membership?.role !== 'admin') {
        return { success: false, error: 'Only family admins can update member details' };
      }

      const { error } = await supabase
        .from('family_members')
        .update({ relationship })
        .eq('family_id', familyId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Remove family member
   */
  static async removeFamilyMember(familyId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if current user is admin
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();

      if (membershipError || membership?.role !== 'admin') {
        return { success: false, error: 'Only family admins can remove members' };
      }

      // Remove family member
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update user profile to remove family_id
      await supabase
        .from('user_profiles')
        .update({ family_id: null })
        .eq('id', userId);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get family member details
   */
  static async getFamilyMember(familyId: string, userId: string): Promise<{ member: FamilyMember | null; error?: string }> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        return { member: null, error: 'User not authenticated' };
      }

      // Check if current user is in the same family
      const { data: currentMembership, error: currentMembershipError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', currentUser.id)
        .single();

      if (currentMembershipError || currentMembership?.family_id !== familyId) {
        return { member: null, error: 'You are not a member of this family' };
      }

      // Get member details
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select(`
          *,
          user_profiles:user_id (
            display_name,
            profile_image_url,
            alternative_email
          )
        `)
        .eq('family_id', familyId)
        .eq('user_id', userId)
        .single();

      if (memberError) {
        return { member: null, error: memberError.message };
      }

      // Convert to FamilyMember type
      const member: FamilyMember = {
        id: memberData.user_id || '',
        name: memberData.user_profiles?.display_name || 'Unknown User',
        email: memberData.user_profiles?.alternative_email || '',
        role: memberData.role as 'admin' | 'member',
        avatar: memberData.user_profiles?.profile_image_url || '',
        joinedDate: memberData.joined_at || '',
        status: 'active', // Assuming all members in the DB are active
        lastActive: new Date().toISOString(),
        relationship: memberData.relationship || undefined,
        permissions: {
          viewLists: true,
          editLists: memberData.role === 'admin',
          createLists: true,
          viewBudget: true,
          editBudget: memberData.role === 'admin',
          inviteMembers: memberData.role === 'admin',
          manageMembers: memberData.role === 'admin'
        }
      };

      return { member };
    } catch (error) {
      return { member: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update family member details
   */
  static async updateFamilyMember(
    familyId: string, 
    userId: string, 
    updates: { 
      displayName?: string; 
      relationship?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if current user is admin
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', currentUser.id)
        .single();

      if (membershipError || membership?.role !== 'admin') {
        return { success: false, error: 'Only family admins can update member details' };
      }

      // Update user profile if displayName is provided
      if (updates.displayName) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ display_name: updates.displayName })
          .eq('id', userId);

        if (profileError) {
          return { success: false, error: profileError.message };
        }
      }

      // Update relationship if provided
      if (updates.relationship) {
        const { error: relationshipError } = await supabase
          .from('family_members')
          .update({ relationship: updates.relationship })
          .eq('family_id', familyId)
          .eq('user_id', userId);

        if (relationshipError) {
          return { success: false, error: relationshipError.message };
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}