// Centers List Screen

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CenterCard } from '../../components/centers/CenterCard';
import { Loading } from '../../components/common/Loading';
import { centersService } from '../../services/centers';
import { useLocation } from '../../store/LocationContext';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { EvacuationCenter } from '../../types/models';
import { CentersStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<CentersStackParamList, 'CentersList'>;

export const CentersListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { location } = useLocation();
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCenters();
  }, [location]);

  useEffect(() => {
    // Add map button to header
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('CentersMap')}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="map" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadCenters = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (location) {
        const nearby = await centersService.getNearby({
          lat: location.latitude,
          lng: location.longitude,
          radius: 50,
        });
        setCenters(nearby);
      } else {
        const { centers: allCenters } = await centersService.getCenters();
        setCenters(allCenters);
      }
    } catch (err) {
      setError('Failed to load centers');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCenterPress = (center: EvacuationCenter) => {
    navigation.navigate('CenterDetails', { centerId: center.id });
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🏢</Text>
      <Text style={styles.emptyText}>No evacuation centers found</Text>
    </View>
  );

  if (isLoading && centers.length === 0) {
    return <Loading fullScreen message="Loading centers..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={centers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CenterCard center={item} onPress={() => handleCenterPress(item)} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty()}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadCenters} colors={[COLORS.primary]} />
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
  },
});
