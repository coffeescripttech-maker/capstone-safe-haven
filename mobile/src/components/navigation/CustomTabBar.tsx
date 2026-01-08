// Custom Tab Bar with Center SOS Button

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Bell, Building2, Menu } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { SOSButton } from '../home/SOSButton';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;

          // Skip rendering the middle tab (we'll put SOS button there)
          if (index === 2) {
            return <View key={route.key} style={styles.centerSpace} />;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Get icon component based on route name
          const IconComponent = () => {
            const iconColor = isFocused ? COLORS.primary : COLORS.textSecondary;
            const iconSize = 24;
            const strokeWidth = isFocused ? 2.5 : 2;

            switch (route.name) {
              case 'Home':
                return <Home color={iconColor} size={iconSize} strokeWidth={strokeWidth} />;
              case 'Alerts':
                return <Bell color={iconColor} size={iconSize} strokeWidth={strokeWidth} />;
              case 'Centers':
                return <Building2 color={iconColor} size={iconSize} strokeWidth={strokeWidth} />;
              case 'Profile':
                return <Menu color={iconColor} size={iconSize} strokeWidth={strokeWidth} />;
              default:
                return <Home color={iconColor} size={iconSize} strokeWidth={strokeWidth} />;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <IconComponent />
              </View>
              <Text style={[styles.label, isFocused && styles.labelFocused]}>
                {typeof label === 'string' ? label : route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Center SOS Button - Elevated and Prominent */}
      <View style={styles.sosButtonContainer}>
        <View style={styles.sosButtonWrapper}>
          <SOSButton />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    height: 65,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
    borderTopWidth: 0,
    overflow: 'visible',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerSpace: {
    flex: 1,
  },
  iconContainer: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  labelFocused: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  sosButtonContainer: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -28,
    zIndex: 10,
  },
  sosButtonWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
});
