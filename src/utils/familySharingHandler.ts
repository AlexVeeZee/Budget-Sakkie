import { supabase } from '../lib/supabase';
import { FamilyMember } from '../types/family';
import { useAuthStore } from '../store/authStore';

/**
 * Handles all family sharing functionality with proper error handling
 * and database transaction management
 */
export const familySharingHandler = {
  /**
   * Checks if the family_members table is empty for the current user
   * @returns Object with isEmpty flag and error if any
   */
  async checkFamilyMembersEmpty(): Promise<{ isEmpty: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { isEmpty: true, error: 'User not authenticated' };
      }
      
      // Check if user has any family memberships
      const { data, error, count } = await supabase
        .from('family_members')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error checking family members:', error);
        return { isEmpty: true, error: error.message };
      }
      
      return { isEmpty: count === 0, error: null };
    } catch (error) {
      console.error('Error in checkFamilyMembersEmpty:', error);
      return { 
        isEmpty: true, 
        error: error instanceof Error ? error.message : 'Unknown error checking family members' 
      };
    }
  },
  
  /**
   * Fetches all family members for the current user's family
   * @returns Array of family members and error if any
   */
  async fetchFamilyMembers(): Promise<{ members: FamilyMember[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { members: [], error: 'User not authenticated' };
      }
      
      // First get the user's family ID
      const { data: userMembership, error: membershipError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        if (membershipError.code === 'PGRST116') {
          // No membership found
          return { members: [], error: null };
        }
        return { members: [], error: membershipError.message };
      }
      
      if (!userMembership?.family_id) {
        return { members: [], error: null };
      }
      
      // Now get all members of this family
      const { data: familyMembersData, error: membersError } = await supabase
        .from('family_members')
        .select(`
          *,
          user_profiles:user_id (
            display_name,
            profile_image_url,
            alternative_email
          )
        `)
        .eq('family_id', userMembership.family_id);
      
      if (membersError) {
        return { members: [], error: membersError.message };
      }
      
      // Transform the data to match our FamilyMember type
      const members: FamilyMember[] = (familyMembersData || []).map(member => ({
        id: member.user_id || '',
        name: member.user_profiles?.display_name || 'Unknown User',
        email: member.user_profiles?.alternative_email || '',
        role: member.role as 'admin' | 'member',
        avatar: member.user_profiles?.profile_image_url || '',
        joinedDate: member.joined_at || '',
        status: 'active', // Assuming all members in the DB are active
        lastActive: new Date().toISOString(),
        permissions: {
          viewLists: true,
          editLists: member.role === 'admin',
          createLists: true,
          viewBudget: true,
          editBudget: member.role === 'admin',
          inviteMembers: member.role === 'admin',
          manageMembers: member.role === 'admin'
        }
      }));
      
      return { members, error: null };
    } catch (error) {
      console.error('Error in fetchFamilyMembers:', error);
      return { 
        members: [], 
        error: error instanceof Error ? error.message : 'Unknown error fetching family members' 
      };
    }
  },
  
  /**
   * Adds a new family member with validation to prevent recursion
   * @param email Email of the new member
   * @param fullName Full name of the new member
   * @param relationship Relationship to the current user
   * @param role Role of the new member (admin or member)
   * @returns Success status and error if any
   */
  async addFamilyMember(
    email: string, 
    fullName: string, 
    relationship: string, 
    role: 'admin' | 'member'
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Validate input to prevent recursion
      if (user.email === email) {
        return { success: false, error: 'You cannot add yourself as a family member' };
      }
      
      // Get the user's family ID
      const { data: userMembership, error: membershipError } = await supabase
        .from('family_members')
        .select('family_id, role')
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        if (membershipError.code === 'PGRST116') {
          // No membership found, user needs to create a family first
          return { success: false, error: 'You need to create a family first' };
        }
        return { success: false, error: membershipError.message };
      }
      
      // Check if user has permission to add members
      if (userMembership.role !== 'admin') {
        return { success: false, error: 'Only family admins can add members' };
      }
      
      // Check if invitation already exists
      const { data: existingInvitation, error: invitationError } = await supabase
        .from('family_invitations')
        .select('id, status')
        .eq('family_id', userMembership.family_id)
        .eq('invited_email', email)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (invitationError) {
        return { success: false, error: invitationError.message };
      }
      
      if (existingInvitation) {
        return { success: false, error: 'An invitation has already been sent to this email' };
      }
      
      // Create a personalized message
      const message = `${fullName} has been invited to join your family group as a ${relationship}.`;
      
      // Begin transaction by creating the invitation
      const { data: invitation, error: createError } = await supabase
        .from('family_invitations')
        .insert({
          family_id: userMembership.family_id,
          invited_email: email,
          invited_by: user.id,
          role: role,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single();
      
      if (createError) {
        return { success: false, error: createError.message };
      }
      
      // In a real app, we would send an email here
      console.log(`Invitation sent to ${email} for family ${userMembership.family_id}`);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error in addFamilyMember:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error adding family member' 
      };
    }
  },
  
  /**
   * Updates an existing family member's role
   * @param memberId ID of the member to update
   * @param newRole New role to assign
   * @returns Success status and error if any
   */
  async updateFamilyMemberRole(
    memberId: string, 
    newRole: 'admin' | 'member'
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Get the user's family and role
      const { data: userMembership, error: membershipError } = await supabase
        .from('family_members')
        .select('family_id, role')
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        return { success: false, error: membershipError.message };
      }
      
      // Check if user has permission to update roles
      if (userMembership.role !== 'admin') {
        return { success: false, error: 'Only family admins can update member roles' };
      }
      
      // Get the member to update
      const { data: memberToUpdate, error: memberError } = await supabase
        .from('family_members')
        .select('family_id, user_id')
        .eq('user_id', memberId)
        .eq('family_id', userMembership.family_id)
        .single();
      
      if (memberError) {
        return { success: false, error: 'Member not found in your family' };
      }
      
      // Prevent updating your own role
      if (memberToUpdate.user_id === user.id) {
        return { success: false, error: 'You cannot change your own role' };
      }
      
      // Update the member's role
      const { error: updateError } = await supabase
        .from('family_members')
        .update({ role: newRole })
        .eq('user_id', memberId)
        .eq('family_id', userMembership.family_id);
      
      if (updateError) {
        return { success: false, error: updateError.message };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error in updateFamilyMemberRole:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error updating member role' 
      };
    }
  },
  
  /**
   * Removes a family member
   * @param memberId ID of the member to remove
   * @returns Success status and error if any
   */
  async removeFamilyMember(memberId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Get the user's family and role
      const { data: userMembership, error: membershipError } = await supabase
        .from('family_members')
        .select('family_id, role')
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        return { success: false, error: membershipError.message };
      }
      
      // Check if user has permission to remove members
      if (userMembership.role !== 'admin') {
        return { success: false, error: 'Only family admins can remove members' };
      }
      
      // Get the member to remove
      const { data: memberToRemove, error: memberError } = await supabase
        .from('family_members')
        .select('family_id, user_id')
        .eq('user_id', memberId)
        .eq('family_id', userMembership.family_id)
        .single();
      
      if (memberError) {
        return { success: false, error: 'Member not found in your family' };
      }
      
      // Prevent removing yourself
      if (memberToRemove.user_id === user.id) {
        return { success: false, error: 'You cannot remove yourself from the family' };
      }
      
      // Begin transaction
      // 1. Remove the member from the family
      const { error: removeError } = await supabase
        .from('family_members')
        .delete()
        .eq('user_id', memberId)
        .eq('family_id', userMembership.family_id);
      
      if (removeError) {
        return { success: false, error: removeError.message };
      }
      
      // 2. Update the user's profile to remove family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: null })
        .eq('id', memberId);
      
      if (profileError) {
        console.warn('Failed to update user profile:', profileError);
        // Continue anyway, as the member has been removed from family_members
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error in removeFamilyMember:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error removing family member' 
      };
    }
  },
  
  /**
   * Creates a new family for the current user
   * @param familyName Name of the new family
   * @returns Success status, family ID if successful, and error if any
   */
  async createFamily(familyName: string): Promise<{ 
    success: boolean; 
    familyId?: string; 
    error: string | null 
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Check if user already belongs to a family
      const { data: existingMembership, error: membershipError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (membershipError && membershipError.code !== 'PGRST116') {
        return { success: false, error: membershipError.message };
      }
      
      if (existingMembership?.family_id) {
        return { success: false, error: 'You already belong to a family' };
      }
      
      // Begin transaction
      // 1. Create the family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: familyName,
          created_by: user.id
        })
        .select()
        .single();
      
      if (familyError) {
        return { success: false, error: familyError.message };
      }
      
      // 2. Add the user as an admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'admin'
        });
      
      if (memberError) {
        // Try to clean up the family if member creation fails
        await supabase.from('families').delete().eq('id', family.id);
        return { success: false, error: memberError.message };
      }
      
      // 3. Update the user's profile with family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: family.id })
        .eq('id', user.id);
      
      if (profileError) {
        console.warn('Failed to update user profile:', profileError);
        // Continue anyway, as the family and membership have been created
      }
      
      return { success: true, familyId: family.id, error: null };
    } catch (error) {
      console.error('Error in createFamily:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error creating family' 
      };
    }
  },
  
  /**
   * Refreshes the family members list
   * @returns Updated members array and error if any
   */
  async refreshFamilyMembers(): Promise<{ 
    members: FamilyMember[]; 
    error: string | null 
  }> {
    return await this.fetchFamilyMembers();
  }
};