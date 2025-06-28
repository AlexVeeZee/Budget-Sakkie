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

  // Show as a button regardless of number of locations
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
};