// Alerts List Screen

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { AlertCard } from '../../components/alerts/AlertCard';
import { Loading } from '../../components/common/Loading';
import { useAlerts } from '../../store/AlertContext';
import { useLocation } from '../../store/LocationContext';
import { useNotifications } from '../../store/NotificationContext';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { DisasterAlert, AlertType, AlertSeverity } from '../../types/models';
import { MainTabParamList } from '../../types/navigation';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type Props = BottomTabScreenProps<MainTabParamList, 'Alerts'>;

export const AlertsListScreen: React.FC<Props> = ({ navigation }) => {
  const { alerts, isLoading, error, fetchAlerts, refreshAlerts } = useAlerts();
  const { location } = useLocation();
  const { clearBadge } = useNotifications();
  const [selectedType, setSelectedType] = useState<AlertType | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');

  useEffect(() => {
    loadAlerts();
    // Clear badge when screen is focused
    clearBadge();
  }, [location, selectedType, selectedSeverity]);

  const loadAlerts = () => {
    const filters: any = {};
    
    if (selectedType !== 'all') filters.type = selectedType;
    if (selectedSeverity !== 'all') filters.severity = selectedSeverity;
    if (location) {
      filters.lat = location.latitude;
      filters.lng = location.longitude;
    }

    fetchAlerts(filters);
  };

  const handleRefresh = () => {
    refreshAlerts();
  };

  const handleAlertPress = (alert: DisasterAlert) => {
    // Navigate to alert details (to be implemented)
    console.log('Alert pressed:', alert.id);
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>✅</Text>
      <Text style={styles.emptyText}>No active alerts</Text>
      <Text style={styles.emptySubtext}>You're safe for now</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>⚠️</Text>
      <Text style={styles.emptyText}>Failed to load alerts</Text>
      <Text style={styles.emptySubtext}>{error}</Text>
      <TouchableOpacity onPress={loadAlerts} style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const filterTypes: Array<{ value: AlertType | 'all'; label: string; icon: string }> = [
    { value: 'all', label: 'All', icon: '🌐' },
    { value: 'typhoon', label: 'Typhoon', icon: '🌀' },
    { value: 'earthquake', label: 'Quake', icon: '🌍' },
    { value: 'flood', label: 'Flood', icon: '🌊' },
  ];

  const filterSeverities: Array<{ value: AlertSeverity | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'low', label: 'Low' },
  ];

  if (isLoading && alerts.length === 0) {
    return <Loading fullScreen message="Loading alerts..." />;
  }

  return (
    <View style={styles.container}>
      {/* Type Filters */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterTypes}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType === item.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedType(item.value)}
            >
              <Text style={styles.filterIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.filterText,
                  selectedType === item.value && styles.filterTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Severity Filters */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterSeverities}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.severityChip,
                selectedSeverity === item.value && styles.severityChipActive,
              ]}
              onPress={() => setSelectedSeverity(item.value)}
            >
              <Text
                style={[
                  styles.severityText,
                  selectedSeverity === item.value && styles.severityTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Alerts List */}
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AlertCard alert={item} onPress={() => handleAlertPress(item)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={error ? renderError() : renderEmpty()}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterSection: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  filterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  severityChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  severityChipActive: {
    backgroundColor: COLORS.error,
    borderColor: COLORS.error,
  },
  severityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  severityTextActive: {
    color: COLORS.white,
  },
  list: {
    padding: SPACING.md,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: SPACING.borderRadius,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});
