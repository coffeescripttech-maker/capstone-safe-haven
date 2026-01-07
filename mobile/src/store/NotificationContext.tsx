// Notification Context - Push Notifications Management

import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { authService } from '../services/auth';
import { STORAGE_KEYS } from '../constants/config';
import { storeData, getData } from '../utils/storage';
import {
  requestNotificationPermission,
  getFCMToken,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  clearBadgeCount,
} from '../utils/notifications';

interface NotificationContextData {
  hasPermission: boolean;
  fcmToken: string | null;
  unreadCount: number;
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<void>;
  clearBadge: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (isAuthenticated) {
      initializeNotifications();
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated]);

  const initializeNotifications = async () => {
    // Check existing permission
    const { status } = await Notifications.getPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status === 'granted') {
      await setupNotifications();
    }

    // Setup listeners
    setupListeners();
  };

  const setupNotifications = async () => {
    try {
      // Get FCM token
      const token = await getFCMToken();
      if (token) {
        setFcmToken(token);
        
        // Check if token changed
        const storedToken = await getData<string>(STORAGE_KEYS.FCM_TOKEN);
        if (token !== storedToken) {
          await storeData(STORAGE_KEYS.FCM_TOKEN, token);
          await registerTokenWithBackend(token);
        }
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const setupListeners = () => {
    // Notification received while app is in foreground
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      setUnreadCount(prev => prev + 1);
      
      // Show alert for critical notifications
      const data = notification.request.content.data;
      if (data?.severity === 'critical') {
        Alert.alert(
          notification.request.content.title || 'Critical Alert',
          notification.request.content.body || '',
          [{ text: 'OK' }]
        );
      }
    });

    // Notification tapped by user
    responseListener.current = addNotificationResponseListener((response) => {
      console.log('Notification tapped:', response);
      
      const data = response.notification.request.content.data;
      
      // Handle navigation based on notification type
      if (data?.alertId) {
        // Navigate to alert details
        console.log('Navigate to alert:', data.alertId);
      } else if (data?.centerId) {
        // Navigate to center details
        console.log('Navigate to center:', data.centerId);
      }
      
      // Clear badge when notification is tapped
      clearBadge();
    });
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      const granted = await requestNotificationPermission();
      setHasPermission(granted);
      
      if (granted) {
        await setupNotifications();
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const registerTokenWithBackend = async (token: string) => {
    try {
      await authService.registerDeviceToken({
        token,
        platform: Platform.OS as 'android' | 'ios',
      });
      console.log('Device token registered with backend');
    } catch (error) {
      console.error('Error registering token with backend:', error);
    }
  };

  const registerToken = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    if (fcmToken) {
      await registerTokenWithBackend(fcmToken);
    }
  };

  const clearBadge = async () => {
    await clearBadgeCount();
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        hasPermission,
        fcmToken,
        unreadCount,
        requestPermission,
        registerToken,
        clearBadge,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
