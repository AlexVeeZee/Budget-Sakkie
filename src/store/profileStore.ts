import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface UserProfileData {
  displayName: string;
  avatarUrl: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  language: 'en' | 'af';
  currency: 'ZAR' | 'USD' | 'EUR' | 'GBP';
  distanceUnit: 'km' | 'mi';
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

interface ProfileState {
  profile: UserProfileData | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfileData>) => Promise<{ success: boolean; error?: string }>;
}

const DEFAULT_PROFILE: UserProfileData = {
  displayName: '',
  avatarUrl: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  language: 'en',
  currency: 'ZAR',
  distanceUnit: 'km',
  notificationPreferences: {
    email: true,
    push: false,
    sms: false
  }
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    const { user } = useAuthStore.getState();
    
    if (!user || user.isGuest) {
      // For guest users, use default profile or load from localStorage
      const savedProfile = localStorage.getItem('guestUserProfile');
      set({ 
        profile: savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE,
        isLoading: false,
        error: null
      });
      return;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      // Fetch user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(profileError.message);
      }
      
      // Fetch user preferences from database
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw new Error(preferencesError.message);
      }
      
      // Combine profile and preferences data
      const profile: UserProfileData = {
        displayName: profileData?.display_name || '',
        avatarUrl: profileData?.profile_image_url || '',
        phone: profileData?.phone_number || '',
        address: profileData?.address || '',
        city: profileData?.city || '',
        province: profileData?.province || '',
        postalCode: profileData?.postal_code || '',
        language: preferencesData?.language || 'en',
        currency: preferencesData?.currency || 'ZAR',
        distanceUnit: preferencesData?.distance_unit || 'km',
        notificationPreferences: preferencesData?.notification_preferences || {
          email: true,
          push: false,
          sms: false
        }
      };
      
      set({ profile, isLoading: false, error: null });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      set({ isLoading: false, error: errorMessage });
      console.error('Error fetching profile:', error);
    }
  },

  updateProfile: async (updates) => {
    const { user } = useAuthStore.getState();
    const { profile } = get();
    
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }
    
    try {
      set({ isLoading: true, error: null });
      
      if (user.isGuest) {
        // For guest users, update localStorage only
        const updatedProfile = { ...profile, ...updates };
        localStorage.setItem('guestUserProfile', JSON.stringify(updatedProfile));
        set({ profile: updatedProfile, isLoading: false });
        return { success: true };
      }
      
      // For authenticated users, update database
      
      // Update user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          display_name: updates.displayName,
          profile_image_url: updates.avatarUrl,
          phone_number: updates.phone,
          address: updates.address,
          city: updates.city,
          province: updates.province,
          postal_code: updates.postalCode,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (profileError) {
        throw new Error(profileError.message);
      }
      
      // Update user preferences if needed
      if (updates.language || updates.currency || updates.distanceUnit || updates.notificationPreferences) {
        const preferencesUpdates: any = {};
        
        if (updates.language) preferencesUpdates.language = updates.language;
        if (updates.currency) preferencesUpdates.currency = updates.currency;
        if (updates.distanceUnit) preferencesUpdates.distance_unit = updates.distanceUnit;
        if (updates.notificationPreferences) {
          preferencesUpdates.notification_preferences = updates.notificationPreferences;
        }
        
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .update({
            ...preferencesUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (preferencesError) {
          throw new Error(preferencesError.message);
        }
      }
      
      // Update auth store with new display name and avatar
      if (updates.displayName || updates.avatarUrl) {
        await useAuthStore.getState().updateProfile({
          displayName: updates.displayName,
          avatarUrl: updates.avatarUrl
        });
      }
      
      // Update local state
      set({ 
        profile: { ...profile, ...updates } as UserProfileData,
        isLoading: false 
      });
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      set({ isLoading: false, error: errorMessage });
      console.error('Error updating profile:', error);
      return { success: false, error: errorMessage };
    }
  }
}));