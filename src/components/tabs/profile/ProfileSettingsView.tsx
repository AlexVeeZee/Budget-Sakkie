import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

interface ProfileSettingsViewProps {
  onBack: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: '+27 82 123 4567',
    address: '123 Main Street',
    city: 'Centurion',
    province: 'Gauteng',
    postalCode: '0157'
  });

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would update the user profile
      console.log('Saving profile data:', formData);
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user?.displayName || '',
      email: user?.email || '',
      phone: '+27 82 123 4567',
      address: '123 Main Street',
      city: 'Centurion',
      province: 'Gauteng',
      postalCode: '0157'
    });
    setIsEditing(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your personal information and account details</p>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Change Profile Picture</h4>
            <p className="text-sm text-gray-600 mb-3">Upload a new profile picture or remove the current one</p>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                Upload New
              </button>
              <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium rounded-lg transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Display Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.displayName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Street Address
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.address}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.city}</p>
            )}
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
            {isEditing ? (
              <select
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-lg">{formData.province}</p>
            )}
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <h4 className="font-medium text-green-900">Email Verified</h4>
              <p className="text-sm text-green-700">Your email address has been verified</p>
            </div>
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <h4 className="font-medium text-blue-900">Premium Member</h4>
              <p className="text-sm text-blue-700">Access to all premium features</p>
            </div>
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">★</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};