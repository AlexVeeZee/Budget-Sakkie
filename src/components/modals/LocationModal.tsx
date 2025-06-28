import React, { useState, useEffect } from 'react';
import { X, MapPin, Home, Navigation, Search, Save, Trash2, Clock, AlertCircle, Info, Plus, Briefcase, MapPinOff, Check } from 'lucide-react';
import { useLocation, Location } from '../../hooks/useLocation';
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
    savedLocations,
    recentLocations, 
    updateHomeLocation, 
    setCurrentLocation,
    addSavedLocation,
    removeSavedLocation,
    setDefaultLocation,
    removeRecentLocation,
    clearRecentLocations 
  } = useLocation();
  
  const { user, updateProfile } = useAuthStore();

  const [homeAddress, setHomeAddress] = useState({
    street: homeLocation.address.split(',')[0] || '',
    city: homeLocation.address.split(',')[1]?.trim() || '',
    province: homeLocation.address.split(',')[2]?.trim() || 'Gauteng'
  });

  const [newLocation, setNewLocation] = useState({
    name: '',
    street: '',
    city: '',
    province: 'Gauteng',
    type: 'work' as 'work' | 'travel'
  });

  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
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
      setShowAddLocationForm(false);
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
          address: homeAddress.street,
          city: homeAddress.city,
          province: homeAddress.province
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

  const handleAddLocation = () => {
    if (!newLocation.name || !newLocation.street || !newLocation.city) {
      return;
    }
    
    const address = `${newLocation.street}, ${newLocation.city}, ${newLocation.province}`;
    
    addSavedLocation({
      id: `${newLocation.type}-${Date.now()}`,
      name: newLocation.name,
      address: address,
      type: newLocation.type,
      coordinates: [-25.8553, 28.1881] // Default coordinates
    });
    
    // Reset form
    setNewLocation({
      name: '',
      street: '',
      city: '',
      province: 'Gauteng',
      type: 'work'
    });
    
    setShowAddLocationForm(false);
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

  const handleSelectLocation = (location: Location) => {
    setCurrentLocation(location);
  };

  const dismissLocationError = () => {
    setLocationError(null);
  };

  // Filter saved locations to exclude home (since it's shown separately)
  const filteredSavedLocations = savedLocations.filter(loc => loc.id !== 'home');

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
                  ) : currentLocation.type === 'work' ? (
                    <Briefcase className="h-6 w-6 text-blue-600" />
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

          {/* Saved Locations */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Saved Locations</h3>
              <button
                onClick={() => setShowAddLocationForm(!showAddLocationForm)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Add Location</span>
              </button>
            </div>

            {/* Add Location Form */}
            {showAddLocationForm && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Add New Location</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                      <input
                        type="text"
                        value={newLocation.name}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Work, Vacation Home, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                      <select
                        value={newLocation.type}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, type: e.target.value as 'work' | 'travel' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="work">Work</option>
                        <option value="travel">Travel</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={newLocation.street}
                      onChange={(e) => setNewLocation(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={newLocation.city}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Centurion"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                      <select
                        value={newLocation.province}
                        onChange={(e) => setNewLocation(prev => ({ ...prev, province: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {provinces.map((province) => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddLocationForm(false)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddLocation}
                      disabled={!newLocation.name || !newLocation.street || !newLocation.city}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                      Add Location
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {filteredSavedLocations.length > 0 ? (
              <div className="space-y-3">
                {filteredSavedLocations.map((location) => (
                  <div 
                    key={location.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      {location.type === 'work' ? (
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      ) : location.type === 'travel' ? (
                        <MapPin className="h-5 w-5 text-purple-600" />
                      ) : (
                        <MapPin className="h-5 w-5 text-gray-600" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="font-medium text-gray-900">{location.name}</p>
                          {location.isDefault && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{location.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSelectLocation(location)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        Use Now
                      </button>
                      <button
                        onClick={() => setDefaultLocation(location.id)}
                        disabled={location.isDefault}
                        className={`p-1 rounded-full ${location.isDefault ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'} transition-colors`}
                        title={location.isDefault ? "Default location" : "Set as default"}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeSavedLocation(location.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove location"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                <MapPinOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">No saved locations yet</p>
                <button
                  onClick={() => setShowAddLocationForm(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Add your first location
                </button>
              </div>
            )}
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
                        onClick={() => handleSelectLocation(location)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        Use Now
                      </button>
                      <button
                        onClick={() => {
                          // Save this location
                          addSavedLocation({
                            ...location,
                            type: 'travel',
                            id: `saved-${Date.now()}`
                          });
                          // Remove from recent
                          removeRecentLocation(location.id);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Save location"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeRecentLocation(location.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Remove location"
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