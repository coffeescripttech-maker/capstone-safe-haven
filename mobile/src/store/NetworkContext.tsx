// Network Context - Monitor network connectivity

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkContextData {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string;
  isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextData>({
  isConnected: true,
  isInternetReachable: true,
  connectionType: 'unknown',
  isOnline: true,
});

export const NetworkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState('unknown');
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const newIsConnected = state.isConnected ?? false;
      const newIsOnline = newIsConnected && (state.isInternetReachable === null || state.isInternetReachable === true);
      
      // Check if we just came back online
      if (wasOffline && newIsOnline) {
        console.log('Back online - triggering sync');
        handleBackOnline();
      }
      
      setIsConnected(newIsConnected);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
      setWasOffline(!newIsOnline);
    });

    // Fetch initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      const newIsConnected = state.isConnected ?? false;
      const newIsOnline = newIsConnected && (state.isInternetReachable === null || state.isInternetReachable === true);
      
      setIsConnected(newIsConnected);
      setIsInternetReachable(state.isInternetReachable);
      setConnectionType(state.type);
      setWasOffline(!newIsOnline);
    });

    return () => unsubscribe();
  }, [wasOffline]);

  const handleBackOnline = async () => {
    // Import sync service dynamically to avoid circular dependencies
    const { syncService } = await import('../services/sync');
    
    try {
      await syncService.syncAll();
      console.log('Auto-sync completed');
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
  };

  const isOnline = isConnected && (isInternetReachable === null || isInternetReachable === true);

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        isInternetReachable,
        connectionType,
        isOnline,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};
