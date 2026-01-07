// Main App Entry Point

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/store/AuthContext';
import { AlertProvider } from './src/store/AlertContext';
import { LocationProvider } from './src/store/LocationContext';
import { NotificationProvider } from './src/store/NotificationContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <AuthProvider>
        <LocationProvider>
          <AlertProvider>
            <NotificationProvider>
              <RootNavigator />
            </NotificationProvider>
          </AlertProvider>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
