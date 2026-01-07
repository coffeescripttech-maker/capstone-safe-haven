// Alerts Context

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { DisasterAlert, AlertType, AlertSeverity } from '../types/models';
import { alertsService } from '../services/alerts';
import { STORAGE_KEYS, REFRESH_INTERVALS } from '../constants/config';
import { storeData, getData } from '../utils/storage';
import { handleApiError } from '../services/api';

interface AlertContextData {
  alerts: DisasterAlert[];
  isLoading: boolean;
  error: string | null;
  fetchAlerts: (filters?: {
    type?: AlertType;
    severity?: AlertSeverity;
    lat?: number;
    lng?: number;
    radius?: number;
  }) => Promise<void>;
  getAlertById: (id: number) => Promise<DisasterAlert>;
  searchAlerts: (query: string) => Promise<DisasterAlert[]>;
  refreshAlerts: () => Promise<void>;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<DisasterAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cached alerts on mount
  useEffect(() => {
    loadCachedAlerts();
    
    // Auto-refresh alerts
    const interval = setInterval(() => {
      refreshAlerts();
    }, REFRESH_INTERVALS.ALERTS);

    return () => clearInterval(interval);
  }, []);

  const loadCachedAlerts = async () => {
    try {
      const cached = await getData<DisasterAlert[]>(STORAGE_KEYS.OFFLINE_ALERTS);
      if (cached) {
        setAlerts(cached);
      }
    } catch (error) {
      console.error('Error loading cached alerts:', error);
    }
  };

  const fetchAlerts = async (filters?: {
    type?: AlertType;
    severity?: AlertSeverity;
    lat?: number;
    lng?: number;
    radius?: number;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { alerts: fetchedAlerts } = await alertsService.getAlerts({
        ...filters,
        isActive: true,
      });
      
      setAlerts(fetchedAlerts);
      
      // Cache for offline use
      await storeData(STORAGE_KEYS.OFFLINE_ALERTS, fetchedAlerts);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error fetching alerts:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertById = async (id: number): Promise<DisasterAlert> => {
    try {
      return await alertsService.getAlertById(id);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const searchAlerts = async (query: string): Promise<DisasterAlert[]> => {
    try {
      return await alertsService.searchAlerts({ q: query });
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  };

  const refreshAlerts = async () => {
    try {
      const { alerts: fetchedAlerts } = await alertsService.getAlerts({
        isActive: true,
      });
      
      setAlerts(fetchedAlerts);
      await storeData(STORAGE_KEYS.OFFLINE_ALERTS, fetchedAlerts);
    } catch (err) {
      console.error('Error refreshing alerts:', handleApiError(err));
    }
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        isLoading,
        error,
        fetchAlerts,
        getAlertById,
        searchAlerts,
        refreshAlerts,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return context;
};
