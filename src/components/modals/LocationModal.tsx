import React, { useState } from 'react';
import { X, MapPin, Home, Navigation, Search, Save, Trash2, Clock } from 'lucide-react';
import { useLocation } from '../../hooks/useLocation';

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

  const [homeAddress, setHomeAddress] = useState({
    street: homeLocation.address.split(',')[0] || '',
    city: homeLocation.address.split(',')[1]?.trim() || '',
    province: homeLocation.address.split(',')[2]?.trim() || 'Gauteng'
  });

  const [searchQuery, setSearchQuery] = useState('');

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  const handleSaveHomeLocation = () => {
    const newAddress = `${homeAddress.street}, ${homeAddress.city}, ${homeAddress.province}`;
    updateHomeLocation({
      id: 'home',
      name: 'Home',
      address: newAddress,
      type: 'home'
    });
    alert('Home location updated successfully!');
  };

  const handleUseCurrentLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        const newLocation = {
          id: 'current-' + Date.now(),
          name: 'Current Location',
          address: 'Detecting address...',
          type: 'current' as const,
          coordinates: [position.coords.latitude, position.coords.longitude] as [number, number]
        };
        setCurrentLocation(newLocation);
        alert('Using your current location for this shopping session.');
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please check your browser permissions.');
      }
    );
  };

  const handleSelectRecentLocation = (location: any) => {
    setCurrentLocation(location);
    alert(`Now using ${location.name} for this shopping session.`);
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
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Navigation className="h-4 w-4" />
                <span>Use Current Location</span>
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
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>Save Home Location</span>
              </button>
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