import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type FamilyInvitation = Database['public']['Tables']['family_invitations']['Row'];
type SharedShoppingList = Database['public']['Tables']['shared_shopping_lists']['Row'];
type SharedListItem = Database['public']['Tables']['shared_list_items']['Row'];
type FamilyBudget = Database['public']['Tables']['family_budgets']['Row'];
type FamilyExpense = Database['public']['Tables']['family_expenses']['Row'];
type FamilyMember = Database['public']['Tables']['family_members']['Row'];
type Family = Database['public']['Tables']['families']['Row'];

export interface FamilyWithMembers extends Family {
  family_members: (FamilyMember & {
    user_profiles: {
      display_name: string | null;
      profile_image_url: string | null;
    } | null;
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
  static async createFamily(name: string): Promise<{ family: Family; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { family: null as any, error: 'User not authenticated' };
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
        return { family: null as any, error: familyError.message };
      }

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) {
        return { family: null as any, error: memberError.message };
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
      return { family: null as any, error: error instanceof Error ? error.message : 'Unknown error' };
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

      if (membershipError || !membership) {
        return { family: null };
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
              profile_image_url
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
  static async inviteToFamily(familyId: string, email: string, role: 'admin' | 'member' = 'member'): Promise<{ success: boolean; error?: string }> {
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
          role
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
  static async getPendingInvitations(): Promise<{ invitations: FamilyInvitation[]; error?: string }> {
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
  static async acceptInvitation(invitationToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('accept_family_invitation', {
        invitation_token: invitationToken
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data?.success) {
        return { success: false, error: data?.error || 'Failed to accept invitation' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create shared shopping list
   */
  static async createSharedList(
    familyId: string, 
    name: string, 
    description?: string, 
    budgetAmount?: number
  ): Promise<{ list: SharedShoppingList | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { list: null, error: 'User not authenticated' };
      }

      const { data: list, error } = await supabase
        .from('shared_shopping_lists')
        .insert({
          name,
          description,
          family_id: familyId,
          created_by: user.id,
          budget_amount: budgetAmount
        })
        .select()
        .single();

      if (error) {
        return { list: null, error: error.message };
      }

      return { list };
    } catch (error) {
      return { list: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get family's shared shopping lists
   */
  static async getFamilyShoppingLists(familyId: string): Promise<{ lists: SharedListWithItems[]; error?: string }> {
    try {
      const { data: lists, error } = await supabase
        .from('shared_shopping_lists')
        .select(`
          *,
          shared_list_items (*),
          created_by_profile:user_profiles!shared_shopping_lists_created_by_fkey (
            display_name
          )
        `)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) {
        return { lists: [], error: error.message };
      }

      return { lists: lists as SharedListWithItems[] || [] };
    } catch (error) {
      return { lists: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Add item to shared shopping list
   */
  static async addItemToSharedList(
    listId: string,
    productName: string,
    quantity: number = 1,
    estimatedPrice?: number,
    category?: string,
    notes?: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<{ item: SharedListItem | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { item: null, error: 'User not authenticated' };
      }

      const { data: item, error } = await supabase
        .from('shared_list_items')
        .insert({
          list_id: listId,
          product_name: productName,
          quantity,
          estimated_price: estimatedPrice,
          category,
          notes,
          priority,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        return { item: null, error: error.message };
      }

      return { item };
    } catch (error) {
      return { item: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Update shared list item
   */
  static async updateSharedListItem(
    itemId: string,
    updates: Partial<Pick<SharedListItem, 'quantity' | 'estimated_price' | 'actual_price' | 'notes' | 'priority' | 'completed'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const updateData: any = { ...updates };
      
      if (updates.completed !== undefined) {
        updateData.completed_by = updates.completed ? user.id : null;
        updateData.completed_at = updates.completed ? new Date().toISOString() : null;
      }

      const { error } = await supabase
        .from('shared_list_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Create family budget
   */
  static async createFamilyBudget(
    familyId: string,
    name: string,
    totalAmount: number,
    periodType: 'weekly' | 'monthly' | 'yearly',
    startDate: string,
    endDate: string
  ): Promise<{ budget: FamilyBudget | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { budget: null, error: 'User not authenticated' };
      }

      const { data: budget, error } = await supabase
        .from('family_budgets')
        .insert({
          family_id: familyId,
          name,
          total_amount: totalAmount,
          period_type: periodType,
          start_date: startDate,
          end_date: endDate,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        return { budget: null, error: error.message };
      }

      return { budget };
    } catch (error) {
      return { budget: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get family budgets with expenses
   */
  static async getFamilyBudgets(familyId: string): Promise<{ budgets: FamilyBudgetWithExpenses[]; error?: string }> {
    try {
      const { data: budgets, error } = await supabase
        .from('family_budgets')
        .select(`
          *,
          family_expenses (*)
        `)
        .eq('family_id', familyId)
        .order('created_at', { ascending: false });

      if (error) {
        return { budgets: [], error: error.message };
      }

      return { budgets: budgets as FamilyBudgetWithExpenses[] || [] };
    } catch (error) {
      return { budgets: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Add family expense
   */
  static async addFamilyExpense(
    familyId: string,
    description: string,
    amount: number,
    category?: string,
    budgetId?: string,
    listId?: string,
    expenseDate?: string
  ): Promise<{ expense: FamilyExpense | null; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { expense: null, error: 'User not authenticated' };
      }

      const { data: expense, error } = await supabase
        .from('family_expenses')
        .insert({
          family_id: familyId,
          budget_id: budgetId,
          list_id: listId,
          description,
          amount,
          category,
          paid_by: user.id,
          expense_date: expenseDate || new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) {
        return { expense: null, error: error.message };
      }

      return { expense };
    } catch (error) {
      return { expense: null, error: error instanceof Error ? error.message : 'Unknown error' };
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
}