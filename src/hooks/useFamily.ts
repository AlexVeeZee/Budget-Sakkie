import { useState, useEffect, useCallback } from 'react';
import { Family, FamilyMember } from '../types/family';
import { FamilyService } from '../services/familyService';

interface UseFamilyState {
  currentFamily: Family | null;
  members: FamilyMember[];
  invitations: any[];
  loading: boolean;
  error: string | null;
}

export const useFamily = () => {
  const [state, setState] = useState<UseFamilyState>({
    currentFamily: null,
    members: [],
    invitations: [],
    loading: true,
    error: null
  });

  // Load family data
  useEffect(() => {
    const loadFamilyData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        // Get user's family
        const { family, error: familyError } = await FamilyService.getUserFamily();
        
        if (familyError) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: familyError
          }));
          return;
        }
        
        // Get pending invitations
        const { invitations, error: invitationsError } = await FamilyService.getPendingInvitations();
        
        if (invitationsError) {
          console.warn('Error fetching invitations:', invitationsError);
        }
        
        setState({
          currentFamily: family,
          members: family?.members || [],
          invitations: invitations || [],
          loading: false,
          error: null
        });
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to load family data' 
        }));
      }
    };

    loadFamilyData();
  }, []);

  const createFamily = useCallback(async (name: string, description?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { family, error } = await FamilyService.createFamily(name);
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }
      
      // Reload family data
      const { family: newFamily } = await FamilyService.getUserFamily();
      
      setState(prev => ({
        ...prev,
        currentFamily: newFamily,
        members: newFamily?.members || [],
        loading: false
      }));
      
      return { success: true, family: newFamily };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to create family' 
      }));
      return { success: false, error: 'Failed to create family' };
    }
  }, []);

  const inviteMember = useCallback(async (
    email: string, 
    role: 'admin' | 'member', 
    message?: string,
    relationship?: string
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!state.currentFamily) {
        setState(prev => ({ ...prev, loading: false, error: 'No family selected' }));
        return { success: false, error: 'No family selected' };
      }
      
      const { success, error } = await FamilyService.inviteToFamily(
        state.currentFamily.family_id,
        email,
        role,
        message,
        relationship
      );
      
      if (!success) {
        setState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return { success: true };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to invite member' 
      }));
      return { success: false, error: 'Failed to invite member' };
    }
  }, [state.currentFamily]);

  const updateMemberRole = useCallback(async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!state.currentFamily) {
        setState(prev => ({ ...prev, loading: false, error: 'No family selected' }));
        return { success: false, error: 'No family selected' };
      }
      
      const { success, error } = await FamilyService.updateFamilyMember(
        state.currentFamily.family_id,
        memberId,
        { isAdmin: newRole === 'admin' }
      );
      
      if (!success) {
        setState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }
      
      // Update the member in state
      setState(prev => {
        const updatedMembers = prev.members.map(member =>
          member.member_id === memberId ? { ...member, is_admin: newRole === 'admin' } : member
        );
        
        return {
          ...prev,
          members: updatedMembers,
          loading: false
        };
      });
      
      return { success: true };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to update member role' 
      }));
      return { success: false, error: 'Failed to update member role' };
    }
  }, [state.currentFamily]);

  const removeMember = useCallback(async (memberId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!state.currentFamily) {
        setState(prev => ({ ...prev, loading: false, error: 'No family selected' }));
        return { success: false, error: 'No family selected' };
      }
      
      const { success, error } = await FamilyService.removeFamilyMember(
        state.currentFamily.family_id,
        memberId
      );
      
      if (!success) {
        setState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }
      
      // Remove the member from state
      setState(prev => ({
        ...prev,
        members: prev.members.filter(member => member.member_id !== memberId),
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to remove member' 
      }));
      return { success: false, error: 'Failed to remove member' };
    }
  }, [state.currentFamily]);

  return {
    ...state,
    createFamily,
    inviteMember,
    updateMemberRole,
    removeMember
  };
};