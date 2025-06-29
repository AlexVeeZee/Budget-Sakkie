import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { useAuthStore } from '../store/authStore';

interface LocationSelectorProps {
  onLocationClick?: () => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationClick }) => {
  const { currentLocation, savedLocations, setCurrentLocation } = useLocation();
  const { user } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if user has an address set in their profile
  const hasAddress = user && user.address;
  
  // Get all available locations (home + saved locations)
  const allLocations = [
    ...savedLocations
  ].filter(loc => loc.id !== currentLocation.id);
  
  // Determine if we should show dropdown (more than 1 location)
  const showDropdown = allLocations.length > 0;
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // If user has no address, don't show the component
  if (!hasAddress) {
    return null;
  }

  // Handle location selection from dropdown
  const handleLocationSelect = (locationId: string) => {
    const location = savedLocations.find(loc => loc.id === locationId);
    if (location) {
      setCurrentLocation(location);
    }
    setIsDropdownOpen(false);
  };

  // Handle manage locations click
  const handleManageLocations = () => {
    setIsDropdownOpen(false);
    if (onLocationClick) {
      onLocationClick();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={showDropdown ? () => setIsDropdownOpen(!isDropdownOpen) : onLocationClick}
        className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium hover:bg-black/10 transition-colors"
        style={{ 
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
          fontSize: '14px',
          color: 'rgb(255, 255, 255)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <MapPin className="h-4 w-4" />
        <span>{currentLocation.name}</span>
        {showDropdown && (
          isDropdownOpen ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />
        )}
      </button>
      
      {/* Dropdown Menu */}
      {isDropdownOpen && showDropdown && (
        <div 
          className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200"
          style={{
            animation: 'fadeIn 0.15s ease-out',
            transformOrigin: 'top'
          }}
        >
          <div className="py-1">
            {/* Current location (disabled) */}
            <div className="flex items-center px-4 py-2 bg-green-50">
              <MapPin className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">{currentLocation.name}</span>
              <span className="ml-2 px-1.5 py-0.5 bg-green-200 text-green-800 text-xs rounded">Current</span>
            </div>
            
            {/* Other locations */}
            {allLocations.map(location => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location.id)}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span>{location.name}</span>
              </button>
            ))}
            
            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>
            
            {/* Manage Locations */}
            <button
              onClick={handleManageLocations}
              className="w-full flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              <span>Manage Locations</span>
            </button>
          </div>
        </div>
      )}
      
      {/* CSS for dropdown animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};