import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export interface Location {
  id: string;
  name: string;
  address: string;
  type: 'home' | 'recent' | 'current' | 'search';
  coordinates?: [number, number];
  timestamp?: string;
}

interface LocationState {
  homeLocation: Location;
  currentLocation: Location;
  recentLocations: Location[];
}

export const useLocation = () => {
  const { user } = useAuthStore();
  
  // Initialize with default or user-specific home location
  const getDefaultHomeLocation = (): Location => {
    if (user && user.address && user.city) {
      return {
        id: 'home',
        name: 'Home',
        address: `${user.address}, ${user.city}, ${user.province || 'GP'}`,
        type: 'home',
        coordinates: [-25.8553, 28.1881] // Default coordinates
      };
    }
    
    return {
      id: 'home',
      name: 'Home',
      address: '123 Main Street, Centurion, GP',
      type: 'home',
      coordinates: [-25.8553, 28.1881]
    };
  };

  const [locationState, setLocationState] = useState<LocationState>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('budgetSakkie_locations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          homeLocation: parsed.homeLocation || getDefaultHomeLocation(),
          currentLocation: parsed.currentLocation || getDefaultHomeLocation(),
          recentLocations: parsed.recentLocations || []
        };
      } catch (error) {
        console.error('Error parsing saved locations:', error);
      }
    }
    
    return {
      homeLocation: getDefaultHomeLocation(),
      currentLocation: getDefaultHomeLocation(),
      recentLocations: []
    };
  });

  // Update home location when user profile changes
  useEffect(() => {
    if (user && user.address && user.city) {
      const homeLocation = {
        id: 'home',
        name: 'Home',
        address: `${user.address}, ${user.city}, ${user.province || 'GP'}`,
        type: 'home' as const,
        coordinates: [-25.8553, 28.1881] // Default coordinates
      };
      
      setLocationState(prev => ({
        ...prev,
        homeLocation,
        // If current location was home, update it too
        currentLocation: prev.currentLocation.id === 'home' ? homeLocation : prev.currentLocation
      }));
    }
  }, [user]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('budgetSakkie_locations', JSON.stringify(locationState));
  }, [locationState]);

  const updateHomeLocation = useCallback((location: Location) => {
    const homeLocation = { ...location, type: 'home' as const };
    setLocationState(prev => ({
      ...prev,
      homeLocation,
      // If current location was home, update it too
      currentLocation: prev.currentLocation.id === 'home' ? homeLocation : prev.currentLocation
    }));
  }, []);

  const setCurrentLocation = useCallback((location: Location) => {
    setLocationState(prev => {
      let newRecentLocations = prev.recentLocations;
      
      // If this is not the home location and not already in recent locations, add it
      if (location.id !== 'home' && location.type !== 'home') {
        const existingIndex = newRecentLocations.findIndex(loc => 
          loc.id === location.id || 
          (loc.address === location.address && loc.name === location.name)
        );
        
        const locationWithTimestamp = {
          ...location,
          type: 'recent' as const,
          timestamp: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
          // Update existing location and move to front
          newRecentLocations = [
            locationWithTimestamp,
            ...newRecentLocations.filter((_, index) => index !== existingIndex)
          ];
        } else {
          // Add new location to front
          newRecentLocations = [locationWithTimestamp, ...newRecentLocations];
        }
        
        // Keep only the 5 most recent locations
        newRecentLocations = newRecentLocations.slice(0, 5);
      }
      
      return {
        ...prev,
        currentLocation: location,
        recentLocations: newRecentLocations
      };
    });
  }, []);

  const resetToHome = useCallback(() => {
    setLocationState(prev => ({
      ...prev,
      currentLocation: prev.homeLocation
    }));
  }, []);

  const removeRecentLocation = useCallback((locationId: string) => {
    setLocationState(prev => ({
      ...prev,
      recentLocations: prev.recentLocations.filter(loc => loc.id !== locationId)
    }));
  }, []);

  const clearRecentLocations = useCallback(() => {
    setLocationState(prev => ({
      ...prev,
      recentLocations: []
    }));
  }, []);

  return {
    homeLocation: locationState.homeLocation,
    currentLocation: locationState.currentLocation,
    recentLocations: locationState.recentLocations,
    updateHomeLocation,
    setCurrentLocation,
    resetToHome,
    removeRecentLocation,
    clearRecentLocations,
    isUsingHome: locationState.currentLocation.id === locationState.homeLocation.id
  };
};