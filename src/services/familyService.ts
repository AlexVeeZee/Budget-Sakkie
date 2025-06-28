import { supabase } from '../lib/supabase';
import { Family, FamilyMember, FamilyRelationship } from '../types/family';

export interface FamilyWithMembers extends Family {
  members: FamilyMember[];
}

export interface SharedListWithItems {
  id: string;
  name: string;
  description: string | null;
  budget: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  shared_list_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    estimated_price: number | null;
    actual_price: number | null;
    category: string | null;
    notes: string | null;
    priority: string;
    completed: boolean;
    completed_by: string | null;
    completed_at: string | null;
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
    category: string | null;
    expense_date: string;
    paid_by: string;
  }>;
}

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
  static async getUserFamily(): Promise<{ family: FamilyWithMembers | null; error?: string }> {
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
        
        return { 
          family: {
            ...family,
            members
          }
        };
      }
      
      return { family: null };
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
      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: familyName,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (familyError) {
        throw new Error(`Failed to create family: ${familyError.message}`);
      }
      
      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          role: 'admin'
        });
      
      if (memberError) {
        throw new Error(`Failed to add member to family: ${memberError.message}`);
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
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { members: [], error: 'User not authenticated' };
      }
      
      // Check if user is a member of this family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        return { members: [], error: 'You are not a member of this family' };
      }
      
      // Get all members of the family
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          user_id,
          role,
          relationship,
          joined_at,
          user:user_id (
            email,
            user_profiles:user_profiles (
              display_name,
              profile_image_url
            )
          )
        `)
        .eq('family_id', familyId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Transform the data to match our FamilyMember type
      const members: FamilyMember[] = data.map(member => {
        const userProfile = member.user?.user_profiles?.[0] || {};
        return {
          id: member.user_id,
          name: userProfile.display_name || member.user?.email?.split('@')[0] || 'Unknown',
          email: member.user?.email || '',
          role: member.role,
          relationship: member.relationship || '',
          avatar: userProfile.profile_image_url || '',
          joinedDate: member.joined_at,
          status: 'active',
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
        };
      });
      
      return { members };
    } catch (error) {
      console.error('Error fetching family members:', error);
      return { 
        members: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch family members' 
      };
    }
  }
  
  /**
   * Update a family member's role
   */
  static async updateMemberRole(
    familyId: string,
    memberId: string,
    newRole: 'admin' | 'member'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Check if user is admin of this family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        return { success: false, error: 'Only family admins can update member roles' };
      }
      
      // Update member role
      const { error } = await supabase
        .from('family_members')
        .update({ role: newRole })
        .eq('family_id', familyId)
        .eq('user_id', memberId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating member role:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update member role' 
      };
    }
  }
  
  /**
   * Remove a member from a family
   */
  static async removeMember(
    familyId: string,
    memberId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Check if user is admin of this family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        return { success: false, error: 'Only family admins can remove members' };
      }
      
      // Remove member
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', memberId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error removing member:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove member' 
      };
    }
  }
  
  /**
   * Get pending invitations for the current user
   */
  static async getPendingInvitations(): Promise<{ invitations: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { invitations: [], error: 'User not authenticated' };
      }
      
      const { data, error } = await supabase
        .from('family_invitations')
        .select(`
          id,
          family_id,
          family:family_id (name),
          invited_by,
          inviter:invited_by (email, user_profiles:user_profiles(display_name)),
          role,
          status,
          created_at,
          expires_at
        `)
        .eq('invited_email', user.email)
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString());
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Transform the data
      const invitations = data.map(invitation => ({
        id: invitation.id,
        familyId: invitation.family_id,
        familyName: invitation.family?.name || 'Unknown Family',
        invitedBy: invitation.invited_by,
        invitedByName: invitation.inviter?.user_profiles?.[0]?.display_name || 
                      invitation.inviter?.email?.split('@')[0] || 'Unknown',
        role: invitation.role,
        status: invitation.status,
        createdAt: invitation.created_at,
        expiresAt: invitation.expires_at,
        message: '' // No message field in our schema, but included for API compatibility
      }));
      
      return { invitations };
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Get the invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('family_invitations')
        .select('*')
        .eq('id', invitationId)
        .eq('invited_email', user.email)
        .eq('status', 'pending')
        .lt('expires_at', new Date().toISOString())
        .single();
      
      if (invitationError) {
        return { success: false, error: 'Invalid or expired invitation' };
      }
      
      // Add user to family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: invitation.family_id,
          user_id: user.id,
          role: invitation.role
        });
      
      if (memberError) {
        throw new Error(memberError.message);
      }
      
      // Update invitation status
      const { error: updateError } = await supabase
        .from('family_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);
      
      if (updateError) {
        throw new Error(updateError.message);
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
   * Decline an invitation
   */
  static async declineInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Update invitation status
      const { error } = await supabase
        .from('family_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId)
        .eq('invited_email', user.email);
      
      if (error) {
        throw new Error(error.message);
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Check if user is admin of this family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('role')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError || membership.role !== 'admin') {
        return { success: false, error: 'Only family admins can send invitations' };
      }
      
      // Check if invitation already exists
      const { data: existingInvitation, error: invitationError } = await supabase
        .from('family_invitations')
        .select('id')
        .eq('family_id', familyId)
        .eq('invited_email', email)
        .eq('status', 'pending')
        .maybeSingle();
      
      if (existingInvitation) {
        return { success: false, error: 'An invitation has already been sent to this email' };
      }
      
      // Create invitation
      const { error } = await supabase
        .from('family_invitations')
        .insert({
          family_id: familyId,
          invited_email: email,
          invited_by: user.id,
          role: role
        });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // In a real app, we would send an email here
      
      return { success: true };
    } catch (error) {
      console.error('Error inviting to family:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send invitation' 
      };
    }
  }
  
  /**
   * Get shared shopping lists for a family
   */
  static async getFamilyShoppingLists(familyId: string): Promise<{ lists: SharedListWithItems[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { lists: [], error: 'User not authenticated' };
      }
      
      // Check if user is a member of this family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        return { lists: [], error: 'You are not a member of this family' };
      }
      
      // Get all shared lists for this family
      const { data, error } = await supabase
        .from('shared_shopping_lists')
        .select(`
          *,
          shared_list_items (*)
        `)
        .eq('family_id', familyId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { lists: data || [] };
    } catch (error) {
      console.error('Error fetching family shopping lists:', error);
      return { 
        lists: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch shopping lists' 
      };
    }
  }
  
  /**
   * Get family budgets
   */
  static async getFamilyBudgets(familyId: string): Promise<{ budgets: FamilyBudgetWithExpenses[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { budgets: [], error: 'User not authenticated' };
      }
      
      // Check if user is a member of this family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        return { budgets: [], error: 'You are not a member of this family' };
      }
      
      // Get all budgets for this family
      const { data, error } = await supabase
        .from('family_budgets')
        .select(`
          *,
          expenses:family_expenses (
            id,
            description,
            amount,
            category,
            expense_date,
            paid_by
          )
        `)
        .eq('family_id', familyId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { budgets: data || [] };
    } catch (error) {
      console.error('Error fetching family budgets:', error);
      return { 
        budgets: [], 
        error: error instanceof Error ? error.message : 'Failed to fetch budgets' 
      };
    }
  }
  
  /**
   * Create a shared shopping list
   */
  static async createSharedList(
    familyId: string,
    name: string,
    description?: string,
    budget?: number
  ): Promise<{ list: SharedListWithItems | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { list: null, error: 'User not authenticated' };
      }
      
      // Check if user is a member of this family
      const { data: membership, error: membershipError } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('user_id', user.id)
        .single();
      
      if (membershipError) {
        return { list: null, error: 'You are not a member of this family' };
      }
      
      // Create the list
      const { data, error } = await supabase
        .from('shared_shopping_lists')
        .insert({
          family_id: familyId,
          name,
          description,
          budget_amount: budget,
          created_by: user.id
        })
        .select(`
          *,
          shared_list_items (*)
        `)
        .single();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { list: data };
    } catch (error) {
      console.error('Error creating shared list:', error);
      return { 
        list: null, 
        error: error instanceof Error ? error.message : 'Failed to create shared list' 
      };
    }
  }
}