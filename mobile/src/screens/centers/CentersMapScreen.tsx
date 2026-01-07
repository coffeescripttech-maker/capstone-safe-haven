import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert as RNAlert,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { EvacuationCenter } from '../../types/models';
import { CentersStackParamList } from '../../types/navigation';
import { centersService } from '../../services/centers';
import { useLocation } from '../../store/LocationContext';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';

type NavigationProp = NativeStackNavigationProp<CentersStackParamList, 'CentersMap'>;

export const CentersMapScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { location, requestPermission } = useLocation();
  const mapRef = useRef<MapView>(null);

  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<EvacuationCenter | null>(null);

  useEffect(() => {
    loadCenters();
  }, [location]);

  const loadCenters = async () => {
    try {
      setLoading(true);
      if (location) {
        const data = await centersService.getNearby({
          lat: location.latitude,
          lng: location.longitude,
          radius: 50,
        });
        setCenters(data);
      } else {
        const response = await centersService.getCenters();
        setCenters(response.centers);
      }
    } catch (error) {
      console.error('Error loading centers:', error);
      RNAlert.alert('Error', 'Failed to load evacuation centers');
    } finally {
      setLoading(false);
    }
  };

  const handleCenterPress = (center: EvacuationCenter) => {
    setSelectedCenter(center);
    if (mapRef.current && center.latitude && center.longitude) {
      mapRef.current.animateToRegion({
        latitude: center.latitude,
        longitude: center.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleMyLocation = async () => {
    if (!location) {
      const granted = await requestPermission();
      if (!granted) {
        RNAlert.alert('Permission Required', 'Location permission is needed to show your position');
        return;
      }
    }

    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const getMarkerColor = (center: EvacuationCenter): string => {
    if (center.isFull) return '#EF4444'; // Red
    if (center.occupancyPercentage && center.occupancyPercentage > 80) return '#F59E0B'; // Orange
    return '#10B981'; // Green
  };

  const initialRegion = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 10.3157, // Cebu City default
        longitude: 123.8854,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {centers.map((center) => (
          center.latitude && center.longitude && (
            <Marker
              key={center.id}
              coordinate={{
                latitude: center.latitude,
                longitude: center.longitude,
              }}
              pinColor={getMarkerColor(center)}
              onPress={() => handleCenterPress(center)}
            >
              <View style={styles.markerContainer}>
                <View style={[styles.marker, { backgroundColor: getMarkerColor(center) }]}>
                  <Ionicons name="business" size={20} color="#FFFFFF" />
                </View>
              </View>
            </Marker>
          )
        ))}

        {location && (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={5000}
            strokeColor="rgba(0, 56, 168, 0.3)"
            fillColor="rgba(0, 56, 168, 0.1)"
          />
        )}
      </MapView>

      {/* List View Button */}
      <TouchableOpacity
        style={styles.listButton}
        onPress={() => navigation.navigate('CentersList')}
      >
        <Ionicons name="list" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* My Location Button */}
      <TouchableOpacity style={styles.locationButton} onPress={handleMyLocation}>
        <Ionicons name="locate" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Selected Center Card */}
      {selectedCenter && (
        <View style={styles.centerCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Text style={styles.centerName}>{selectedCenter.name}</Text>
              <Text style={styles.centerAddress}>{selectedCenter.address}</Text>
              <View style={styles.capacityRow}>
                <Text style={styles.capacityText}>
                  {selectedCenter.currentOccupancy || 0} / {selectedCenter.capacity}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: selectedCenter.isFull
                        ? '#FEE2E2'
                        : '#DCFCE7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: selectedCenter.isFull ? '#DC2626' : '#16A34A' },
                    ]}
                  >
                    {selectedCenter.isFull ? 'Full' : 'Available'}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedCenter(null)}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() =>
              navigation.navigate('CenterDetails', { centerId: selectedCenter.id })
            }
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButton: {
    position: 'absolute',
    top: SPACING.lg + 60,
    right: SPACING.lg,
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerCard: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  cardInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  centerAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  capacityText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
