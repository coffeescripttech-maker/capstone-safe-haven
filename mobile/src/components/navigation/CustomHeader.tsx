// Custom Header Component with Logo

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { useNotifications } from '../../store/NotificationContext';
import { useNavigation } from '@react-navigation/native';

interface CustomHeaderProps {
  showNotificationBell?: boolean;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({ 
  showNotificationBell = true 
}) => {
  const { unreadCount } = useNotifications();
  const navigation = useNavigation();

  const handleNotificationPress = () => {
    // Navigate to alerts or notifications screen
    navigation.navigate('Alerts' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image 
          source={require('../../../assets/logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>SafeHaven</Text>
      </View>
      
      {showNotificationBell && (
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={handleNotificationPress}
          activeOpacity={0.7}
        >
          <Bell color={COLORS.white} size={22} strokeWidth={2.5} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl, // Extra padding for status bar
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: SPACING.sm,
  },
  appName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
