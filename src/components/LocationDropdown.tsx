import React, { useState } from 'react';
import { MapPin, Home, Clock, Search, Navigation, X } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  type: 'home' | 'recent' | 'search';
  coordinates?: [number, number];
}

interface LocationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationDropdown: React.FC<LocationDropdownProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Location>({
    id: 'home',
    name: 'Home',
    address: '123 Main Street, Centurion, GP',
    type: 'home'
  });

  // Mock data - in real app, this would come from user settings and location history
  const homeLocation: Location = {
    id: 'home',
    name: 'Home',
    address: '123 Main Street, Centurion, GP',
    type: 'home'
  };

  const recentLocations: Location[] = [
    {
      id: 'work',
      name: 'Work',
      address: 'Sandton City, Sandton, GP',
      type: 'recent'
    },
    {
      id: 'friend',
      name: "Sarah's House",
      address: 'Pretoria East, Pretoria, GP',
      type: 'recent'
    },
    {
      id: 'mall',
      name: 'Menlyn Park',
      address: 'Menlyn Park Shopping Centre, Pretoria, GP',
      type: 'recent'
    }
  ];

  const handleLocationSelect = (location: Location) => {
    setCurrentLocation(location);
    // Close dropdown after selection
    setTimeout(() => {
      onClose();
    }, 300);
    console.log('Selected location:', location);
  };

  const handleUseCurrentLocation = () => {
    // In a real app, this would use the browser's geolocation API
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          id: 'current',
          name: 'Current Location',
          address: 'Detecting address...',
          type: 'search',
          coordinates: [position.coords.latitude, position.coords.longitude]
        };
        setCurrentLocation(newLocation);
        setTimeout(() => {
          onClose();
        }, 300);
        console.log('Using current location:', position.coords);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please check your browser permissions.');
      }
    );
  };

  const filteredLocations = [...recentLocations].filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Prevent event bubbling to avoid closing dropdown when clicking inside
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="absolute top-full right-0 mt-2 w-80 rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
      style={{ backgroundColor: '#ffffff' }}
      onClick={handleDropdownClick} // Prevent closing when clicking inside
    >
      {/* Header */}
      <div 
        className="p-4 border-b border-gray-200"
        style={{ backgroundColor: '#f9fafb' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Choose Location</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        {/* Current Selection */}
        <div 
          className="flex items-center space-x-3 p-3 rounded-lg border border-green-200"
          style={{ backgroundColor: '#f0fdf4' }}
        >
          <div className="flex-shrink-0">
            {currentLocation.type === 'home' ? (
              <Home className="h-5 w-5 text-green-600" />
            ) : (
              <MapPin className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-green-900">{currentLocation.name}</p>
            <p className="text-sm text-green-700 truncate">{currentLocation.address}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div 
        className="p-4 border-b border-gray-200"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            style={{ backgroundColor: '#ffffff' }}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
          />
        </div>
      </div>

      {/* Location Options */}
      <div 
        className="max-h-64 overflow-y-auto"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Use Current Location */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleUseCurrentLocation();
          }}
          className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <Navigation className="h-5 w-5 text-blue-600" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Use Current Location</p>
            <p className="text-sm text-gray-600">Detect my location automatically</p>
          </div>
        </button>

        {/* Home Location */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLocationSelect(homeLocation);
          }}
          className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
            currentLocation.id === homeLocation.id ? 'bg-green-50' : ''
          }`}
        >
          <Home className={`h-5 w-5 ${currentLocation.id === homeLocation.id ? 'text-green-600' : 'text-gray-600'}`} />
          <div className="text-left flex-1">
            <div className="flex items-center space-x-2">
              <p className={`font-medium ${currentLocation.id === homeLocation.id ? 'text-green-900' : 'text-gray-900'}`}>
                {homeLocation.name}
              </p>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                Default
              </span>
            </div>
            <p className={`text-sm truncate ${currentLocation.id === homeLocation.id ? 'text-green-700' : 'text-gray-600'}`}>
              {homeLocation.address}
            </p>
          </div>
        </button>

        {/* Recent Locations */}
        {filteredLocations.length > 0 && (
          <>
            <div 
              className="px-4 py-2 border-b border-gray-100"
              style={{ backgroundColor: '#f9fafb' }}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Recent Locations</span>
              </div>
            </div>
            
            {filteredLocations.map((location) => (
              <button
                key={location.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLocationSelect(location);
                }}
                className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition-colors ${
                  currentLocation.id === location.id ? 'bg-green-50' : ''
                }`}
              >
                <MapPin className={`h-5 w-5 ${currentLocation.id === location.id ? 'text-green-600' : 'text-gray-600'}`} />
                <div className="text-left flex-1">
                  <p className={`font-medium ${currentLocation.id === location.id ? 'text-green-900' : 'text-gray-900'}`}>
                    {location.name}
                  </p>
                  <p className={`text-sm truncate ${currentLocation.id === location.id ? 'text-green-700' : 'text-gray-600'}`}>
                    {location.address}
                  </p>
                </div>
              </button>
            ))}
          </>
        )}

        {/* No Results */}
        {searchQuery && filteredLocations.length === 0 && (
          <div className="p-4 text-center">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No locations found</p>
            <p className="text-xs text-gray-500">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className="p-4 border-t border-gray-200"
        style={{ backgroundColor: '#f9fafb' }}
      >
        <div className="text-center">
          <p className="text-xs text-gray-600">
            This location is for this shopping session only.
          </p>
          <p className="text-xs text-gray-500">
            Change your home address in Settings.
          </p>
        </div>
      </div>
    </div>
  );
};