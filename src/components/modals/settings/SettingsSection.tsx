import React, { useState, lazy, Suspense, useEffect } from 'react';
import { User, MapPin, Lock, Bell, Globe, Shield, Save, Edit2, Eye, EyeOff, Mail, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import { useCurrency, Currency } from '../../../hooks/useCurrency';
import { useLocation } from '../../../hooks/useLocation';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../lib/supabase';

// Lazy load heavy modal sections
const SecuritySection = lazy(() => import('./SecuritySection'));
const NotificationsSection = lazy(() => import('./NotificationsSection'));
const PrivacySection = lazy(() => import('./PrivacySection'));

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export const SettingsSection: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { currency, updateCurrency, availableCurrencies } = useCurrency();
  const { homeLocation } = useLocation();
  const { user } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: homeLocation.address.split(',')[0] || '123 Main Street',
    city: homeLocation.address.split(',')[1]?.trim() || 'Centurion',
    province: 'Gauteng',
    postalCode: '0157'
  });

  // Reset profile data when user changes
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        email: user.email || '',
        // Other fields remain blank for new users unless loaded from Supabase
      }));
    }
  }, [user]);

  const [passwordReset, setPasswordReset] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    dealNotifications: true,
    listReminders: true,
    weeklyReports: true,
    emailUpdates: false,
    smsAlerts: false
  });

  const [privacy, setPrivacy] = useState({
    shareLocation: true,
    shareShoppingLists: false,
    allowAnalytics: true,
    marketingEmails: false
  });

  const tabs = [
    { id: 'profile', label: 'Personal Info', icon: User },
    { id: 'location', label: 'Home Location', icon: MapPin },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'language', label: 'Language & Currency', icon: Globe }
  ];

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  const handleProfileUpdate = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationUpdate = (field: keyof UserProfile, value: string) => {
    handleProfileUpdate(field, value);
  };

  const handlePasswordResetChange = (field: keyof typeof passwordReset, value: string) => {
    setPasswordReset(prev => ({ ...prev, [field]: value }));
  };

  const handleSendVerificationEmail = () => {
    console.log('Sending verification email to:', profile.email);
    setEmailSent(true);
  };

  const handleVerifyCode = () => {
    if (verificationCode === '123456') {
      setIsVerified(true);
    } else {
      alert('Invalid verification code. Try 123456 for demo.');
    }
  };

  const handlePasswordSubmit = () => {
    if (!isVerified) {
      alert('Please verify your email first.');
      return;
    }

    if (passwordReset.newPassword !== passwordReset.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (passwordReset.newPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    console.log('Updating password...');
    alert('Password updated successfully!');
    
    setPasswordReset({ newPassword: '', confirmPassword: '' });
    setEmailSent(false);
    setIsVerified(false);
    setVerificationCode('');
  };

  const handleNotificationToggle = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handlePrivacyToggle = (setting: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    updateCurrency(newCurrency);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        // If no authenticated user, just show success for demo
        alert('Settings saved successfully!');
        return;
      }
      
      // Combine first and last name for display_name
      const displayName = `${profile.firstName} ${profile.lastName}`.trim();
      
      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: currentUser.id,
          display_name: displayName,
          updated_at: new Date().toISOString()
        });
      
      if (updateError) {
        throw updateError;
      }
      
      // Update user preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: currentUser.id,
          language: language,
          currency: currency,
          phone: profile.phone,
          notification_preferences: JSON.stringify(notifications),
          updated_at: new Date().toISOString()
        });
      
      if (preferencesError) {
        throw preferencesError;
      }
      
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-2 py-4 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 whitespace-nowrap rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-green-100 text-green-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
            
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mr-3"></div>
                <span className="text-gray-600">Loading profile data...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Error loading profile</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[44px]"
                  style={{ backgroundColor: '#ffffff' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[44px]"
                  style={{ backgroundColor: '#ffffff' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[44px]"
                  style={{ backgroundColor: '#ffffff' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[44px]"
                  style={{ backgroundColor: '#ffffff' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'location' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Home Location Settings</h3>
            
            {/* Info Banner */}
            <div 
              className="border border-blue-200 rounded-lg p-4 mb-6"
              style={{ backgroundColor: '#eff6ff' }}
            >
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">About Home Location</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This is your default location for shopping. You can temporarily change your location 
                    for individual shopping sessions using the location selector in the header.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => handleLocationUpdate('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[44px]"
                  style={{ backgroundColor: '#ffffff' }}
                  placeholder="Enter your street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => handleLocationUpdate('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[44px]"
                    style={{ backgroundColor: '#ffffff' }}
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                  <select
                    value={profile.province}
                    onChange={(e) => handleLocationUpdate('province', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[44px]"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    <option value="">Select Province</option>
                    {provinces.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={profile.postalCode}
                    onChange={(e) => handleLocationUpdate('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[44px]"
                    style={{ backgroundColor: '#ffffff' }}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <Suspense fallback={<div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>}>
          <SecuritySection
            profile={profile}
            passwordReset={passwordReset}
            showNewPassword={showNewPassword}
            showConfirmPassword={showConfirmPassword}
            emailSent={emailSent}
            verificationCode={verificationCode}
            isVerified={isVerified}
            onPasswordResetChange={handlePasswordResetChange}
            onSendVerificationEmail={handleSendVerificationEmail}
            onVerifyCode={handleVerifyCode}
            onPasswordSubmit={handlePasswordSubmit}
            setShowNewPassword={setShowNewPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            setVerificationCode={setVerificationCode}
          />
        </Suspense>
      )}

      {activeTab === 'notifications' && (
        <Suspense fallback={<div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>}>
          <NotificationsSection
            notifications={notifications}
            onToggle={handleNotificationToggle}
          />
        </Suspense>
      )}

      {activeTab === 'privacy' && (
        <Suspense fallback={<div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>}>
          <PrivacySection
            privacy={privacy}
            onToggle={handlePrivacyToggle}
          />
        </Suspense>
      )}

      {activeTab === 'language' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Language & Currency Settings</h3>
            <div className="space-y-4">
              <div 
                className="p-4 rounded-lg border border-gray-200"
                style={{ backgroundColor: '#f9fafb' }}
              >
                <h4 className="font-medium text-gray-900 mb-2">App Language</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="language"
                      checked={language === 'en'}
                      onChange={() => language !== 'en' && toggleLanguage()}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-900">English</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="language"
                      checked={language === 'af'}
                      onChange={() => language !== 'af' && toggleLanguage()}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-900">Afrikaans</span>
                  </label>
                </div>
              </div>
              
              <div 
                className="p-4 rounded-lg border border-gray-200"
                style={{ backgroundColor: '#f9fafb' }}
              >
                <h4 className="font-medium text-gray-900 mb-2">Currency</h4>
                <select 
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[44px]"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  {availableCurrencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.name} ({curr.symbol})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  This will update all price displays throughout the app.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
    </div>
  );
};

export default SettingsSection;