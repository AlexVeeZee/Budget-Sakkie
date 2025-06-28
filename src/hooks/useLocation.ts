import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export interface Location {
  id: string;
  name: string;
  address: string;
  type: 'home' | 'work' | 'recent' | 'current' | 'search' | 'travel';
  coordinates?: [number, number];
  timestamp?: string;
  isDefault?: boolean;
}

interface LocationState {
  homeLocation: Location;
  currentLocation: Location;
  savedLocations: Location[];
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
        coordinates: [-25.8553, 28.1881], // Default coordinates
        isDefault: true
      };
    }
    
    return {
      id: 'home',
      name: 'Home',
      address: '123 Main Street, Centurion, GP',
      type: 'home',
      coordinates: [-25.8553, 28.1881],
      isDefault: true
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
          savedLocations: parsed.savedLocations || [],
          recentLocations: parsed.recentLocations || []
        };
      } catch (error) {
        console.error('Error parsing saved locations:', error);
      }
    }
    
    return {
      homeLocation: getDefaultHomeLocation(),
      currentLocation: getDefaultHomeLocation(),
      savedLocations: [],
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
        coordinates: [-25.8553, 28.1881], // Default coordinates
        isDefault: true
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
    const homeLocation = { ...location, type: 'home' as const, isDefault: true };
    setLocationState(prev => ({
      ...prev,
      homeLocation,
      // If current location was home, update it too
      currentLocation: prev.currentLocation.id === 'home' ? homeLocation : prev.currentLocation,
      // Update in saved locations if it exists
      savedLocations: prev.savedLocations.map(loc => 
        loc.id === 'home' ? homeLocation : loc
      )
    }));
  }, []);

  const addSavedLocation = useCallback((location: Location) => {
    const locationWithType = { 
      ...location, 
      id: location.id || `location-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isDefault: false
    };
    
    setLocationState(prev => {
      // Check if location with same ID already exists
      const exists = prev.savedLocations.some(loc => loc.id === locationWithType.id);
      
      if (exists) {
        // Update existing location
        return {
          ...prev,
          savedLocations: prev.savedLocations.map(loc => 
            loc.id === locationWithType.id ? locationWithType : loc
          )
        };
      } else {
        // Add new location
        return {
          ...prev,
          savedLocations: [...prev.savedLocations, locationWithType]
        };
      }
    });
  }, []);

  const removeSavedLocation = useCallback((locationId: string) => {
    // Don't allow removing home location
    if (locationId === 'home') return;
    
    setLocationState(prev => ({
      ...prev,
      savedLocations: prev.savedLocations.filter(loc => loc.id !== locationId),
      // If current location is being removed, reset to home
      currentLocation: prev.currentLocation.id === locationId ? prev.homeLocation : prev.currentLocation
    }));
  }, []);

  const setDefaultLocation = useCallback((locationId: string) => {
    setLocationState(prev => ({
      ...prev,
      savedLocations: prev.savedLocations.map(loc => ({
        ...loc,
        isDefault: loc.id === locationId
      }))
    }));
  }, []);

  const setCurrentLocation = useCallback((location: Location) => {
    setLocationState(prev => {
      let newRecentLocations = prev.recentLocations;
      
      // If this is not a saved location and not already in recent locations, add it
      if (!prev.savedLocations.some(loc => loc.id === location.id) && 
          location.id !== 'home' && 
          location.type !== 'home') {
        
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

  const getAllLocations = useCallback(() => {
    return [
      locationState.homeLocation,
      ...locationState.savedLocations.filter(loc => loc.id !== 'home'),
      ...locationState.recentLocations
    ];
  }, [locationState.homeLocation, locationState.savedLocations, locationState.recentLocations]);

  return {
    homeLocation: locationState.homeLocation,
    currentLocation: locationState.currentLocation,
    savedLocations: locationState.savedLocations,
    recentLocations: locationState.recentLocations,
    updateHomeLocation,
    addSavedLocation,
    removeSavedLocation,
    setDefaultLocation,
    setCurrentLocation,
    resetToHome,
    removeRecentLocation,
    clearRecentLocations,
    getAllLocations,
    isUsingHome: locationState.currentLocation.id === locationState.homeLocation.id
  };
};