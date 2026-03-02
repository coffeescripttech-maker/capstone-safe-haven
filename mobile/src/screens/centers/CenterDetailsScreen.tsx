import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert as RNAlert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { EvacuationCenter } from '../../types/models';
import { CentersStackParamList } from '../../types/navigation';
import { centersService } from '../../services/centers';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { Loading } from '../../components/common/Loading';

type RouteProps = RouteProp<CentersStackParamList, 'CenterDetails'>;

export const CenterDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { centerId } = route.params;

  const [center, setCenter] = useState<EvacuationCenter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCenter();
  }, [centerId]);

  const loadCenter = async () => {
    try {
      setLoading(true);
      console.log('Loading center with ID:', centerId);
      
      if (!centerId) {
        throw new Error('No center ID provided');
      }
      
      const data = await centersService.getCenterById(centerId);
      console.log('Loaded center data:', data);
      
      if (!data) {
        throw new Error('Center not found');
      }
      
      setCenter(data);
    } catch (error) {
      console.error('Error loading center:', error);
      RNAlert.alert('Error', 'Failed to load center details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (center?.contactNumber) {
      Linking.openURL(`tel:${center.contactNumber}`);
    }
  };

  const handleDirections = () => {
    if (center?.latitude && center?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return <Loading message="Loading center details..." />;
  }

  if (!center) {
    console.error('Center is null or undefined');
    return null;
  }

  console.log('Rendering center:', {
    id: center.id,
    name: center.name,
    hasLatitude: !!center.latitude,
    hasLongitude: !!center.longitude,
    hasFacilities: !!center.facilities,
  });

  const occupancyPercentage = center.occupancyPercentage || 0;
  const getCapacityColor = () => {
    if (occupancyPercentage >= 90) return '#EF4444';
    if (occupancyPercentage >= 70) return '#F59E0B';
    return '#10B981';
  };

  const facilityIcons: Record<string, string> = {
    medical: 'medical',
    food: 'restaurant',
    water: 'water',
    restrooms: 'man',
    power: 'flash',
    wifi: 'wifi',
    shelter: 'home',
    security: 'shield-checkmark',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Map Preview */}
      {center.latitude && center.longitude && !isNaN(center.latitude) && !isNaN(center.longitude) && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: Number(center.latitude),
              longitude: Number(center.longitude),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: Number(center.latitude),
                longitude: Number(center.longitude),
              }}
              pinColor={getCapacityColor()}
            />
          </MapView>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{center.name || 'Unnamed Center'}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: center.isFull ? '#FEE2E2' : '#DCFCE7' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: center.isFull ? '#DC2626' : '#16A34A' },
            ]}
          >
            {center.isFull ? 'Full' : 'Available'}
          </Text>
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Location</Text>
        </View>
        <Text style={styles.address}>{center.address || 'No address available'}</Text>
        {center.barangay && (
          <Text style={styles.locationDetail}>Barangay {center.barangay}</Text>
        )}
        <Text style={styles.locationDetail}>
          {center.city || 'Unknown'}, {center.province || 'Unknown'}
        </Text>
      </View>

      {/* Capacity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Capacity</Text>
        </View>
        <View style={styles.capacityInfo}>
          <Text style={styles.capacityText}>
            {center.currentOccupancy || 0} / {center.capacity} people
          </Text>
          <Text style={styles.capacityPercentage}>{occupancyPercentage}% full</Text>
        </View>
        <View style={styles.capacityBarContainer}>
          <View
            style={[
              styles.capacityBar,
              {
                width: `${occupancyPercentage}%`,
                backgroundColor: getCapacityColor(),
              },
            ]}
          />
        </View>
      </View>

      {/* Facilities */}
      {center.facilities && Array.isArray(center.facilities) && center.facilities.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Facilities</Text>
          </View>
          <View style={styles.facilitiesGrid}>
            {center.facilities.map((facility, index) => (
              <View key={`facility-${index}-${facility}`} style={styles.facilityChip}>
                <Ionicons
                  name={(facilityIcons[facility] as any) || 'checkmark'}
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.facilityText}>
                  {facility ? facility.charAt(0).toUpperCase() + facility.slice(1) : 'Unknown'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Contact */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Contact Information</Text>
        </View>
        {center.contactPerson && (
          <Text style={styles.contactInfo}>
            Contact Person: {center.contactPerson}
          </Text>
        )}
        {center.contactNumber && (
          <Text style={styles.contactInfo}>Phone: {center.contactNumber}</Text>
        )}
        {!center.contactPerson && !center.contactNumber && (
          <Text style={styles.contactInfo}>No contact information available</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={handleCall}
          disabled={!center.contactNumber}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.directionsButton]}
          onPress={handleDirections}
          disabled={!center.latitude || !center.longitude}
        >
          <Ionicons name="navigate" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>
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
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  map: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
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
  address: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  locationDetail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  capacityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  capacityText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  capacityPercentage: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  capacityBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  capacityBar: {
    height: '100%',
    borderRadius: 4,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  facilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 16,
    gap: 6,
  },
  facilityText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  contactInfo: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  callButton: {
    backgroundColor: '#10B981',
  },
  directionsButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
