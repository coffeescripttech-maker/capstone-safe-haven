import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert as RNAlert,
  Animated,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlertTriangle } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { useAuth } from '../../store/AuthContext';
import { useLocation } from '../../store/LocationContext';
import api from '../../services/api';

interface SOSButtonProps {
  onSOSSent?: () => void;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onSOSSent }) => {
  const { user } = useAuth();
  const { location } = useLocation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleSOSPress = async () => {
    // Vibrate for haptic feedback
    Vibration.vibrate(100);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    // Vibrate for confirmation
    Vibration.vibrate([100, 50, 100]);

    setSending(true);
    setCountdown(3);

    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          sendSOS();
          return 0;
        }
        Vibration.vibrate(100);
        return prev - 1;
      });
    }, 1000);
  };

  const sendSOS = async () => {
    try {
      // Build user name from available data
      const userName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user?.email || 'SafeHaven User';

      const sosData = {
        latitude: location?.latitude,
        longitude: location?.longitude,
        message: 'Emergency! I need help!',
        userInfo: {
          name: userName,
          phone: user?.phone || 'Not provided',
        },
      };

      console.log('Sending SOS with data:', sosData);

      await api.post('/sos', sosData);

      // Success vibration
      Vibration.vibrate([100, 50, 100, 50, 100]);

      setShowConfirm(false);
      setSending(false);
      setCountdown(3);

      RNAlert.alert(
        'SOS Sent!',
        'Your emergency alert has been sent to authorities and your emergency contacts.',
        [{ text: 'OK' }]
      );

      onSOSSent?.();
    } catch (error) {
      console.error('Error sending SOS:', error);
      
      // Error vibration
      Vibration.vibrate([100, 100, 100]);

      setSending(false);
      setCountdown(3);

      RNAlert.alert(
        'Error',
        'Failed to send SOS alert. Please try calling emergency services directly.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSending(false);
    setCountdown(3);
  };

  return (
    <>
      <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={handleSOSPress}
          activeOpacity={0.8}
        >
          <View style={styles.sosInner}>
            <AlertTriangle color="#FFFFFF" size={20} strokeWidth={3} />
            <Text style={styles.sosText}>SOS</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {sending ? (
              <>
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>{countdown}</Text>
                </View>
                <Text style={styles.modalTitle}>Sending SOS...</Text>
                <Text style={styles.modalMessage}>
                  Your location and information will be sent to authorities and emergency
                  contacts.
                </Text>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Ionicons name="warning" size={64} color="#DC2626" />
                <Text style={styles.modalTitle}>Send Emergency Alert?</Text>
                <Text style={styles.modalMessage}>
                  This will send your location and information to:
                </Text>
                <View style={styles.recipientsList}>
                  <Text style={styles.recipientItem}>• Emergency Services (911)</Text>
                  <Text style={styles.recipientItem}>• Local Disaster Response</Text>
                  <Text style={styles.recipientItem}>• Your registered emergency contact</Text>
                </View>
                {!location && (
                  <View style={styles.warningBox}>
                    <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                    <Text style={styles.warningText}>
                      Location not available. SOS will be sent without coordinates.
                    </Text>
                  </View>
                )}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                  >
                    <Text style={styles.confirmButtonText}>Send SOS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={handleCancel}
                  >
                    <Text style={styles.modalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sosInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 1,
    letterSpacing: 1,
  },
  sosSubtext: {
    fontSize: 0,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0,
    height: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  recipientsList: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  recipientItem: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
  },
  modalButtons: {
    width: '100%',
    gap: SPACING.sm,
  },
  confirmButton: {
    backgroundColor: '#DC2626',
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  countdownContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  countdownText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
