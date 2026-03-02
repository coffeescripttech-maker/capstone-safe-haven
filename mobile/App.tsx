// Main App Entry Point

import React from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';

// Error boundary with better error display
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    console.error('❌ ErrorBoundary caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('❌ Error details:', error);
    console.error('❌ Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>App Error</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || String(this.state.error) || 'Unknown error'}
          </Text>
          <Text style={styles.errorStack}>
            {this.state.error?.stack?.substring(0, 300)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  errorStack: {
    fontSize: 10,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
});

// Safe imports with error handling
let SafeAreaProvider: any;
let NetworkProvider: any;
let AuthProvider: any;
let RoleProvider: any;
let LocationProvider: any;
let AlertProvider: any;
let RootNavigator: any;
let OfflineBanner: any;
let COLORS: any;

try {
  SafeAreaProvider = require('react-native-safe-area-context').SafeAreaProvider;
  NetworkProvider = require('./src/store/NetworkContext').NetworkProvider;
  AuthProvider = require('./src/store/AuthContext').AuthProvider;
  RoleProvider = require('./src/store/RoleContext').RoleProvider;
  LocationProvider = require('./src/store/LocationContext').LocationProvider;
  AlertProvider = require('./src/store/AlertContext').AlertProvider;
  RootNavigator = require('./src/navigation/RootNavigator').RootNavigator;
  OfflineBanner = require('./src/components/common/OfflineBanner').OfflineBanner;
  COLORS = require('./src/constants/colors').COLORS;
  console.log('✅ All modules loaded successfully');
} catch (error) {
  console.error('❌ Failed to load modules:', error);
  throw error;
}

// Skip NotificationProvider entirely
const NotificationProvider = ({ children }: any) => <>{children}</>;

export default function App() {
  console.log('🚀 App starting...');
  
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS?.background || '#F5F5F5'} />
        <NetworkProvider>
          <AuthProvider>
            <RoleProvider>
              <LocationProvider>
                <AlertProvider>
                  <NotificationProvider>
                    <RootNavigator />
                    <OfflineBanner />
                  </NotificationProvider>
                </AlertProvider>
              </LocationProvider>
            </RoleProvider>
          </AuthProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
