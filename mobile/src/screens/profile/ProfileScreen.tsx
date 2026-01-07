// Profile Screen

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../store/AuthContext';
import { Button } from '../../components/common/Button';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { formatPhoneNumber } from '../../utils/formatting';
import { MainTabParamList } from '../../types/navigation';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type Props = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, profile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>
              {user?.phone ? formatPhoneNumber(user.phone) : 'Not set'}
            </Text>
          </View>

          {profile?.address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{profile.address}</Text>
            </View>
          )}

          {profile?.city && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>{profile.city}</Text>
            </View>
          )}

          {profile?.province && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Province</Text>
              <Text style={styles.infoValue}>{profile.province}</Text>
            </View>
          )}

          {profile?.barangay && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Barangay</Text>
              <Text style={styles.infoValue}>{profile.barangay}</Text>
            </View>
          )}

          {profile?.bloodType && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Blood Type</Text>
              <Text style={styles.infoValue}>{profile.bloodType}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Emergency Contact */}
      {(profile?.emergencyContactName || profile?.emergencyContactPhone) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          
          <View style={styles.infoCard}>
            {profile.emergencyContactName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{profile.emergencyContactName}</Text>
              </View>
            )}

            {profile.emergencyContactPhone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>
                  {formatPhoneNumber(profile.emergencyContactPhone)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Medical Information */}
      {profile?.medicalConditions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Conditions</Text>
              <Text style={styles.infoValue}>{profile.medicalConditions}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.menuItem} onPress={() => (navigation as any).navigate('EditProfile')}>
          <Text style={styles.menuIcon}>✏️</Text>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => (navigation as any).navigate('Settings')}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Settings</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => (navigation as any).navigate('About')}>
          <Text style={styles.menuIcon}>ℹ️</Text>
          <Text style={styles.menuText}>About SafeHaven</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          fullWidth
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>SafeHaven v1.0.0</Text>
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
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  email: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  roleBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  roleText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadius,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.medium,
    flex: 2,
    textAlign: 'right',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: SPACING.borderRadius,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  menuText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  menuArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
});
