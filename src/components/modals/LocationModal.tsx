import React, { useState, useEffect } from 'react';
import { X, MapPin, Home, Navigation, Search, Save, Trash2, Clock, AlertCircle, Info } from 'lucide-react';
import { useLocation } from '../../hooks/useLocation';
import { useAuthStore } from '../../store/authStore';
import { ProfileService } from '../../services/profileService';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { 
    homeLocation, 
    currentLocation, 
    recentLocations, 
    updateHomeLocation, 
    setCurrentLocation,
    removeRecentLocation,
    clearRecentLocations 
  } = useLocation();
  
  const { user, updateProfile } = useAuthStore();

  const [homeAddress, setHomeAddress] = useState({
    street: homeLocation.address.split(',')[0] || '',
    city: homeLocation.address.split(',')[1]?.trim() || '',
    province: homeLocation.address.split(',')[2]?.trim() || 'Gauteng'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  // Update home address state when homeLocation changes
  useEffect(() => {
    if (isOpen) {
      setHomeAddress({
        street: homeLocation.address.split(',')[0] || '',
        city: homeLocation.address.split(',')[1]?.trim() || '',
        province: homeLocation.address.split(',')[2]?.trim() || 'Gauteng'
      });
      // Clear any previous location errors when modal opens
      setLocationError(null);
    }
  }, [isOpen, homeLocation]);

  const handleSaveHomeLocation = async () => {
    setIsSaving(true);
    
    try {
      const newAddress = `${homeAddress.street}, ${homeAddress.city}, ${homeAddress.province}`;
      
      // Update location in the location hook
      updateHomeLocation({
        id: 'home',
        name: 'Home',
        address: newAddress,
        type: 'home'
      });
      
      // If user is authenticated, also update their profile in the database
      if (user && !user.isGuest) {
        await ProfileService.updateUserProfile({
          address: homeAddress.street,
          city: homeAddress.city,
          province: homeAddress.province
        });
        
        // Update user in auth store
        await updateProfile({
          address: homeAddress.street
        });
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving home location:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getLocationErrorMessage = (error: GeolocationPositionError) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location access was denied. To use your current location, please enable location permissions for this site in your browser settings.";
      case error.POSITION_UNAVAILABLE:
        return "Your location information is unavailable. Please check your device's location settings.";
      case error.TIMEOUT:
        return "Location request timed out. Please try again.";
      default:
        return "An unknown error occurred while getting your location. Please try again.";
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          id: 'current-' + Date.now(),
          name: 'Current Location',
          address: 'Detecting address...',
          type: 'current' as const,
          coordinates: [position.coords.latitude, position.coords.longitude] as [number, number]
        };
        setCurrentLocation(newLocation);
        setIsGettingLocation(false);
        setLocationError(null);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationError(getLocationErrorMessage(error));
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleSelectRecentLocation = (location: any) => {
    setCurrentLocation(location);
  };

  const dismissLocationError = () => {
    setLocationError(null);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed top-0 bottom-0 right-0 z-50 flex"
      style={{ 
        left: '320px', // Start right after sidebar
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <div 
        className="w-full max-w-2xl bg-white shadow-2xl overflow-hidden border-l border-gray-200"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 via-orange-500 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Location Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Location Error Alert */}
          {locationError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-red-800 mb-1">Location Access Issue</h4>
                  <p className="text-sm text-red-700 mb-3">{locationError}</p>
                  {locationError.includes("denied") && (
                    <div className="text-xs text-red-600 bg-red-100 p-2 rounded border">
                      <strong>How to enable location access:</strong>
                      <br />• Click the padlock icon in your browser's address bar
                      <br />• Select "Site settings" or "Permissions"
                      <br />• Set "Location" to "Allow"
                      <br />• Refresh the page and try again
                    </div>
                  )}
                </div>
                <button
                  onClick={dismissLocationError}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Current Session Location */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Shopping Session</h3>
            <div 
              className="p-4 rounded-lg border border-green-200"
              style={{ backgroundColor: '#f0fdf4' }}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {currentLocation.type === 'home' ? (
                    <Home className="h-6 w-6 text-green-600" />
                  ) : (
                    <MapPin className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-900">{currentLocation.name}</p>
                  <p className="text-sm text-green-700">{currentLocation.address}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleUseCurrentLocation}
                disabled={isGettingLocation}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isGettingLocation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Getting Location...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-4 w-4" />
                    <span>Use Current Location</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setCurrentLocation(homeLocation)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Use Home</span>
              </button>
            </div>
          </div>

          {/* Home Location Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Home Location (Default)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={homeAddress.street}
                  onChange={(e) => setHomeAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  style={{ backgroundColor: '#ffffff' }}
                  placeholder="123 Main Street"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={homeAddress.city}
                    onChange={(e) => setHomeAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    style={{ backgroundColor: '#ffffff' }}
                    placeholder="Centurion"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                  <select
                    value={homeAddress.province}
                    onChange={(e) => setHomeAddress(prev => ({ ...prev, province: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    style={{ backgroundColor: '#ffffff' }}
                  >
                    {provinces.map((province) => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                onClick={handleSaveHomeLocation}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Home Location</span>
                  </>
                )}
              </button>
              
              {saveSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700">Home location saved successfully!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Locations */}
          {recentLocations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Locations</h3>
                <button
                  onClick={clearRecentLocations}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-3">
                {recentLocations.map((location) => (
                  <div 
                    key={location.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{location.name}</p>
                        <p className="text-sm text-gray-600">{location.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSelectRecentLocation(location)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        Use Now
                      </button>
                      <button
                        onClick={() => removeRecentLocation(location.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div 
                className="mt-4 p-3 rounded-lg border border-blue-200"
                style={{ backgroundColor: '#eff6ff' }}
              >
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Recent locations are for temporary shopping sessions only. 
                  Your home location remains your default for all future sessions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};