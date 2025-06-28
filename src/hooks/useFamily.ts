import { useState, useEffect, useCallback } from 'react';
import { FamilyService } from '../services/familyService';
import { FamilyGroup, FamilyMember, FamilyInvitation } from '../types/family';
import { useAuthStore } from '../store/authStore';

export const useFamily = () => {
  const [currentFamily, setCurrentFamily] = useState<FamilyGroup | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [invitations, setInvitations] = useState<FamilyInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFamilyData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Authentication check
      const authState = useAuthStore.getState();
      const { user } = authState;
      
      if (!user || !user.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Get user's family
      const { family, error: familyError } = await FamilyService.getUserFamily();
      
      if (familyError) {
        setError(familyError);
        setLoading(false);
        return;
      }

      setCurrentFamily(family);

      if (family && family.id) {
        // Get family members
        try {
          const { members: memberData, error: membersError } = await FamilyService.getFamilyMembers(family.id);
          
          if (membersError) {
            console.error('Error loading members:', membersError);
            setError(membersError);
          } else {
            setMembers(memberData || []);
          }
        } catch (membersErr) {
          console.error('Error in getFamilyMembers:', membersErr);
          setMembers([]);
        }
      } else {
        setMembers([]);
      }

      // Get pending invitations
      try {
        const { invitations: invitationData, error: invitationsError } = await FamilyService.getPendingInvitations();
        
        if (invitationsError) {
          console.error('Error loading invitations:', invitationsError);
          setInvitations([]);
        } else {
          setInvitations(invitationData || []);
        }
      } catch (invitationsErr) {
        console.error('Error in getPendingInvitations:', invitationsErr);
        setInvitations([]);
      }

    } catch (err) {
      console.error('Error loading family data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading family data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFamilyData();
  }, [loadFamilyData]);

  const createFamily = useCallback(async (name: string, description?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { success, family, error: createError } = await FamilyService.createFamily(name, description);
      
      if (!success) {
        throw new Error(createError);
      }

      await loadFamilyData();
      return { success: true, family };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create family';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [loadFamilyData]);

  const inviteMember = useCallback(async (
    email: string, 
    role: 'admin' | 'member', 
    message?: string,
    relationship?: string
  ) => {
    if (!currentFamily) {
      return { success: false, error: 'No family selected' };
    }

    try {
      return await FamilyService.inviteToFamily(
        currentFamily.id,
        email,
        role,
        message,
        relationship
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invite member';
      console.error('Error inviting member:', err);
      return { success: false, error: errorMessage };
    }
  }, [currentFamily]);

  const updateMemberRole = useCallback(async (
    memberId: string,
    newRole: 'admin' | 'member'
  ) => {
    if (!currentFamily) {
      throw new Error('No family selected');
    }

    try {
      const { success, error: updateError } = await FamilyService.updateFamilyMember(
        currentFamily.id,
        memberId,
        { isAdmin: newRole === 'admin' }
      );

      if (!success) {
        throw new Error(updateError);
      }

      // Update local state
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole } 
          : member
      ));
    } catch (err) {
      console.error('Error updating member role:', err);
      throw err;
    }
  }, [currentFamily]);

  const removeMember = useCallback(async (memberId: string) => {
    if (!currentFamily) {
      throw new Error('No family selected');
    }

    try {
      const { success, error: removeError } = await FamilyService.removeFamilyMember(
        currentFamily.id,
        memberId
      );

      if (!success) {
        throw new Error(removeError);
      }

      // Update local state
      setMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  }, [currentFamily]);

  const acceptInvitation = useCallback(async (invitationId: string) => {
    try {
      const result = await FamilyService.acceptInvitation(invitationId);
      
      if (result.success) {
        // Refresh data
        await loadFamilyData();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation';
      console.error('Error accepting invitation:', err);
      return { success: false, error: errorMessage };
    }
  }, [loadFamilyData]);

  const declineInvitation = useCallback(async (invitationId: string) => {
    try {
      const result = await FamilyService.declineInvitation(invitationId);
      
      if (result.success) {
        // Update local state
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decline invitation';
      console.error('Error declining invitation:', err);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    currentFamily,
    members,
    invitations,
    loading,
    error,
    createFamily,
    inviteMember,
    updateMemberRole,
    removeMember,
    acceptInvitation,
    declineInvitation,
    refreshData: loadFamilyData
  };
};