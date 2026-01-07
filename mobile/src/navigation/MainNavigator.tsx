// Main Tab Navigator

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { MainTabParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AlertsListScreen } from '../screens/alerts/AlertsListScreen';
import { CentersListScreen } from '../screens/centers/CentersListScreen';
import { ContactsListScreen } from '../screens/contacts/ContactsListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useNotifications } from '../store/NotificationContext';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator: React.FC = () => {
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsListScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: () => <Text>🚨</Text>,
          title: 'Disaster Alerts',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="Centers"
        component={CentersListScreen}
        options={{
          tabBarLabel: 'Centers',
          tabBarIcon: () => <Text>🏢</Text>,
          title: 'Evacuation Centers',
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsListScreen}
        options={{
          tabBarLabel: 'Contacts',
          tabBarIcon: () => <Text>📞</Text>,
          title: 'Emergency Contacts',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
          title: 'My Profile',
        }}
      />
    </Tab.Navigator>
  );
};
