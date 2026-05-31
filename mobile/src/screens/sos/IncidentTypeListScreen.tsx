// Incident Type List Screen - Choose incident type for SOS

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { IncidentType } from '../../types/incidentTypes';
import incidentTypesService from '../../services/incidentTypes.service';
import IncidentTypeCard from '../../components/sos/IncidentTypeCard';

export const IncidentTypeListScreen = ({ navigation }: any) => {
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidentTypes();
  }, []);

  const loadIncidentTypes = async () => {
    try {
      setLoading(true);
      const types = await incidentTypesService.getAll();
      setIncidentTypes(types);
    } catch (error) {
      console.error('Error loading incident types:', error);
      Alert.alert(
        'Error',
        'Failed to load incident types. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = (type: IncidentType) => {
    navigation.navigate('IncidentTypeDetail', { incidentType: type });
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Select Incident Type</Text>
      <Text style={styles.headerSubtitle}>
        Choose the type of emergency you're reporting
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No incident types available</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading incident types...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={incidentTypes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <IncidentTypeCard
            incidentType={item}
            onPress={() => handleSelectType(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  headerContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});

export default IncidentTypeListScreen;
