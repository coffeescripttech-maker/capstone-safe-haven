// Custom Tab Bar with Center SOS Button

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
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

          // Get icon based on route name - using outline style
          const getIcon = () => {
            switch (route.name) {
              case 'Home': return isFocused ? '🏠' : '🏘️';
              case 'Alerts': return isFocused ? '🚨' : '⚠️';
              case 'Centers': return isFocused ? '🏢' : '🏛️';
              case 'Profile': return isFocused ? '☰' : '≡';
              default: return '•';
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
                <Text style={[styles.icon, isFocused && styles.iconFocused]}>
                  {getIcon()}
                </Text>
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
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    height: 65,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5E5',
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
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
  },
  icon: {
    fontSize: 26,
    color: COLORS.textSecondary,
  },
  iconFocused: {
    color: COLORS.primary,
    transform: [{ scale: 1.05 }],
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
    top: -28,
    left: '50%',
    marginLeft: -35,
    zIndex: 10,
  },
  sosButtonWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
  },
});
