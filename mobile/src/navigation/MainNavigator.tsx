// Main Tab Navigator

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { MainTabParamList, AlertsStackParamList, CentersStackParamList, GuidesStackParamList, IncidentsStackParamList, FamilyStackParamList, ProfileStackParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AlertsListScreen } from '../screens/alerts/AlertsListScreen';
import { AlertDetailsScreen } from '../screens/alerts/AlertDetailsScreen';
import { CentersMapScreen } from '../screens/centers/CentersMapScreen';
import { CentersListScreen } from '../screens/centers/CentersListScreen';
import { CenterDetailsScreen } from '../screens/centers/CenterDetailsScreen';
import { ContactsListScreen } from '../screens/contacts/ContactsListScreen';
import { GuidesListScreen } from '../screens/guides/GuidesListScreen';
import { GuideDetailsScreen } from '../screens/guides/GuideDetailsScreen';
import { IncidentsListScreen } from '../screens/incidents/IncidentsListScreen';
import { ReportIncidentScreen } from '../screens/incidents/ReportIncidentScreen';
import { IncidentDetailsScreen } from '../screens/incidents/IncidentDetailsScreen';
import { GroupsListScreen } from '../screens/family/GroupsListScreen';
import { CreateGroupScreen } from '../screens/family/CreateGroupScreen';
import { JoinGroupScreen } from '../screens/family/JoinGroupScreen';
import { GroupMapScreen } from '../screens/family/GroupMapScreen';
import { GroupDetailsScreen } from '../screens/family/GroupDetailsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';
import { useNotifications } from '../store/NotificationContext';

const Tab = createBottomTabNavigator<MainTabParamList>();
const AlertsStack = createNativeStackNavigator<AlertsStackParamList>();
const CentersStack = createNativeStackNavigator<CentersStackParamList>();
const GuidesStack = createNativeStackNavigator<GuidesStackParamList>();
const IncidentsStack = createNativeStackNavigator<IncidentsStackParamList>();
const FamilyStack = createNativeStackNavigator<FamilyStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

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

// Guides Stack Navigator
const GuidesNavigator: React.FC = () => {
  return (
    <GuidesStack.Navigator>
      <GuidesStack.Screen
        name="GuidesList"
        component={GuidesListScreen}
        options={{ title: 'Preparedness Guides' }}
      />
      <GuidesStack.Screen
        name="GuideDetails"
        component={GuideDetailsScreen}
        options={{ title: 'Guide Details' }}
      />
    </GuidesStack.Navigator>
  );
};

// Incidents Stack Navigator
const IncidentsNavigator: React.FC = () => {
  return (
    <IncidentsStack.Navigator>
      <IncidentsStack.Screen
        name="IncidentsList"
        component={IncidentsListScreen}
        options={{ title: 'Incident Reports' }}
      />
      <IncidentsStack.Screen
        name="ReportIncident"
        component={ReportIncidentScreen}
        options={{ title: 'Report Incident' }}
      />
      <IncidentsStack.Screen
        name="IncidentDetails"
        component={IncidentDetailsScreen}
        options={{ title: 'Incident Details' }}
      />
    </IncidentsStack.Navigator>
  );
};

// Family Stack Navigator
const FamilyNavigator: React.FC = () => {
  return (
    <FamilyStack.Navigator>
      <FamilyStack.Screen
        name="GroupsList"
        component={GroupsListScreen}
        options={{ title: 'Family Groups' }}
      />
      <FamilyStack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ title: 'Create Group' }}
      />
      <FamilyStack.Screen
        name="JoinGroup"
        component={JoinGroupScreen}
        options={{ title: 'Join Group' }}
      />
      <FamilyStack.Screen
        name="GroupMap"
        component={GroupMapScreen}
        options={{ title: 'Group Map' }}
      />
      <FamilyStack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{ title: 'Group Details' }}
      />
    </FamilyStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileNavigator: React.FC = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <ProfileStack.Screen
        name="About"
        component={AboutScreen}
        options={{ title: 'About SafeHaven' }}
      />
    </ProfileStack.Navigator>
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
        name="Guides"
        component={GuidesNavigator}
        options={{
          tabBarLabel: 'Guides',
          tabBarIcon: () => <Text>📚</Text>,
        }}
      />
      <Tab.Screen
        name="Incidents"
        component={IncidentsNavigator}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: () => <Text>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Family"
        component={FamilyNavigator}
        options={{
          tabBarLabel: 'Family',
          tabBarIcon: () => <Text>👨‍👩‍👧</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
