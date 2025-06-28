import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export interface UserProfileData {
  displayName: string;
  avatarUrl: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  alternativeEmail: string;
  language: 'en' | 'af';
  currency: 'ZAR' | 'USD' | 'EUR' | 'GBP';
  distanceUnit: 'km' | 'mi';
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export class ProfileService {
  /**
   * Fetch user profile data from the database
   */
  static async fetchUserProfile(): Promise<{ data: Partial<UserProfileData> | null; error?: string }> {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user || user.isGuest) {
        return { data: null, error: 'No authenticated user' };
      }
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(profileError.message);
      }
      
      // Fetch user preferences
      const { data: preferencesData, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw new Error(preferencesError.message);
      }
      
      // Combine data
      const userData: Partial<UserProfileData> = {
        displayName: profileData?.display_name || '',
        avatarUrl: profileData?.profile_image_url || '',
        phone: profileData?.phone_number || '',
        address: profileData?.address || '',
        city: profileData?.city || '',
        province: profileData?.province || '',
        postalCode: profileData?.postal_code || '',
        country: profileData?.country || 'South Africa',
        alternativeEmail: profileData?.alternative_email || '',
        language: preferencesData?.language || 'en',
        currency: preferencesData?.currency || 'ZAR',
        distanceUnit: preferencesData?.distance_unit || 'km',
        notificationPreferences: preferencesData?.notification_preferences || {
          email: true,
          push: false,
          sms: false
        }
      };
      
      return { data: userData };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile';
      console.error('Error fetching user profile:', error);
      return { data: null, error: errorMessage };
    }
  }
  
  /**
   * Update user profile data in the database
   */
  static async updateUserProfile(updates: Partial<UserProfileData>): Promise<{ success: boolean; error?: string }> {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user || user.isGuest) {
        return { success: false, error: 'No authenticated user' };
      }
      
      // Update profile data
      const profileUpdates: any = {};
      
      if (updates.displayName !== undefined) profileUpdates.display_name = updates.displayName;
      if (updates.avatarUrl !== undefined) profileUpdates.profile_image_url = updates.avatarUrl;
      if (updates.phone !== undefined) profileUpdates.phone_number = updates.phone;
      if (updates.address !== undefined) profileUpdates.address = updates.address;
      if (updates.city !== undefined) profileUpdates.city = updates.city;
      if (updates.province !== undefined) profileUpdates.province = updates.province;
      if (updates.postalCode !== undefined) profileUpdates.postal_code = updates.postalCode;
      if (updates.country !== undefined) profileUpdates.country = updates.country;
      if (updates.alternativeEmail !== undefined) profileUpdates.alternative_email = updates.alternativeEmail;
      
      if (Object.keys(profileUpdates).length > 0) {
        profileUpdates.updated_at = new Date().toISOString();
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('id', user.id);
        
        if (profileError) {
          throw new Error(profileError.message);
        }
      }
      
      // Update preferences data
      const preferencesUpdates: any = {};
      
      if (updates.language !== undefined) preferencesUpdates.language = updates.language;
      if (updates.currency !== undefined) preferencesUpdates.currency = updates.currency;
      if (updates.distanceUnit !== undefined) preferencesUpdates.distance_unit = updates.distanceUnit;
      if (updates.notificationPreferences !== undefined) {
        preferencesUpdates.notification_preferences = updates.notificationPreferences;
      }
      
      if (Object.keys(preferencesUpdates).length > 0) {
        preferencesUpdates.updated_at = new Date().toISOString();
        
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .update(preferencesUpdates)
          .eq('user_id', user.id);
        
        if (preferencesError) {
          throw new Error(preferencesError.message);
        }
      }
      
      // Update auth store if display name or avatar changed
      if (updates.displayName !== undefined || updates.avatarUrl !== undefined) {
        await useAuthStore.getState().updateProfile({
          displayName: updates.displayName,
          avatarUrl: updates.avatarUrl
        });
      }
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user profile';
      console.error('Error updating user profile:', error);
      return { success: false, error: errorMessage };
    }
  }
}