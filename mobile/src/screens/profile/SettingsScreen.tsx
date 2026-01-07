import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SettingsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive disaster alerts and updates</Text>
            </View>
          </View>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor={COLORS.white} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="volume-high" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Sound</Text>
              <Text style={styles.settingDescription}>Play sound for notifications</Text>
            </View>
          </View>
          <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor={COLORS.white} />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="phone-portrait" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Vibration</Text>
              <Text style={styles.settingDescription}>Vibrate for notifications</Text>
            </View>
          </View>
          <Switch value={vibrationEnabled} onValueChange={setVibrationEnabled} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor={COLORS.white} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="location" size={24} color={COLORS.primary} />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Location Sharing</Text>
              <Text style={styles.settingDescription}>Share location with family groups</Text>
            </View>
          </View>
          <Switch value={locationSharing} onValueChange={setLocationSharing} trackColor={{ false: COLORS.border, true: COLORS.primary }} thumbColor={COLORS.white} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Storage</Text>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleClearCache}>
          <Ionicons name="trash" size={24} color={COLORS.error} />
          <Text style={[styles.menuText, { color: COLORS.error }]}>Clear Cache</Text>
          <Ionicons name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Information</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>2025.01.07</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  section: { padding: SPACING.md, marginBottom: SPACING.sm },
  sectionTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text, marginBottom: SPACING.md },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: SPACING.borderRadius, marginBottom: SPACING.sm, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingText: { marginLeft: SPACING.md, flex: 1 },
  settingLabel: { fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text },
  settingDescription: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.textSecondary, marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: SPACING.borderRadius, marginBottom: SPACING.sm, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  menuText: { flex: 1, fontSize: TYPOGRAPHY.sizes.md, fontWeight: TYPOGRAPHY.weights.medium, marginLeft: SPACING.md },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: SPACING.borderRadius, marginBottom: SPACING.sm },
  infoLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.textSecondary },
  infoValue: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text },
});
