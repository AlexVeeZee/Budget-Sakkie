import React, { useState } from 'react';
import { ArrowLeft, Shield, Lock, Key, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';

interface SecuritySettingsViewProps {
  onBack: () => void;
}

export const SecuritySettingsView: React.FC<SecuritySettingsViewProps> = ({ onBack }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      alert('Failed to update password. Please try again.');
    }
  };

  const handleToggle2FA = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTwoFactorEnabled(!twoFactorEnabled);
      alert(twoFactorEnabled ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled');
    } catch (error) {
      alert('Failed to update two-factor authentication settings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600">Manage your account security and authentication</p>
        </div>
      </div>

      {/* Security Overview */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-medium text-green-900">Strong Password</h4>
                <p className="text-sm text-green-700">Your password meets security requirements</p>
              </div>
            </div>
          </div>
          
          <div className={`p-4 border rounded-lg ${twoFactorEnabled ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center space-x-3">
              {twoFactorEnabled ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              )}
              <div>
                <h4 className={`font-medium ${twoFactorEnabled ? 'text-green-900' : 'text-yellow-900'}`}>
                  Two-Factor Auth
                </h4>
                <p className={`text-sm ${twoFactorEnabled ? 'text-green-700' : 'text-yellow-700'}`}>
                  {twoFactorEnabled ? 'Enabled and active' : 'Not enabled'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Account Verified</h4>
                <p className="text-sm text-blue-700">Email address confirmed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Management */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Password Management</h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPasswordForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-sm text-gray-600 mt-1">Must be at least 8 characters long</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <button
              onClick={handlePasswordChange}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Update Password
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Lock className="h-6 w-6 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">Password</h4>
              <p className="text-sm text-gray-600">Last changed 30 days ago</p>
            </div>
          </div>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-4">
            <Smartphone className="h-6 w-6 text-gray-600" />
            <div>
              <h4 className="font-medium text-gray-900">Authenticator App</h4>
              <p className="text-sm text-gray-600">
                {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Add an extra layer of security to your account'}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle2FA}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              twoFactorEnabled ? 'bg-green-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Two-factor authentication is active</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your account is protected with two-factor authentication using your authenticator app.
            </p>
          </div>
        )}
      </div>

      {/* Login Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Login Notifications</h3>
        
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Email notifications for new logins</h4>
            <p className="text-sm text-gray-600">Get notified when someone signs in to your account</p>
          </div>
          <button
            onClick={() => setLoginNotifications(!loginNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              loginNotifications ? 'bg-green-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                loginNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Activity</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Successful login</h4>
                <p className="text-sm text-gray-600">Chrome on Windows • Centurion, GP</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Password changed</h4>
                <p className="text-sm text-gray-600">Password updated successfully</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">1 week ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};