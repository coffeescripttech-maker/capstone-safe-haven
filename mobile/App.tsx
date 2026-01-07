// Main App Entry Point

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/store/AuthContext';
import { AlertProvider } from './src/store/AlertContext';
import { LocationProvider } from './src/store/LocationContext';
import { NotificationProvider } from './src/store/NotificationContext';
import { NetworkProvider } from './src/store/NetworkContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OfflineBanner } from './src/components/common/OfflineBanner';
import { COLORS } from './src/constants/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <NetworkProvider>
        <AuthProvider>
          <LocationProvider>
            <AlertProvider>
              <NotificationProvider>
                <RootNavigator />
                <OfflineBanner />
              </NotificationProvider>
            </AlertProvider>
          </LocationProvider>
        </AuthProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
