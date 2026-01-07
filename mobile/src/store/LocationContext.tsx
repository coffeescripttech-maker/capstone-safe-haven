// Location Context

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Location } from '../types/models';
import { STORAGE_KEYS } from '../constants/config';
import { storeData, getData } from '../utils/storage';
import { getCurrentLocation, requestLocationPermission } from '../utils/location';

interface LocationContextData {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  updateLocation: () => Promise<void>;
  setManualLocation: (location: Location) => void;
}

const LocationContext = createContext<LocationContextData>({} as LocationContextData);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // Load cached location on mount
  useEffect(() => {
    loadCachedLocation();
    checkPermission();
  }, []);

  const loadCachedLocation = async () => {
    try {
      const cached = await getData<Location>(STORAGE_KEYS.LAST_LOCATION);
      if (cached) {
        setLocation(cached);
      }
    } catch (error) {
      console.error('Error loading cached location:', error);
    }
  };

  const checkPermission = async () => {
    try {
      const granted = await requestLocationPermission();
      setHasPermission(granted);
      
      if (granted) {
        await updateLocation();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await requestLocationPermission();
      setHasPermission(granted);
      
      if (granted) {
        await updateLocation();
      }
      
      return granted;
    } catch (err) {
      setError('Failed to request location permission');
      return false;
    }
  };

  const updateLocation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newLocation = await getCurrentLocation();
      setLocation(newLocation);
      
      // Cache location
      await storeData(STORAGE_KEYS.LAST_LOCATION, newLocation);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('Error updating location:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const setManualLocation = (newLocation: Location) => {
    setLocation(newLocation);
    storeData(STORAGE_KEYS.LAST_LOCATION, newLocation);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        hasPermission,
        requestPermission,
        updateLocation,
        setManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
