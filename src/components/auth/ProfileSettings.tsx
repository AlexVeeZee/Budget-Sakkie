import React, { useState, useEffect } from 'react';
import { User, Mail, Save, Loader2, AlertCircle, CheckCircle, MapPin, Phone, Home, Building, Map, Globe } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';

// Form validation schema
const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional().or(z.literal('')),
  avatarUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  phone: z.string().regex(/^(\+27|0)[0-9]{9}$/, 'Please enter a valid South African phone number').optional().or(z.literal('')),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postalCode: z.string().regex(/^\d{4}$/, 'South African postal codes must be 4 digits'),
  alternativeEmail: z.string().email('Please enter a valid email address').optional().or(z.literal(''))
});

interface ProfileFormData {
  displayName: string;
  avatarUrl: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  alternativeEmail: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export const ProfileSettings: React.FC = () => {
  const { user, isGuest, updateProfile } = useAuthStore();
  
  const [formData, setFormData] = useState<ProfileFormData>({
    displayName: '',
    avatarUrl: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'South Africa',
    alternativeEmail: '',
    notificationPreferences: {
      email: true,
      push: false,
      sms: false
    }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        return;
      }
      
      if (isGuest) {
        // For guest users, try to load from localStorage
        const savedProfile = localStorage.getItem('guestUserProfile');
        if (savedProfile) {
          try {
            setFormData(JSON.parse(savedProfile));
          } catch (e) {
            console.error('Error parsing saved profile:', e);
          }
        }
        return;
      }
      
      setIsLoading(true);
      
      try {
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
        
        // Update form data with fetched data
        setFormData({
          displayName: profileData?.display_name || user.displayName || '',
          avatarUrl: profileData?.profile_image_url || user.avatarUrl || '',
          phone: profileData?.phone_number || '',
          address: profileData?.address || '',
          city: profileData?.city || '',
          province: profileData?.province || '',
          postalCode: profileData?.postal_code || '',
          country: profileData?.country || 'South Africa',
          alternativeEmail: profileData?.alternative_email || '',
          notificationPreferences: preferencesData?.notification_preferences || {
            email: true,
            push: false,
            sms: false
          }
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setErrors(prev => ({ 
          ...prev, 
          general: 'Failed to load profile data. Please try again.' 
        }));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, isGuest]);
  
  const validateForm = () => {
    try {
      profileSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // Handle notification preferences
    if (name.startsWith('notification_')) {
      const preference = name.replace('notification_', '') as 'email' | 'push' | 'sms';
      
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [preference]: checked
        }
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      if (isGuest) {
        // For guest users, save to localStorage
        localStorage.setItem('guestUserProfile', JSON.stringify(formData));
        
        // Update auth store with display name and avatar
        await updateProfile({
          displayName: formData.displayName,
          avatarUrl: formData.avatarUrl
        });
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else if (user) {
        // For authenticated users, save to database
        
        // Update user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            display_name: formData.displayName,
            profile_image_url: formData.avatarUrl,
            phone_number: formData.phone,
            address: formData.address,
            city: formData.city,
            province: formData.province,
            postal_code: formData.postalCode,
            country: formData.country,
            alternative_email: formData.alternativeEmail,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (profileError) {
          throw new Error(`Profile update failed: ${profileError.message}`);
        }
        
        // Update user preferences
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            notification_preferences: formData.notificationPreferences,
            updated_at: new Date().toISOString()
          });
        
        if (preferencesError) {
          console.warn('Preferences update failed:', preferencesError);
          // Continue anyway since this is not critical
        }
        
        // Update auth store with display name and avatar
        await updateProfile({
          displayName: formData.displayName,
          avatarUrl: formData.avatarUrl
        });
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors(prev => ({ 
        ...prev, 
        general: error instanceof Error ? error.message : 'Failed to update profile. Please try again.' 
      }));
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) return null;
  
  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];
  
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-green-800">Your profile has been updated successfully!</p>
        </div>
      )}
      
      {/* General Error */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{errors.general}</p>
        </div>
      )}
      
      {isLoading && !Object.keys(formData).some(key => formData[key as keyof ProfileFormData]) ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account Information */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={user.username}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Username cannot be changed
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Contact support to change email
                </p>
              </div>
            </div>
          </div>
          
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border ${
                    errors.displayName ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                  placeholder="Your display name"
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  This is how your name will appear to others
                </p>
              </div>
              
              {/* Avatar URL */}
              <div>
                <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture URL
                </label>
                <input
                  id="avatarUrl"
                  name="avatarUrl"
                  type="text"
                  value={formData.avatarUrl}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border ${
                    errors.avatarUrl ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                  placeholder="https://example.com/your-image.jpg"
                />
                {errors.avatarUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.avatarUrl}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter a URL to your profile picture
                </p>
              </div>
              
              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    placeholder="+27 82 123 4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              
              {/* Alternative Email */}
              <div>
                <label htmlFor="alternativeEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Alternative Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="alternativeEmail"
                    name="alternativeEmail"
                    type="email"
                    value={formData.alternativeEmail}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.alternativeEmail ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    placeholder="alternative@example.com"
                  />
                </div>
                {errors.alternativeEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.alternativeEmail}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Used for account recovery and notifications
                </p>
              </div>
            </div>
          </div>
          
          {/* Location Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Location Information</h3>
            
            <div className="space-y-4">
              {/* Street Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.address ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                      placeholder="Centurion"
                      required
                    />
                  </div>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
                
                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Province */}
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                    Province <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Map className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.province ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                      required
                    >
                      <option value="">Select Province</option>
                      {provinces.map(province => (
                        <option key={province} value={province}>{province}</option>
                      ))}
                    </select>
                  </div>
                  {errors.province && (
                    <p className="mt-1 text-sm text-red-600">{errors.province}</p>
                  )}
                </div>
                
                {/* Postal Code */}
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        errors.postalCode ? 'border-red-300' : 'border-gray-300'
                      } rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500`}
                      placeholder="0157"
                      required
                    />
                  </div>
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Notification Preferences */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="notification_email"
                  name="notification_email"
                  type="checkbox"
                  checked={formData.notificationPreferences.email}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="notification_email" className="ml-3 block text-sm font-medium text-gray-700">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="notification_push"
                  name="notification_push"
                  type="checkbox"
                  checked={formData.notificationPreferences.push}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="notification_push" className="ml-3 block text-sm font-medium text-gray-700">
                  Push Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="notification_sms"
                  name="notification_sms"
                  type="checkbox"
                  checked={formData.notificationPreferences.sms}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="notification_sms" className="ml-3 block text-sm font-medium text-gray-700">
                  SMS Notifications
                </label>
              </div>
            </div>
          </div>
          
          {/* Guest Account Warning */}
          {isGuest && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Guest Account</h4>
              <p className="text-sm text-yellow-700">
                You are currently using a guest account. Your profile changes will only be saved on this device.
                To save your data permanently, please create an account.
              </p>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};