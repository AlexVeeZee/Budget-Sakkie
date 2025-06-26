import { useState, useEffect, useCallback } from 'react';
import { FamilyGroup, FamilyMember, FamilyInvitation, FamilyActivity } from '../types/family';

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

  // Mock data for demonstration
  const mockFamilyData: FamilyGroup = {
    id: 'family-1',
    name: 'Van Der Merwe Family',
    description: 'Our family shopping group',
    createdBy: 'sarah-1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    members: [
      {
        id: 'sarah-1',
        name: 'Sarah Van Der Merwe',
        email: 'sarah.vandermerwe@email.com',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        joinedDate: '2024-01-01T00:00:00Z',
        status: 'active',
        lastActive: '2024-01-15T12:00:00Z',
        permissions: {
          viewLists: true,
          editLists: true,
          createLists: true,
          viewBudget: true,
          editBudget: true,
          inviteMembers: true,
          manageMembers: true
        }
      },
      {
        id: 'johan-1',
        name: 'Johan Van Der Merwe',
        email: 'johan.vandermerwe@email.com',
        role: 'member',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        joinedDate: '2024-01-02T00:00:00Z',
        status: 'active',
        lastActive: '2024-01-15T10:30:00Z',
        permissions: {
          viewLists: true,
          editLists: true,
          createLists: true,
          viewBudget: true,
          editBudget: false,
          inviteMembers: false,
          manageMembers: false
        }
      },
      {
        id: 'emma-1',
        name: 'Emma Van Der Merwe',
        email: 'emma.vandermerwe@email.com',
        role: 'member',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        joinedDate: '2024-01-05T00:00:00Z',
        status: 'pending',
        lastActive: '2024-01-10T14:20:00Z',
        permissions: {
          viewLists: true,
          editLists: false,
          createLists: false,
          viewBudget: false,
          editBudget: false,
          inviteMembers: false,
          manageMembers: false
        }
      }
    ],
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
      totalLists: 12,
      totalSavings: 1247.50,
      activeMembers: 2
    }
  };

  const mockInvitations: FamilyInvitation[] = [
    {
      id: 'invite-1',
      familyId: 'family-1',
      familyName: 'Van Der Merwe Family',
      invitedBy: 'sarah-1',
      invitedByName: 'Sarah Van Der Merwe',
      email: 'pieter.vandermerwe@email.com',
      role: 'member',
      status: 'pending',
      createdAt: '2024-01-14T10:00:00Z',
      expiresAt: '2024-01-21T10:00:00Z',
      message: 'Join our family shopping group to share lists and save money together!'
    }
  ];

  const mockActivities: FamilyActivity[] = [
    {
      id: 'activity-1',
      familyId: 'family-1',
      userId: 'johan-1',
      userName: 'Johan Van Der Merwe',
      userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      type: 'list_created',
      description: 'created a new shopping list "Weekend Groceries"',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: 'activity-2',
      familyId: 'family-1',
      userId: 'sarah-1',
      userName: 'Sarah Van Der Merwe',
      userAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      type: 'item_completed',
      description: 'completed shopping for "Weekly Groceries" list',
      timestamp: '2024-01-15T09:15:00Z'
    },
    {
      id: 'activity-3',
      familyId: 'family-1',
      userId: 'emma-1',
      userName: 'Emma Van Der Merwe',
      userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      type: 'member_joined',
      description: 'joined the family group',
      timestamp: '2024-01-05T00:00:00Z'
    }
  ];

  useEffect(() => {
    // Simulate loading family data
    const loadFamilyData = async () => {
      setState(prev => ({ ...prev, loading: true }));
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setState({
          currentFamily: mockFamilyData,
          families: [mockFamilyData],
          invitations: mockInvitations,
          activities: mockActivities,
          loading: false,
          error: null
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load family data'
        }));
      }
    };

    loadFamilyData();
  }, []);

  const createFamily = useCallback(async (name: string, description?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newFamily: FamilyGroup = {
        id: `family-${Date.now()}`,
        name,
        description,
        createdBy: 'sarah-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        members: [{
          id: 'sarah-1',
          name: 'Sarah Van Der Merwe',
          email: 'sarah.vandermerwe@email.com',
          role: 'admin',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
          joinedDate: new Date().toISOString(),
          status: 'active',
          lastActive: new Date().toISOString(),
          permissions: {
            viewLists: true,
            editLists: true,
            createLists: true,
            viewBudget: true,
            editBudget: true,
            inviteMembers: true,
            manageMembers: true
          }
        }],
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
          activeMembers: 1
        }
      };

      setState(prev => ({
        ...prev,
        currentFamily: newFamily,
        families: [...prev.families, newFamily],
        loading: false
      }));

      return { success: true, family: newFamily };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to create family' }));
      return { success: false, error: 'Failed to create family' };
    }
  }, []);

  const inviteMember = useCallback(async (email: string, role: 'admin' | 'member', message?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newInvitation: FamilyInvitation = {
        id: `invite-${Date.now()}`,
        familyId: state.currentFamily?.id || '',
        familyName: state.currentFamily?.name || '',
        invitedBy: 'sarah-1',
        invitedByName: 'Sarah Van Der Merwe',
        email,
        role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        message
      };

      setState(prev => ({
        ...prev,
        invitations: [...prev.invitations, newInvitation],
        loading: false
      }));

      return { success: true, invitation: newInvitation };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to send invitation' }));
      return { success: false, error: 'Failed to send invitation' };
    }
  }, [state.currentFamily]);

  const updateMemberRole = useCallback(async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        currentFamily: prev.currentFamily ? {
          ...prev.currentFamily,
          members: prev.currentFamily.members.map(member =>
            member.id === memberId ? { ...member, role: newRole } : member
          )
        } : null,
        loading: false
      }));

      return { success: true };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to update member role' }));
      return { success: false, error: 'Failed to update member role' };
    }
  }, []);

  const removeMember = useCallback(async (memberId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        currentFamily: prev.currentFamily ? {
          ...prev.currentFamily,
          members: prev.currentFamily.members.filter(member => member.id !== memberId)
        } : null,
        loading: false
      }));

      return { success: true };
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error: 'Failed to remove member' }));
      return { success: false, error: 'Failed to remove member' };
    }
  }, []);

  return {
    ...state,
    createFamily,
    inviteMember,
    updateMemberRole,
    removeMember
  };
};