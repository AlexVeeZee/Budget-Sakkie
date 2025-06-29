import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface FamilyWithMembers {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  relationship?: string;
  permissions: {
    viewLists: boolean;
    editLists: boolean;
    createLists: boolean;
    viewBudget: boolean;
    editBudget: boolean;
    inviteMembers: boolean;
    manageMembers: boolean;
  };
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

export interface SharedListWithItems {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  shared_list_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    completed: boolean;
    priority: string;
    notes?: string;
    completed_by?: string;
    completed_at?: string;
  }>;
}

export interface FamilyBudgetWithExpenses {
  id: string;
  name: string;
  total_amount: number;
  spent_amount: number;
  currency: string;
  period_type: string;
  start_date: string;
  end_date: string;
  expenses: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    expense_date: string;
  }>;
}

export class FamilyService {
 /**
 * Get the current user's family
 */
static async getUserFamily(): Promise<{ family: FamilyWithMembers | null; error?: string }> {
  try {
    const authState = useAuthStore.getState();
    const { user } = authState;
    
    if (!user || !user.id) {
      return { family: null, error: 'Not authenticated' };
    }
    
    // Get user's family using the RPC function
    const { data, error } = await supabase
      .rpc('get_user_families');
    
    if (error) {
      throw new Error(`Failed to get user family: ${error.message}`);
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { family: null };
    }
    
    // Get the first family's members
    const familyData = data[0];
    if (!familyData || !familyData.family_id) {
      return { family: null };
    }
    
    // Add additional safety check for familyData.id
    let members = [];
    try {
      const membersResult = await this.getFamilyMembers(familyData.family_id);
      if (membersResult && !membersResult.error) {
        members = membersResult.members || [];
      } else {
        console.warn('Error fetching family members:', membersResult?.error);
      }
    } catch (membersError) {
      console.warn('Error fetching family members:', membersError);
    }
    
    // Return the family with members
    return { 
      family: {
        id: familyData.family_id,
        name: familyData.family_name || 'Unnamed Family',
        description: familyData.description,
        createdBy: familyData.created_by,
        createdAt: familyData.created_at,
        updatedAt: familyData.updated_at,
        members: members
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
   * Get all families the user belongs to
   */
  static async getUserFamilies(): Promise<{ families: Array<any>; error?: string }> {
    try {
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id) {
        return { families: [], error: 'Not authenticated' };
      }
      
      // Get user's families
      const { data, error } = await supabase
        .from('families')
        .select(`
          family_id,
          family_name,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id);
      
      if (error) {
        throw new Error(`Failed to get user families: ${error.message}`);
      }
      
      return { families: data || [] };
    } catch (error) {
      console.error('Error getting user families:', error);
      return { 
        families: [], 
        error: error instanceof Error ? error.message : 'Failed to get user families' 
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
      if (!familyId) {
        return { members: [], error: 'Family ID is required' };
      }
      
      // Get family members using the RPC function
      const { data, error } = await supabase
        .rpc('get_family_members', { p_family_id: familyId });
      
      if (error) {
        throw new Error(`Failed to get family members: ${error.message}`);
      }
      
      // Transform the data to match our FamilyMember type
      const members: FamilyMember[] = (data || []).map((member: any) => ({
        id: member.member_id,
        name: `${member.first_name || ''} ${member.last_name || ''}`.trim() || 'Unknown User',
        email: member.email || '',
        role: member.is_admin ? 'admin' : 'member',
        avatar: member.profile_image_url,
        status: member.status || 'active',
        joinedDate: member.joined_at || new Date().toISOString(),
        relationship: member.relationship,
        permissions: {
          viewLists: true,
          editLists: member.is_admin || false,
          createLists: true,
          viewBudget: true,
          editBudget: member.is_admin || false,
          inviteMembers: member.is_admin || false,
          manageMembers: member.is_admin || false
        }
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
   * Create a new family
   */
  static async createFamily(
    name: string,
    description?: string
  ): Promise<{ success: boolean; family?: FamilyGroup; error?: string }> {
    try {
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id) {
        return { success: false, error: 'You must be logged in to create a family' };
      }
      
      // Create the family
      const { data: familyData, error: familyError } = await supabase
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
      
      if (!familyData || !familyData.id) {
        throw new Error('Failed to create family: No data returned');
      }
      
      // Add current user as admin
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyData.id,
          user_id: user.id,
          role: 'admin'
        });
      
      if (memberError) {
        throw new Error(`Failed to add you as admin: ${memberError.message}`);
      }
      
      // Update user's profile with family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: familyData.id })
        .eq('id', user.id);
      
      if (profileError) {
        console.warn(`Failed to update profile: ${profileError.message}`);
        // Non-critical error, continue
      }
      
      return { 
        success: true, 
        family: {
          id: familyData.id,
          name: familyData.name,
          description: familyData.description,
          created_by: familyData.created_by,
          created_at: familyData.created_at,
          updated_at: familyData.updated_at
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
   * Delete a family group
   */
  static async deleteFamily(
    familyId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id) {
        return { success: false, error: 'You must be logged in to delete a family' };
      }
      
      // Check if user is admin of the family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error(`Failed to verify your membership: ${membershipError.message}`);
      }
      
      if (!membership || membership.role !== 'admin') {
        return { success: false, error: 'Only family admins can delete the family group' };
      }
      
      // Begin transaction - delete in the following order:
      
      // 1. Delete family invitations
      const { error: invitationsError } = await supabase
        .from('family_invitations')
        .delete()
        .eq('family_id', familyId);
      
      if (invitationsError) {
        console.warn(`Error deleting invitations: ${invitationsError.message}`);
        // Continue anyway
      }
      
      // 2. Delete shared list items
      const { data: sharedLists, error: listsQueryError } = await supabase
        .from('shared_shopping_lists')
        .select('id')
        .eq('family_id', familyId);
      
      if (!listsQueryError && sharedLists && sharedLists.length > 0) {
        const listIds = sharedLists.map(list => list.id);
        
        // Delete items from all lists
        const { error: itemsError } = await supabase
          .from('shared_list_items')
          .delete()
          .in('list_id', listIds);
        
        if (itemsError) {
          console.warn(`Error deleting list items: ${itemsError.message}`);
          // Continue anyway
        }
        
        // Delete list collaborations
        const { error: collabsError } = await supabase
          .from('list_collaborations')
          .delete()
          .in('list_id', listIds);
        
        if (collabsError) {
          console.warn(`Error deleting list collaborations: ${collabsError.message}`);
          // Continue anyway
        }
        
        // Delete the lists themselves
        const { error: listsError } = await supabase
          .from('shared_shopping_lists')
          .delete()
          .eq('family_id', familyId);
        
        if (listsError) {
          console.warn(`Error deleting shared lists: ${listsError.message}`);
          // Continue anyway
        }
      }
      
      // 3. Delete family expenses
      const { error: expensesError } = await supabase
        .from('family_expenses')
        .delete()
        .eq('family_id', familyId);
      
      if (expensesError) {
        console.warn(`Error deleting family expenses: ${expensesError.message}`);
        // Continue anyway
      }
      
      // 4. Delete family budgets
      const { error: budgetsError } = await supabase
        .from('family_budgets')
        .delete()
        .eq('family_id', familyId);
      
      if (budgetsError) {
        console.warn(`Error deleting family budgets: ${budgetsError.message}`);
        // Continue anyway
      }
      
      // 5. Update user profiles to remove family_id
      const { error: profilesError } = await supabase
        .from('user_profiles')
        .update({ family_id: null })
        .eq('family_id', familyId);
      
      if (profilesError) {
        console.warn(`Error updating user profiles: ${profilesError.message}`);
        // Continue anyway
      }
      
      // 6. Delete family members
      const { error: membersError } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId);
      
      if (membersError) {
        throw new Error(`Failed to delete family members: ${membersError.message}`);
      }
      
      // 7. Finally, delete the family itself
      const { error: familyError } = await supabase
        .from('families')
        .delete()
        .eq('id', familyId);
      
      if (familyError) {
        throw new Error(`Failed to delete family: ${familyError.message}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting family:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete family' 
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
  ): Promise<{ success: boolean; invitation?: FamilyInvitation; error?: string }> {
    try {
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id) {
        return { success: false, error: 'You must be logged in to invite members' };
      }
      
      // Check if user is admin of the family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error(`Failed to verify your membership: ${membershipError.message}`);
      }
      
      if (!membership || membership.role !== 'admin') {
        return { success: false, error: 'Only family admins can invite members' };
      }
      
      // Get family name
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('name')
        .eq('id', familyId)
        .single();
      
      if (familyError) {
        throw new Error(`Failed to get family details: ${familyError.message}`);
      }
      
      if (!family) {
        throw new Error('Family not found');
      }
      
      // Create invitation
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // 7 days from now
      
      // Generate a random token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const { data: invitation, error: inviteError } = await supabase
        .from('family_invitations')
        .insert({
          family_id: familyId,
          invited_by: user.id,
          email: email,
          role: role,
          token: token,
          expires_at: expiryDate.toISOString(),
          message: message,
          status: 'pending'
        })
        .select()
        .single();
      
      if (inviteError) {
        throw new Error(`Failed to create invitation: ${inviteError.message}`);
      }
      
      if (!invitation) {
        throw new Error('Failed to create invitation: No data returned');
      }
      
      // Get inviter's display name
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      
      const inviterName = userProfile?.display_name || user.displayName || user.username || 'A family member';
      
      // Send invitation email
      try {
        await fetch('https://mglcyjyvluqqofarpobx.supabase.co/functions/v1/send-family-invitation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nbGN5anl2bHVxcW9mYXJwb2J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0NTQ3MTksImV4cCI6MjA1MTAzMDcxOX0.0T3XJdLLj9p7v-T1nU9TILQo1CgRB7WtQF2_GJzuHdE'
          },
          body: JSON.stringify({
            familyId: invitation.family_id,
            invitedEmail: invitation.email,
            inviterName: inviterName,
            familyName: family.name,
            invitationToken: invitation.token
          })
        });
      } catch (error) {
        console.log('Email sending failed:', error);
      }
      
      return { 
        success: true,
        invitation: {
          id: invitation.id,
          familyId: invitation.family_id,
          familyName: family.name,
          invitedByName: inviterName,
          email: invitation.email,
          role: invitation.role,
          status: 'pending',
          expiresAt: invitation.expires_at,
          message: invitation.message
        }
      };
    } catch (error) {
      console.error('Error inviting to family:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to invite member' 
      };
    }
  }
  
  /**
   * Get pending invitations for the current user
   */
  static async getPendingInvitations(): Promise<{ invitations: FamilyInvitation[]; error?: string }> {
    try {
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.email) {
        return { invitations: [], error: 'Not authenticated' };
      }
      
      // Get pending invitations
      const { data, error } = await supabase
        .from('family_invitations')
        .select(`
          id,
          family_id,
          invited_by,
          role,
          token,
          expires_at,
          message,
          families:family_id(name),
          inviters:invited_by(display_name)
        `)
        .eq('email', user.email)
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString());
      
      if (error) {
        throw new Error(`Failed to get invitations: ${error.message}`);
      }
      
      // Transform the data to match our FamilyInvitation type
      const invitations: FamilyInvitation[] = (data || []).map((invitation: any) => ({
        id: invitation.id,
        familyId: invitation.family_id,
        familyName: invitation.families?.name || 'Unknown Family',
        invitedByName: invitation.inviters?.display_name || 'Unknown User',
        email: user.email,
        role: invitation.role,
        status: 'pending',
        expiresAt: invitation.expires_at,
        message: invitation.message
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
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id || !user.email) {
        return { success: false, error: 'You must be logged in to accept invitations' };
      }
      
      // Get the invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('family_invitations')
        .select('family_id, role, email, status, expires_at')
        .eq('id', invitationId)
        .single();
      
      if (inviteError) {
        throw new Error(`Failed to get invitation: ${inviteError.message}`);
      }
      
      if (!invitation) {
        return { success: false, error: 'Invitation not found' };
      }
      
      // Check if invitation is valid
      if (invitation.status !== 'pending') {
        return { success: false, error: 'This invitation has already been processed' };
      }
      
      if (invitation.email !== user.email) {
        return { success: false, error: 'This invitation is not for your email address' };
      }
      
      if (new Date(invitation.expires_at) < new Date()) {
        return { success: false, error: 'This invitation has expired' };
      }
      
      // Begin transaction
      // 1. Add user to family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: invitation.family_id,
          user_id: user.id,
          role: invitation.role
        });
      
      if (memberError) {
        throw new Error(`Failed to add you to family: ${memberError.message}`);
      }
      
      // 2. Update invitation status
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);
      
      if (updateError) {
        throw new Error(`Failed to update invitation: ${updateError.message}`);
      }
      
      // 3. Update user's profile with family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: invitation.family_id })
        .eq('id', user.id);
      
      if (profileError) {
        console.warn(`Failed to update profile: ${profileError.message}`);
        // Non-critical error, continue
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
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.email) {
        return { success: false, error: 'You must be logged in to decline invitations' };
      }
      
      // Get the invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('family_invitations')
        .select('email, status')
        .eq('id', invitationId)
        .single();
      
      if (inviteError) {
        throw new Error(`Failed to get invitation: ${inviteError.message}`);
      }
      
      if (!invitation) {
        return { success: false, error: 'Invitation not found' };
      }
      
      // Check if invitation is valid
      if (invitation.status !== 'pending') {
        return { success: false, error: 'This invitation has already been processed' };
      }
      
      if (invitation.email !== user.email) {
        return { success: false, error: 'This invitation is not for your email address' };
      }
      
      // Update invitation status
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);
      
      if (updateError) {
        throw new Error(`Failed to update invitation: ${updateError.message}`);
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
      isAdmin?: boolean;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id) {
        return { success: false, error: 'You must be logged in to update members' };
      }
      
      // Check if user is admin of the family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error(`Failed to verify your membership: ${membershipError.message}`);
      }
      
      if (!membership || membership.role !== 'admin') {
        return { success: false, error: 'Only family admins can update members' };
      }
      
      // Update the member's role
      const updateData: any = {};
      if (updates.isAdmin !== undefined) {
        updateData.role = updates.isAdmin ? 'admin' : 'member';
      }
      
      const { error: updateError } = await supabase
        .from('family_members')
        .update(updateData)
        .eq('family_id', familyId)
        .eq('user_id', memberId);
      
      if (updateError) {
        throw new Error(`Failed to update member: ${updateError.message}`);
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
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id) {
        return { success: false, error: 'You must be logged in to remove members' };
      }
      
      // Check if user is admin of the family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error(`Failed to verify your membership: ${membershipError.message}`);
      }
      
      if (!membership || membership.role !== 'admin') {
        return { success: false, error: 'Only family admins can remove members' };
      }
      
      // Prevent removing yourself
      if (memberId === user.id) {
        return { success: false, error: 'You cannot remove yourself from the family' };
      }
      
      // Remove the member
      const { error: removeError } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', memberId);
      
      if (removeError) {
        throw new Error(`Failed to remove member: ${removeError.message}`);
      }
      
      // Update the member's profile to remove family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: null })
        .eq('id', memberId);
      
      if (profileError) {
        console.warn(`Failed to update profile: ${profileError.message}`);
        // Non-critical error, continue
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
   * Get all shared shopping lists for a family
   */
  static async getFamilyShoppingLists(
    familyId: string
  ): Promise<{ lists: SharedListWithItems[]; error?: string }> {
    try {
      if (!familyId) {
        return { lists: [], error: 'Family ID is required' };
      }
      
      // Get all shared lists for the family
      const { data, error } = await supabase
        .from('shared_shopping_lists')
        .select(`
          *,
          shared_list_items(*)
        `)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to get shopping lists: ${error.message}`);
      }
      
      return { lists: data || [] };
    } catch (error) {
      console.error('Error getting shopping lists:', error);
      return { 
        lists: [], 
        error: error instanceof Error ? error.message : 'Failed to get shopping lists' 
      };
    }
  }
  
  /**
   * Create a new shared shopping list
   */
  static async createSharedList(
    familyId: string,
    name: string,
    description?: string,
    budget?: number
  ): Promise<{ list?: SharedListWithItems; error?: string }> {
    try {
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id) {
        return { error: 'You must be logged in to create a list' };
      }
      
      if (!familyId) {
        return { error: 'Family ID is required' };
      }
      
      // Create the list
      const { data, error } = await supabase
        .from('shared_shopping_lists')
        .insert({
          name,
          description,
          family_id: familyId,
          created_by: user.id,
          budget_amount: budget,
          status: 'active'
        })
        .select(`
          *,
          shared_list_items(*)
        `)
        .single();
      
      if (error) {
        throw new Error(`Failed to create list: ${error.message}`);
      }
      
      return { list: data };
    } catch (error) {
      console.error('Error creating shared list:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to create list' 
      };
    }
  }
  
  /**
   * Get all budgets for a family
   */
  static async getFamilyBudgets(
    familyId: string
  ): Promise<{ budgets: FamilyBudgetWithExpenses[]; error?: string }> {
    try {
      if (!familyId) {
        return { budgets: [], error: 'Family ID is required' };
      }
      
      // Get all budgets for the family
      const { data, error } = await supabase
        .from('family_budgets')
        .select(`
          *,
          expenses:family_expenses(*)
        `)
        .eq('family_id', familyId)
        .order('start_date', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to get budgets: ${error.message}`);
      }
      
      return { budgets: data || [] };
    } catch (error) {
      console.error('Error getting budgets:', error);
      return { 
        budgets: [], 
        error: error instanceof Error ? error.message : 'Failed to get budgets' 
      };
    }
  }

  /**
   * Share a shopping list with family members
   */
  static async shareListWithFamily(
    listId: string,
    familyId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id) {
        return { success: false, error: 'You must be logged in to share lists' };
      }
      
      if (!familyId) {
        return { success: false, error: 'Family ID is required' };
      }
      
      // Check if user is a member of the family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        throw new Error(`Failed to verify your membership: ${membershipError.message}`);
      }
      
      if (!membership) {
        return { success: false, error: 'You are not a member of this family' };
      }
      
      // Update the list to be shared with the family
      const { error: updateError } = await supabase
        .from('shared_shopping_lists')
        .update({ family_id: familyId })
        .eq('id', listId)
        .eq('created_by', user.id);
      
      if (updateError) {
        throw new Error(`Failed to share list: ${updateError.message}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error sharing list with family:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to share list with family' 
      };
    }
  }

  /**
   * Get all shared shopping lists for the current user
   */
  static async getUserSharedLists(): Promise<{ lists: SharedListWithItems[]; error?: string }> {
    try {
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id) {
        return { lists: [], error: 'Not authenticated' };
      }
      
      // Get user's family ID
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('family_id')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(`Failed to get user profile: ${profileError.message}`);
      }
      
      if (!userProfile?.family_id) {
        return { lists: [] }; // User doesn't belong to a family
      }
      
      // Get all shared lists for the family
      const { data, error } = await supabase
        .from('shared_shopping_lists')
        .select(`
          *,
          shared_list_items(*)
        `)
        .eq('family_id', userProfile.family_id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(`Failed to get shared lists: ${error.message}`);
      }
      
      return { lists: data || [] };
    } catch (error) {
      console.error('Error getting user shared lists:', error);
      return { 
        lists: [], 
        error: error instanceof Error ? error.message : 'Failed to get shared lists' 
      };
    }
  }
}

export interface FamilyGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}