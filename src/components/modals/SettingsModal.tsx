import React, { useState } from 'react';
import { X, User, MapPin, Lock, Bell, Globe, Shield, Save, Edit2, Eye, EyeOff, Mail, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocation } from '../../hooks/useLocation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { homeLocation, recentLocations, updateHomeLocation, removeRecentLocation, clearRecentLocations } = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'Sarah',
    lastName: 'Van Der Merwe',
    email: 'sarah.vandermerwe@email.com',
    phone: '+27 82 123 4567',
    address: homeLocation.address.split(',')[0] || '123 Main Street',
    city: homeLocation.address.split(',')[1]?.trim() || 'Centurion',
    province: 'Gauteng',
    postalCode: '0157'
  });

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
    { id: 'language', label: 'Language', icon: Globe }
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
    
    // Update the home location when address fields change
    const updatedProfile = { ...profile, [field]: value };
    const newAddress = `${updatedProfile.address}, ${updatedProfile.city}, ${updatedProfile.province}`;
    
    updateHomeLocation({
      id: 'home',
      name: 'Home',
      address: newAddress,
      type: 'home'
    });
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

  const handleSave = () => {
    console.log('Saving settings...', { profile, notifications, privacy });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 text-white"
        >
          <h2 className="text-2xl font-bold">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div 
          className="flex h-[calc(90vh-120px)]"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* Sidebar */}
          <div 
            className="w-64 border-r border-gray-200 p-4"
            style={{ backgroundColor: '#f9fafb' }}
          >
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left border ${
                    activeTab === tab.id
                      ? 'text-green-700 border-green-200'
                      : 'text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                  style={{ 
                    backgroundColor: activeTab === tab.id ? '#f0fdf4' : '#ffffff'
                  }}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div 
            className="flex-1 p-6 overflow-y-auto"
            style={{ backgroundColor: '#ffffff' }}
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleProfileUpdate('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={profile.city}
                          onChange={(e) => handleLocationUpdate('city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          style={{ backgroundColor: '#ffffff' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                        <select
                          value={profile.province}
                          onChange={(e) => handleLocationUpdate('province', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          style={{ backgroundColor: '#ffffff' }}
                        >
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          style={{ backgroundColor: '#ffffff' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recent Locations Management */}
                  {recentLocations.length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Recent Locations</h4>
                        <button
                          onClick={clearRecentLocations}
                          className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                          Clear All
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {recentLocations.map((location) => (
                          <div 
                            key={location.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                            style={{ backgroundColor: '#f9fafb' }}
                          >
                            <div className="flex items-center space-x-3">
                              <MapPin className="h-4 w-4 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">{location.name}</p>
                                <p className="text-sm text-gray-600">{location.address}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeRecentLocation(location.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-3">
                        These are locations you've used recently for shopping. They appear in the location dropdown for quick access.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Password Reset</h3>
                  
                  {/* Security Notice */}
                  <div 
                    className="border border-orange-200 rounded-lg p-4 mb-6"
                    style={{ backgroundColor: '#fff7ed' }}
                  >
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900">Security Notice</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          For your security, we'll send a verification code to your registered email address. 
                          This ensures only the original account holder can change the password.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Step 1: Email Verification */}
                    <div 
                      className={`p-4 rounded-lg border ${isVerified ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                          <span>Step 1: Verify Your Identity</span>
                          {isVerified && <CheckCircle className="h-5 w-5 text-green-600" />}
                        </h4>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Read-only email display */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verification code will be sent to:
                          </label>
                          <div 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-mono"
                          >
                            {profile.email}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            This email address cannot be changed during password reset for security reasons.
                          </p>
                        </div>

                        {!emailSent ? (
                          <button
                            onClick={handleSendVerificationEmail}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                            <span>Send Verification Code</span>
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <div 
                              className="p-3 rounded-lg border border-green-200"
                              style={{ backgroundColor: '#f0fdf4' }}
                            >
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <p className="text-sm text-green-700 font-medium">
                                  Verification code sent successfully!
                                </p>
                              </div>
                              <p className="text-sm text-green-600 mt-1">
                                Check your inbox at {profile.email}
                              </p>
                            </div>
                            
                            {!isVerified && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Enter verification code:
                                </label>
                                <div className="flex space-x-2">
                                  <input
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-center"
                                    style={{ backgroundColor: '#ffffff' }}
                                    maxLength={6}
                                  />
                                  <button
                                    onClick={handleVerifyCode}
                                    disabled={verificationCode.length !== 6}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                                  >
                                    Verify
                                  </button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-600">
                                    Demo: Use code "123456" to verify
                                  </p>
                                  <button
                                    onClick={handleSendVerificationEmail}
                                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                                  >
                                    Resend code
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step 2: New Password */}
                    <div 
                      className={`p-4 rounded-lg border ${
                        isVerified ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <h4 className="font-medium text-gray-900 mb-3">Step 2: Set New Password</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordReset.newPassword}
                              onChange={(e) => handlePasswordResetChange('newPassword', e.target.value)}
                              disabled={!isVerified}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                              style={{ backgroundColor: isVerified ? '#ffffff' : '#f3f4f6' }}
                              placeholder="Minimum 8 characters"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              disabled={!isVerified}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordReset.confirmPassword}
                              onChange={(e) => handlePasswordResetChange('confirmPassword', e.target.value)}
                              disabled={!isVerified}
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                              style={{ backgroundColor: isVerified ? '#ffffff' : '#f3f4f6' }}
                              placeholder="Confirm your new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={!isVerified}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                            </button>
                          </div>
                        </div>

                        {/* Password validation feedback */}
                        {passwordReset.newPassword && (
                          <div className="space-y-1">
                            <div className={`text-xs flex items-center space-x-1 ${
                              passwordReset.newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <span>{passwordReset.newPassword.length >= 8 ? '✓' : '✗'}</span>
                              <span>At least 8 characters</span>
                            </div>
                            {passwordReset.confirmPassword && (
                              <div className={`text-xs flex items-center space-x-1 ${
                                passwordReset.newPassword === passwordReset.confirmPassword ? 'text-green-600' : 'text-red-600'
                              }`}>
                                <span>{passwordReset.newPassword === passwordReset.confirmPassword ? '✓' : '✗'}</span>
                                <span>Passwords match</span>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          onClick={handlePasswordSubmit}
                          disabled={
                            !isVerified || 
                            !passwordReset.newPassword || 
                            !passwordReset.confirmPassword || 
                            passwordReset.newPassword !== passwordReset.confirmPassword ||
                            passwordReset.newPassword.length < 8
                          }
                          className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                        >
                          <Lock className="h-4 w-4" />
                          <span>Update Password</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div 
                        key={key} 
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                        style={{ backgroundColor: '#f9fafb' }}
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {key === 'priceAlerts' && 'Price Alerts'}
                            {key === 'dealNotifications' && 'Deal Notifications'}
                            {key === 'listReminders' && 'Shopping List Reminders'}
                            {key === 'weeklyReports' && 'Weekly Savings Reports'}
                            {key === 'emailUpdates' && 'Email Updates'}
                            {key === 'smsAlerts' && 'SMS Alerts'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {key === 'priceAlerts' && 'Get notified when prices drop on your favorite items'}
                            {key === 'dealNotifications' && 'Receive alerts about special deals and promotions'}
                            {key === 'listReminders' && 'Reminders about incomplete shopping lists'}
                            {key === 'weeklyReports' && 'Weekly summary of your savings and shopping activity'}
                            {key === 'emailUpdates' && 'Product updates and news via email'}
                            {key === 'smsAlerts' && 'Urgent alerts via SMS'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    {Object.entries(privacy).map(([key, value]) => (
                      <div 
                        key={key} 
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                        style={{ backgroundColor: '#f9fafb' }}
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {key === 'shareLocation' && 'Share Location'}
                            {key === 'shareShoppingLists' && 'Share Shopping Lists'}
                            {key === 'allowAnalytics' && 'Analytics & Performance'}
                            {key === 'marketingEmails' && 'Marketing Communications'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {key === 'shareLocation' && 'Allow us to use your location for better store recommendations'}
                            {key === 'shareShoppingLists' && 'Allow family members to view and edit your shopping lists'}
                            {key === 'allowAnalytics' && 'Help us improve the app by sharing anonymous usage data'}
                            {key === 'marketingEmails' && 'Receive promotional emails and special offers'}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePrivacyToggle(key as keyof typeof privacy)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Language & Region</h3>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        style={{ backgroundColor: '#ffffff' }}
                      >
                        <option value="ZAR">South African Rand (R)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-between p-6 border-t border-gray-200"
          style={{ backgroundColor: '#ffffff' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ backgroundColor: '#ffffff' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};