// Home Screen - Dashboard

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../store/AuthContext';
import { useAlerts } from '../../store/AlertContext';
import { useLocation } from '../../store/LocationContext';
import { useNotifications } from '../../store/NotificationContext';
import { centersService } from '../../services/centers';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { EvacuationCenter } from '../../types/models';
import { MainTabParamList } from '../../types/navigation';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { formatDistance } from '../../utils/formatting';
import { 
  MapPin, 
  Bell, 
  AlertTriangle, 
  Building2, 
  Phone, 
  User, 
  ChevronRight,
  BookOpen,
  FileText,
  Users
} from 'lucide-react-native';

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
        <TouchableOpacity style={styles.permissionCard} onPress={requestPermission}>
          <View style={styles.permissionIconContainer}>
            <MapPin color={COLORS.primary} size={24} strokeWidth={2} />
          </View>
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>Enable Location</Text>
            <Text style={styles.permissionSubtitle}>Get alerts and centers near you</Text>
          </View>
          <ChevronRight color={COLORS.textSecondary} size={20} />
        </TouchableOpacity>
      )}

      {/* Notification Permission */}
      {!hasNotificationPermission && (
        <TouchableOpacity style={styles.permissionCard} onPress={requestNotificationPermission}>
          <View style={styles.permissionIconContainer}>
            <Bell color={COLORS.primary} size={24} strokeWidth={2} />
          </View>
          <View style={styles.permissionText}>
            <Text style={styles.permissionTitle}>Enable Notifications</Text>
            <Text style={styles.permissionSubtitle}>Get instant disaster alerts</Text>
          </View>
          <ChevronRight color={COLORS.textSecondary} size={20} />
        </TouchableOpacity>
      )}

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <View style={styles.criticalSection}>
          <View style={styles.criticalHeader}>
            <AlertTriangle color={COLORS.white} size={24} strokeWidth={2.5} />
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
              <Text style={styles.criticalAlertType}>{alert.alertType?.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={[styles.statCard, styles.statCardAlert]}
          onPress={() => navigation.navigate('Alerts')}
        >
          <View style={styles.statIconContainer}>
            <AlertTriangle color={COLORS.white} size={28} strokeWidth={2.5} />
          </View>
          <Text style={styles.statNumber}>{activeAlerts.length}</Text>
          <Text style={styles.statLabel}>Active Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statCard, styles.statCardCenter]}
          onPress={() => navigation.navigate('Centers')}
        >
          <View style={styles.statIconContainer}>
            <Building2 color={COLORS.white} size={28} strokeWidth={2.5} />
          </View>
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
              <View style={styles.centerIconContainer}>
                <Building2 color={COLORS.primary} size={24} strokeWidth={2} />
              </View>
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
            <View style={styles.actionIconContainer}>
              <AlertTriangle color={COLORS.primary} size={28} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>View Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Centers')}
          >
            <View style={styles.actionIconContainer}>
              <Building2 color={COLORS.primary} size={28} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Find Centers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile', { screen: 'ProfileMain' })}
          >
            <View style={styles.actionIconContainer}>
              <BookOpen color={COLORS.primary} size={28} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Guides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile', { screen: 'ProfileMain' })}
          >
            <View style={styles.actionIconContainer}>
              <FileText color={COLORS.primary} size={28} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Report Incident</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile', { screen: 'ProfileMain' })}
          >
            <View style={styles.actionIconContainer}>
              <Phone color={COLORS.primary} size={28} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Contacts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile', { screen: 'ProfileMain' })}
          >
            <View style={styles.actionIconContainer}>
              <Users color={COLORS.primary} size={28} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Family Locator</Text>
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
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  permissionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: 2,
  },
  permissionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  criticalSection: {
    margin: SPACING.md,
    backgroundColor: COLORS.error,
    borderRadius: 16,
    padding: SPACING.md,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  criticalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
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
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardAlert: {
    backgroundColor: COLORS.error,
  },
  statCardCenter: {
    backgroundColor: COLORS.primary,
  },
  statIconContainer: {
    marginBottom: SPACING.sm,
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
    fontWeight: TYPOGRAPHY.weights.medium,
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
    borderRadius: 16,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  centerHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  centerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
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
    width: '30%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
  },
});
