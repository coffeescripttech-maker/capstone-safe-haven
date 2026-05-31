// Incident Type Detail Screen - Review and send SOS

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import { IncidentType } from '../../types/incidentTypes';
import sosService from '../../services/sos.service';
import { useAuth } from '../../contexts/AuthContext';

export const IncidentTypeDetailScreen = ({ route, navigation }: any) => {
  const { incidentType } = route.params as { incidentType: IncidentType };
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  const getPriorityColor = () => {
    switch (incidentType.priority) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#3B82F6';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  };

  const handleSendSOS = async () => {
    try {
      setSending(true);

      // Get current location
      const location = await getCurrentLocation();

      // Determine target agency from responders
      const primaryResponder = incidentType.responders.find(r => r.isPrimary);
      const targetAgency = primaryResponder
        ? primaryResponder.agency.toLowerCase()
        : 'all';

      // Send SOS with incident type
      await sosService.createSOS({
        incidentTypeId: incidentType.id,
        incidentDescription: incidentType.description,
        latitude: location.latitude,
        longitude: location.longitude,
        message: `${incidentType.name} - ${incidentType.description}`,
        userInfo: {
          name: user?.firstName + ' ' + user?.lastName || 'Unknown',
          phone: user?.phone || '',
        },
        targetAgency: targetAgency as any,
      });

      // Navigate to confirmation screen
      navigation.replace('SOSConfirmation', { incidentType });
    } catch (error: any) {
      console.error('Error sending SOS:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send SOS alert. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSending(false);
    }
  };

  const confirmSendSOS = () => {
    Alert.alert(
      'Confirm Emergency Alert',
      `Are you sure you want to send an SOS alert for "${incidentType.name}"? This will notify emergency responders.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: handleSendSOS,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{incidentType.icon}</Text>
          </View>
          <Text style={styles.name}>{incidentType.name}</Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor() },
            ]}
          >
            <Text style={styles.priorityText}>
              {incidentType.priority.toUpperCase()} PRIORITY
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{incidentType.description}</Text>
        </View>

        {/* Responders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Responders</Text>
          <Text style={styles.sectionSubtitle}>
            The following agencies will be notified:
          </Text>
          {incidentType.responders.map((responder, index) => (
            <View key={index} style={styles.responderCard}>
              <View style={styles.responderHeader}>
                <Text style={styles.agency}>
                  {responder.isPrimary ? '✓ ' : '  '}
                  {responder.agency}
                </Text>
                {responder.isPrimary && (
                  <View style={styles.primaryBadge}>
                    <Text style={styles.primaryText}>PRIMARY</Text>
                  </View>
                )}
              </View>
              <Text style={styles.action}>• {responder.action}</Text>
            </View>
          ))}
        </View>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Only use this for real emergencies. False alarms may result in
            penalties and delay response to actual emergencies.
          </Text>
        </View>
      </ScrollView>

      {/* Send Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.sendButton,
            sending && styles.sendButtonDisabled,
          ]}
          onPress={confirmSendSOS}
          disabled={sending}
        >
          {sending ? (
            <>
              <ActivityIndicator color="#FFFFFF" style={styles.buttonLoader} />
              <Text style={styles.sendButtonText}>SENDING SOS...</Text>
            </>
          ) : (
            <>
              <Text style={styles.sendButtonIcon}>🚨</Text>
              <Text style={styles.sendButtonText}>SEND SOS ALERT</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  responderCard: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  responderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  agency: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  primaryBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  action: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sendButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  buttonLoader: {
    marginRight: 8,
  },
});

export default IncidentTypeDetailScreen;
