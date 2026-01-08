// Alert Card Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DisasterAlert } from '../../types/models';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { formatDate, formatTimeAgo } from '../../utils/formatting';

interface AlertCardProps {
  alert: DisasterAlert;
  onPress: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onPress }) => {
  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical': return COLORS.error;
      case 'high': return COLORS.warning;
      case 'moderate': return COLORS.secondary;
      case 'low': return COLORS.info;
      default: return COLORS.textSecondary;
    }
  };

  const getAlertIcon = () => {
    switch (alert.alertType) {
      case 'typhoon': return '🌀';
      case 'earthquake': return '🌍';
      case 'flood': return '🌊';
      case 'storm_surge': return '🌊';
      case 'volcanic': return '🌋';
      case 'tsunami': return '🌊';
      case 'landslide': return '⛰️';
      default: return '⚠️';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.severityBar, { backgroundColor: getSeverityColor() }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>{getAlertIcon()}</Text>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={2}>{alert.title}</Text>
            <Text style={styles.type}>{alert.alertType?.toUpperCase() || 'ALERT'}</Text>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor() }]}>
            <Text style={styles.severityText}>{alert.severity?.toUpperCase() || 'UNKNOWN'}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {alert.description}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.source}>📡 {alert.source}</Text>
          <Text style={styles.time}>{formatTimeAgo(alert.createdAt)}</Text>
        </View>

        {alert.affectedAreas && alert.affectedAreas.length > 0 && (
          <View style={styles.areas}>
            <Text style={styles.areasLabel}>Affected: </Text>
            <Text style={styles.areasText} numberOfLines={1}>
              {alert.affectedAreas.join(', ')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadius,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  severityBar: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 32,
    marginRight: SPACING.sm,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  type: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  severityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  severityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  time: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
  },
  areas: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  areasLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  areasText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text,
  },
});
