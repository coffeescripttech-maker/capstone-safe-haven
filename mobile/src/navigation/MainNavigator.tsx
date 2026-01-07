// Main Tab Navigator

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { MainTabParamList, AlertsStackParamList, CentersStackParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AlertsListScreen } from '../screens/alerts/AlertsListScreen';
import { AlertDetailsScreen } from '../screens/alerts/AlertDetailsScreen';
import { CentersMapScreen } from '../screens/centers/CentersMapScreen';
import { CentersListScreen } from '../screens/centers/CentersListScreen';
import { CenterDetailsScreen } from '../screens/centers/CenterDetailsScreen';
import { ContactsListScreen } from '../screens/contacts/ContactsListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useNotifications } from '../store/NotificationContext';

const Tab = createBottomTabNavigator<MainTabParamList>();
const AlertsStack = createNativeStackNavigator<AlertsStackParamList>();
const CentersStack = createNativeStackNavigator<CentersStackParamList>();

// Alerts Stack Navigator
const AlertsNavigator: React.FC = () => {
  return (
    <AlertsStack.Navigator>
      <AlertsStack.Screen
        name="AlertsList"
        component={AlertsListScreen}
        options={{ title: 'Disaster Alerts' }}
      />
      <AlertsStack.Screen
        name="AlertDetails"
        component={AlertDetailsScreen}
        options={{ title: 'Alert Details' }}
      />
    </AlertsStack.Navigator>
  );
};

// Centers Stack Navigator
const CentersNavigator: React.FC = () => {
  return (
    <CentersStack.Navigator>
      <CentersStack.Screen
        name="CentersMap"
        component={CentersMapScreen}
        options={{ title: 'Evacuation Centers' }}
      />
      <CentersStack.Screen
        name="CentersList"
        component={CentersListScreen}
        options={{ title: 'Centers List' }}
      />
      <CentersStack.Screen
        name="CenterDetails"
        component={CenterDetailsScreen}
        options={{ title: 'Center Details' }}
      />
    </CentersStack.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text>🏠</Text>,
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsNavigator}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: () => <Text>🚨</Text>,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="Centers"
        component={CentersNavigator}
        options={{
          tabBarLabel: 'Centers',
          tabBarIcon: () => <Text>🏢</Text>,
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsListScreen}
        options={{
          tabBarLabel: 'Contacts',
          tabBarIcon: () => <Text>📞</Text>,
          title: 'Emergency Contacts',
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
          title: 'My Profile',
          headerShown: true,
        }}
      />
    </Tab.Navigator>
  );
};
