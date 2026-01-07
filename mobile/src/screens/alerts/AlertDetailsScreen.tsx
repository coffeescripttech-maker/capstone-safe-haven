import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert as RNAlert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { format } from 'date-fns';

import { DisasterAlert } from '../../types/models';
import { AlertsStackParamList } from '../../types/navigation';
import { alertsService } from '../../services/alerts';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { Loading } from '../../components/common/Loading';

type RouteProps = RouteProp<AlertsStackParamList, 'AlertDetails'>;

export const AlertDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { alertId } = route.params;

  const [alert, setAlert] = useState<DisasterAlert | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlert();
  }, [alertId]);

  const loadAlert = async () => {
    try {
      setLoading(true);
      const data = await alertsService.getAlertById(alertId);
      setAlert(data);
    } catch (error) {
      console.error('Error loading alert:', error);
      RNAlert.alert('Error', 'Failed to load alert details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading alert details..." />;
  }

  if (!alert) {
    return null;
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#DC2626';
      case 'high':
        return '#F59E0B';
      case 'moderate':
        return '#3B82F6';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getAlertIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'typhoon':
        return 'thunderstorm';
      case 'earthquake':
        return 'pulse';
      case 'flood':
        return 'water';
      case 'fire':
        return 'flame';
      case 'tsunami':
        return 'boat';
      case 'landslide':
        return 'warning';
      default:
        return 'alert-circle';
    }
  };

  const severityColor = getSeverityColor(alert.severity);

  return (
    <ScrollView style={styles.container}>
      {/* Map with Affected Area */}
      {alert.latitude && alert.longitude && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: alert.latitude,
              longitude: alert.longitude,
              latitudeDelta: alert.radiusKm ? alert.radiusKm / 50 : 0.5,
              longitudeDelta: alert.radiusKm ? alert.radiusKm / 50 : 0.5,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            {alert.radiusKm && (
              <Circle
                center={{
                  latitude: alert.latitude,
                  longitude: alert.longitude,
                }}
                radius={alert.radiusKm * 1000}
                strokeColor={`${severityColor}80`}
                fillColor={`${severityColor}20`}
                strokeWidth={2}
              />
            )}
          </MapView>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.typeRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${severityColor}20` }]}>
            <Ionicons
              name={getAlertIcon(alert.alertType) as any}
              size={32}
              color={severityColor}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.alertType}>
              {alert.alertType.charAt(0).toUpperCase() + alert.alertType.slice(1)}
            </Text>
            <View
              style={[styles.severityBadge, { backgroundColor: `${severityColor}20` }]}
            >
              <Text style={[styles.severityText, { color: severityColor }]}>
                {alert.severity.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.title}>{alert.title}</Text>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Description</Text>
        </View>
        <Text style={styles.description}>{alert.description}</Text>
      </View>

      {/* Affected Areas */}
      {alert.affectedAreas && alert.affectedAreas.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Affected Areas</Text>
          </View>
          <View style={styles.areasContainer}>
            {alert.affectedAreas.map((area: string, index: number) => (
              <View key={index} style={styles.areaChip}>
                <Text style={styles.areaText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Timeline */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="time" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Timeline</Text>
        </View>
        {alert.startTime && (
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Start:</Text>
            <Text style={styles.timelineValue}>
              {format(new Date(alert.startTime), 'MMM dd, yyyy h:mm a')}
            </Text>
          </View>
        )}
        {alert.endTime && (
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>End:</Text>
            <Text style={styles.timelineValue}>
              {format(new Date(alert.endTime), 'MMM dd, yyyy h:mm a')}
            </Text>
          </View>
        )}
        <View style={styles.timelineItem}>
          <Text style={styles.timelineLabel}>Issued:</Text>
          <Text style={styles.timelineValue}>
            {format(new Date(alert.createdAt), 'MMM dd, yyyy h:mm a')}
          </Text>
        </View>
      </View>

      {/* Source */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Source</Text>
        </View>
        <Text style={styles.source}>{alert.source}</Text>
      </View>

      {/* Additional Info */}
      {alert.metadata && Object.keys(alert.metadata).length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Additional Information</Text>
          </View>
          {Object.entries(alert.metadata).map(([key, value]) => (
            <View key={key} style={styles.metadataItem}>
              <Text style={styles.metadataKey}>
                {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:
              </Text>
              <Text style={styles.metadataValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Status */}
      <View style={styles.section}>
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: alert.isActive ? '#DCFCE7' : '#F3F4F6' },
          ]}
        >
          <Ionicons
            name={alert.isActive ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={alert.isActive ? '#16A34A' : '#6B7280'}
          />
          <Text
            style={[
              styles.statusText,
              { color: alert.isActive ? '#16A34A' : '#6B7280' },
            ]}
          >
            {alert.isActive ? 'Active Alert' : 'Inactive Alert'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  mapContainer: {
    height: 250,
    backgroundColor: '#E5E7EB',
  },
  map: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  alertType: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  areaChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
  },
  areaText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 80,
  },
  timelineValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  source: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  metadataItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  metadataKey: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 150,
  },
  metadataValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
