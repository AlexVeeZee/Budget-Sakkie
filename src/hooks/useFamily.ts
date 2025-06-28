import { useState, useEffect, useCallback } from 'react';
import { FamilyGroup, FamilyMember, FamilyInvitation, FamilyActivity } from '../types/family';
import { FamilyService } from '../services/familyService';

interface UseFamilyState {
  currentFamily: FamilyGroup | null;
  families: FamilyGroup[];
  invitations: FamilyInvitation[];
  activities: FamilyActivity[];
  loading: boolean;
  error: string | null;
}

export const useFamily = () => {
  const [state, setState] = useState<UseFamilyState>({
    currentFamily: null,
    families: [],
    invitations: [],
    activities: [],
    loading: true,
    error: null
  });

  // Load family data
  useEffect(() => {
    const loadFamilyData = async () => {
      setState(prev => ({ ...prev, loading: true }));
      
      try {
        // Get user's family
        const { family, error } = await FamilyService.getUserFamily();
        
        if (error) {
          setState(prev => ({
            ...prev,
            loading: false,
            error
          }));
          return;
        }
        
        // Get pending invitations
        const { invitations } = await FamilyService.getPendingInvitations();
        
        // Convert family data to FamilyGroup format
        let currentFamily: FamilyGroup | null = null;
        
        if (family) {
          const members: FamilyMember[] = family.family_members.map(member => ({
            id: member.user_id || '',
            name: member.user_profiles?.display_name || 'Unknown User',
            email: '', // Email not available from Supabase query
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
          
          currentFamily = {
            id: family.id,
            name: family.name,
            description: '',
            createdBy: family.created_by || '',
            createdAt: family.created_at || '',
            updatedAt: family.updated_at || '',
            members,
            settings: {
              allowMemberInvites: true,
              requireApprovalForNewMembers: false,
              defaultMemberPermissions: {
                viewLists: true,
                editLists: true,
                createLists: true,
                viewBudget: true,
                editBudget: false,
                inviteMembers: false,
                manageMembers: false
              }
            },
            stats: {
              totalLists: 0, // Will be updated when we implement list fetching
              totalSavings: 0, // Will be updated when we implement budget fetching
              activeMembers: members.filter(m => m.status === 'active').length
            }
          };
        }
        
        setState({
          currentFamily,
          families: currentFamily ? [currentFamily] : [],
          invitations: invitations.map(invitation => ({
            id: invitation.id,
            familyId: invitation.family_id || '',
            familyName: invitation.families?.name || 'Unknown Family',
            invitedBy: invitation.invited_by || '',
            invitedByName: invitation.invited_by_profile?.display_name || 'Unknown User',
            email: invitation.invited_email,
            role: invitation.role as 'admin' | 'member',
            status: invitation.status as 'pending' | 'accepted' | 'declined' | 'expired',
            createdAt: invitation.created_at || '',
            expiresAt: invitation.expires_at || '',
            message: ''
          })),
          activities: [], // Will be implemented later
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
      setState(prev => ({ ...prev, loading: true }));
      
      const { family, error } = await FamilyService.createFamily(name);
      
      if (error) {
        setState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }
      
      // Reload family data
      const { family: newFamily } = await FamilyService.getUserFamily();
      
      if (newFamily) {
        const members: FamilyMember[] = newFamily.family_members.map(member => ({
          id: member.user_id || '',
          name: member.user_profiles?.display_name || 'Unknown User',
          email: '', // Email not available from Supabase query
          role: member.role as 'admin' | 'member',
          avatar: member.user_profiles?.profile_image_url || '',
          joinedDate: member.joined_at || '',
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
        }));
        
        const familyGroup: FamilyGroup = {
          id: newFamily.id,
          name: newFamily.name,
          description: description || '',
          createdBy: newFamily.created_by || '',
          createdAt: newFamily.created_at || '',
          updatedAt: newFamily.updated_at || '',
          members,
          settings: {
            allowMemberInvites: true,
            requireApprovalForNewMembers: false,
            defaultMemberPermissions: {
              viewLists: true,
              editLists: true,
              createLists: true,
              viewBudget: true,
              editBudget: false,
              inviteMembers: false,
              manageMembers: false
            }
          },
          stats: {
            totalLists: 0,
            totalSavings: 0,
            activeMembers: members.filter(m => m.status === 'active').length
          }
        };
        
        setState(prev => ({
          ...prev,
          currentFamily: familyGroup,
          families: [familyGroup],
          loading: false
        }));
        
        return { success: true, family: familyGroup };
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return { success: true, family: null };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to create family' 
      }));
      return { success: false, error: 'Failed to create family' };
    }
  }, []);

  const inviteMember = useCallback(async (email: string, role: 'admin' | 'member', message?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      if (!state.currentFamily) {
        setState(prev => ({ ...prev, loading: false, error: 'No family selected' }));
        return { success: false, error: 'No family selected' };
      }
      
      const { success, error } = await FamilyService.inviteToFamily(
        state.currentFamily.id,
        email,
        role
      );
      
      if (!success) {
        setState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }
      
      // Create a new invitation object for the UI
      const newInvitation: FamilyInvitation = {
        id: `temp-${Date.now()}`,
        familyId: state.currentFamily.id,
        familyName: state.currentFamily.name,
        invitedBy: state.currentFamily.createdBy,
        invitedByName: state.currentFamily.members.find(m => m.id === state.currentFamily?.createdBy)?.name || 'Unknown',
        email,
        role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        message
      };
      
      setState(prev => ({
        ...prev,
        invitations: [...prev.invitations, newInvitation],
        loading: false
      }));
      
      return { success: true, invitation: newInvitation };
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to send invitation' 
      }));
      return { success: false, error: 'Failed to send invitation' };
    }
  }, [state.currentFamily]);

  const updateMemberRole = useCallback(async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      if (!state.currentFamily) {
        setState(prev => ({ ...prev, loading: false, error: 'No family selected' }));
        return { success: false, error: 'No family selected' };
      }
      
      const { success, error } = await FamilyService.updateMemberRole(
        state.currentFamily.id,
        memberId,
        newRole
      );
      
      if (!success) {
        setState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }
      
      // Update the member role in the state
      setState(prev => {
        if (!prev.currentFamily) return prev;
        
        const updatedMembers = prev.currentFamily.members.map(member =>
          member.id === memberId ? { ...member, role: newRole } : member
        );
        
        const updatedFamily = {
          ...prev.currentFamily,
          members: updatedMembers
        };
        
        return {
          ...prev,
          currentFamily: updatedFamily,
          families: prev.families.map(f => 
            f.id === updatedFamily.id ? updatedFamily : f
          ),
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
      setState(prev => ({ ...prev, loading: true }));
      
      if (!state.currentFamily) {
        setState(prev => ({ ...prev, loading: false, error: 'No family selected' }));
        return { success: false, error: 'No family selected' };
      }
      
      const { success, error } = await FamilyService.removeFamilyMember(
        state.currentFamily.id,
        memberId
      );
      
      if (!success) {
        setState(prev => ({ ...prev, loading: false, error }));
        return { success: false, error };
      }
      
      // Remove the member from the state
      setState(prev => {
        if (!prev.currentFamily) return prev;
        
        const updatedMembers = prev.currentFamily.members.filter(member => 
          member.id !== memberId
        );
        
        const updatedFamily = {
          ...prev.currentFamily,
          members: updatedMembers,
          stats: {
            ...prev.currentFamily.stats,
            activeMembers: updatedMembers.filter(m => m.status === 'active').length
          }
        };
        
        return {
          ...prev,
          currentFamily: updatedFamily,
          families: prev.families.map(f => 
            f.id === updatedFamily.id ? updatedFamily : f
          ),
          loading: false
        };
      });
      
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