import { useState, useEffect, useCallback } from 'react';
import { supabase, Family, FamilyMember, UserProfile } from '../lib/supabase';
import { useAuth } from './useAuth';

interface FamilyState {
  family: Family | null;
  members: FamilyMember[];
  loading: boolean;
  error: string | null;
}

export const useFamily = () => {
  const { user, profile } = useAuth();
  const [familyState, setFamilyState] = useState<FamilyState>({
    family: null,
    members: [],
    loading: false,
    error: null
  });

  // Load family data
  const loadFamily = useCallback(async () => {
    if (!user || !profile?.family_id) {
      setFamilyState(prev => ({ ...prev, family: null, members: [], loading: false }));
      return;
    }

    try {
      setFamilyState(prev => ({ ...prev, loading: true, error: null }));

      // Load family details
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', profile.family_id)
        .single();

      if (familyError) throw familyError;

      // Load family members with their profiles
      const { data: members, error: membersError } = await supabase
        .from('family_members')
        .select(`
          *,
          user_profiles (
            id,
            display_name,
            profile_image_url
          )
        `)
        .eq('family_id', profile.family_id);

      if (membersError) throw membersError;

      setFamilyState({
        family,
        members: members || [],
        loading: false,
        error: null
      });
    } catch (error) {
      setFamilyState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load family',
        loading: false
      }));
    }
  }, [user, profile?.family_id]);

  // Create a new family
  const createFamily = useCallback(async (name: string) => {
    if (!user) throw new Error('No authenticated user');

    try {
      setFamilyState(prev => ({ ...prev, loading: true, error: null }));

      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name,
          created_by: user.id
        })
        .select()
        .single();

      if (familyError) throw familyError;

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      // Update user profile with family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: family.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Reload family data
      await loadFamily();

      return { data: family, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create family';
      setFamilyState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { data: null, error: errorMessage };
    }
  }, [user, loadFamily]);

  // Invite member to family
  const inviteMember = useCallback(async (email: string, role: 'admin' | 'member' = 'member') => {
    if (!user || !familyState.family) {
      throw new Error('No authenticated user or family');
    }

    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', email) // This would need to be updated to search by email
        .single();

      if (userError) {
        throw new Error('User not found. They need to sign up first.');
      }

      // Add to family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyState.family.id,
          user_id: userData.id,
          role
        });

      if (memberError) throw memberError;

      // Update their profile with family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: familyState.family.id })
        .eq('id', userData.id);

      if (profileError) throw profileError;

      // Reload family data
      await loadFamily();

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to invite member';
      return { error: errorMessage };
    }
  }, [user, familyState.family, loadFamily]);

  // Remove member from family
  const removeMember = useCallback(async (memberId: string) => {
    if (!user || !familyState.family) {
      throw new Error('No authenticated user or family');
    }

    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Reload family data
      await loadFamily();

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove member';
      return { error: errorMessage };
    }
  }, [user, familyState.family, loadFamily]);

  // Leave family
  const leaveFamily = useCallback(async () => {
    if (!user || !profile?.family_id) {
      throw new Error('No authenticated user or family');
    }

    try {
      // Remove from family_members
      const { error: memberError } = await supabase
        .from('family_members')
        .delete()
        .eq('family_id', profile.family_id)
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      // Update profile to remove family_id
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ family_id: null })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Clear family state
      setFamilyState({
        family: null,
        members: [],
        loading: false,
        error: null
      });

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to leave family';
      return { error: errorMessage };
    }
  }, [user, profile?.family_id]);

  // Load family data when user or profile changes
  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  return {
    ...familyState,
    createFamily,
    inviteMember,
    removeMember,
    leaveFamily,
    loadFamily,
    isInFamily: !!familyState.family,
    isAdmin: familyState.members.some(
      member => member.user_id === user?.id && member.role === 'admin'
    )
  };
};