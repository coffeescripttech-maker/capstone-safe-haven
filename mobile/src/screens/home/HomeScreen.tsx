// Home Screen - Dashboard

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../store/AuthContext';
import { useAlerts } from '../../store/AlertContext';
import { useLocation } from '../../store/LocationContext';
import { useNotifications } from '../../store/NotificationContext';
import { alertsService } from '../../services/alerts';
import { centersService } from '../../services/centers';
import { SOSButton } from '../../components/home/SOSButton';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { DisasterAlert, EvacuationCenter } from '../../types/models';
import { MainTabParamList } from '../../types/navigation';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { formatDistance } from '../../utils/formatting';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { alerts } = useAlerts();
  const { location, requestPermission, hasPermission } = useLocation();
  const { hasPermission: hasNotificationPermission, requestPermission: requestNotificationPermission } = useNotifications();
  const [nearestCenter, setNearestCenter] = useState<EvacuationCenter | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (location) {
      loadNearestCenter();
    }
  }, [location]);

  const loadNearestCenter = async () => {
    if (!location) return;
    
    try {
      const centers = await centersService.getNearby({
        lat: location.latitude,
        lng: location.longitude,
        radius: 50,
      });
      if (centers.length > 0) {
        setNearestCenter(centers[0]);
      }
    } catch (error) {
      console.error('Error loading nearest center:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNearestCenter();
    setIsRefreshing(false);
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const activeAlerts = alerts.filter(a => a.isActive);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName}! 👋</Text>
        <Text style={styles.subtitle}>Stay safe and informed</Text>
      </View>

      {/* Location Permission */}
      {!hasPermission && (
        <TouchableOpacity style={styles.locationCard} onPress={requestPermission}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={styles.locationText}>
            <Text style={styles.locationTitle}>Enable Location</Text>
            <Text style={styles.locationSubtitle}>Get alerts and centers near you</Text>
          </View>
          <Text style={styles.locationArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Notification Permission */}
      {!hasNotificationPermission && (
        <TouchableOpacity style={styles.notificationCard} onPress={requestNotificationPermission}>
          <Text style={styles.locationIcon}>🔔</Text>
          <View style={styles.locationText}>
            <Text style={styles.locationTitle}>Enable Notifications</Text>
            <Text style={styles.locationSubtitle}>Get instant disaster alerts</Text>
          </View>
          <Text style={styles.locationArrow}>→</Text>
        </TouchableOpacity>
      )}

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <View style={styles.criticalSection}>
          <View style={styles.criticalHeader}>
            <Text style={styles.criticalIcon}>🚨</Text>
            <Text style={styles.criticalTitle}>CRITICAL ALERTS</Text>
          </View>
          {criticalAlerts.slice(0, 2).map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={styles.criticalAlert}
              onPress={() => navigation.navigate('Alerts')}
            >
              <Text style={styles.criticalAlertTitle} numberOfLines={2}>
                {alert.title}
              </Text>
              <Text style={styles.criticalAlertType}>{alert.alertType.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* SOS Button */}
      <View style={styles.sosSection}>
        <Text style={styles.sectionTitle}>Emergency Alert</Text>
        <SOSButton onSOSSent={() => handleRefresh()} />
        <Text style={styles.sosHint}>
          Press to send emergency alert to authorities and your emergency contacts
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: COLORS.error }]}
          onPress={() => navigation.navigate('Alerts')}
        >
          <Text style={styles.statNumber}>{activeAlerts.length}</Text>
          <Text style={styles.statLabel}>Active Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.navigate('Centers')}
        >
          <Text style={styles.statNumber}>{nearestCenter ? '1' : '0'}</Text>
          <Text style={styles.statLabel}>Nearest Center</Text>
        </TouchableOpacity>
      </View>

      {/* Nearest Evacuation Center */}
      {nearestCenter && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearest Evacuation Center</Text>
          <TouchableOpacity
            style={styles.centerCard}
            onPress={() => navigation.navigate('Centers')}
          >
            <View style={styles.centerHeader}>
              <Text style={styles.centerIcon}>🏢</Text>
              <View style={styles.centerInfo}>
                <Text style={styles.centerName} numberOfLines={1}>
                  {nearestCenter.name}
                </Text>
                <Text style={styles.centerAddress} numberOfLines={1}>
                  {nearestCenter.city}, {nearestCenter.province}
                </Text>
              </View>
            </View>
            {nearestCenter.distance !== undefined && (
              <View style={styles.centerDistance}>
                <Text style={styles.distanceText}>{formatDistance(nearestCenter.distance)}</Text>
              </View>
            )}
            <View style={styles.centerCapacity}>
              <Text style={styles.capacityText}>
                {nearestCenter.currentOccupancy} / {nearestCenter.capacity} occupied
              </Text>
              <View style={styles.capacityBar}>
                <View
                  style={[
                    styles.capacityFill,
                    { width: `${nearestCenter.occupancyPercentage}%` },
                  ]}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Alerts')}
          >
            <Text style={styles.actionIcon}>🚨</Text>
            <Text style={styles.actionLabel}>View Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Centers')}
          >
            <Text style={styles.actionIcon}>🏢</Text>
            <Text style={styles.actionLabel}>Find Centers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Contacts')}
          >
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionLabel}>Emergency Contacts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.actionIcon}>👤</Text>
            <Text style={styles.actionLabel}>My Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: SPACING.borderRadius,
  },
  locationIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  locationText: {
    flex: 1,
  },
  locationTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  locationSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
  },
  locationArrow: {
    fontSize: 24,
    color: COLORS.text,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: SPACING.borderRadius,
  },
  criticalSection: {
    margin: SPACING.md,
    backgroundColor: COLORS.error,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.md,
  },
  criticalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  criticalIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  criticalTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  criticalAlert: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: SPACING.sm,
    borderRadius: SPACING.borderRadius,
    marginTop: SPACING.sm,
  },
  criticalAlertTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  criticalAlertType: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white,
    opacity: 0.9,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: SPACING.borderRadius,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    textAlign: 'center',
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  centerCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  centerHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  centerIcon: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  centerAddress: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  centerDistance: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  centerCapacity: {
    marginTop: SPACING.sm,
  },
  capacityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  capacityBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.lg,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  sosSection: {
    padding: SPACING.xl,
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.lg,
    borderRadius: SPACING.borderRadius,
    borderWidth: 2,
    borderColor: '#FEE2E2',
  },
  sosHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    lineHeight: 18,
  },
});
