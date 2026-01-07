// SafeHaven Color Palette (Philippine-inspired)

export const colors = {
  // Primary colors from Philippine flag
  primary: '#0038A8',      // Blue
  secondary: '#CE1126',    // Red
  accent: '#FCD116',       // Yellow
  
  // Severity colors for disaster alerts
  severity: {
    critical: '#DC2626',   // Red - Immediate danger
    high: '#F59E0B',      // Orange - High risk
    moderate: '#3B82F6',  // Blue - Moderate risk
    low: '#10B981',       // Green - Low risk
  },
  
  // Alert type colors
  alertTypes: {
    typhoon: '#3B82F6',
    earthquake: '#8B5CF6',
    flood: '#06B6D4',
    storm_surge: '#0EA5E9',
    volcanic: '#EF4444',
    tsunami: '#0891B2',
    landslide: '#92400E',
  },
  
  // UI colors
  background: '#F9FAFB',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  // Text colors
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF',
  },
  
  // Border colors
  border: {
    light: '#E5E7EB',
    default: '#D1D5DB',
    dark: '#9CA3AF',
  },
  
  // Status colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Functional colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Map colors
  map: {
    marker: '#CE1126',
    userLocation: '#0038A8',
    radius: 'rgba(0, 56, 168, 0.2)',
  },
};

export default colors;

// Flat export for easier imports
export const COLORS = {
  // Primary
  primary: colors.primary,
  secondary: colors.secondary,
  accent: colors.accent,
  
  // Background
  background: colors.background,
  white: colors.surface,
  
  // Text
  text: colors.text.primary,
  textSecondary: colors.text.secondary,
  
  // Status
  success: colors.status.success,
  warning: colors.status.warning,
  error: colors.status.error,
  info: colors.status.info,
  
  // Border
  border: colors.border.default,
  
  // Other
  shadow: colors.shadow,
};
