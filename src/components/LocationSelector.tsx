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
  
  // Get all available locations (excluding recent locations)
  const allLocations = savedLocations;
  
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

  // If user has only one location (home), show as a button
  if (allLocations.length <= 1) {
    return (
      <button
        onClick={onLocationClick}
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
      </button>
    );
  }

  // If user has multiple locations, show as a dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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
        {isDropdownOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      
      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div 
          className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg overflow-hidden z-10"
          style={{
            animation: 'fadeIn 0.15s ease-out',
            transformOrigin: 'top'
          }}
        >
          <div className="py-1">
            {allLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => {
                  setCurrentLocation(location);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  currentLocation.id === location.id
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {location.name}
              </button>
            ))}
            
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => {
                  if (onLocationClick) {
                    onLocationClick();
                    setIsDropdownOpen(false);
                  }
                }}
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
              >
                <Settings className="h-3 w-3 mr-2" />
                Manage Locations
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Animation styles */}
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