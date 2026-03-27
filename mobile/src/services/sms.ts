// SMS Service - Send SMS automatically (no user interaction)

import * as SMS from 'expo-sms';

export interface SOSData {
  latitude?: number;
  longitude?: number;
  targetAgency: string;
  userInfo: {
    userId: number;
    name: string;
    phone: string;
  };
}

/**
 * Send SOS via SMS (opens SMS app with pre-filled message)
 * 
 * NOTE: Due to Android/iOS security restrictions, apps cannot send SMS
 * silently without user confirmation. This function opens the SMS app
 * with the message pre-filled - user must press SEND.
 * 
 * @param sosData - SOS alert data
 * @param gatewayNumber - SMS gateway number (default: 09923150633)
 * @returns Promise<boolean> - true if SMS app opened successfully
 * @throws Error with specific message if SMS fails
 */
export async function sendSOSviaSMS(
  sosData: SOSData,
  gatewayNumber: string = '09923150633'
): Promise<boolean> {
  try {
    // Check if SMS is available on device
    const isAvailable = await SMS.isAvailableAsync();
    
    if (!isAvailable) {
      console.error('❌ SMS not available on this device');
      throw new Error('SMS not available on this device');
    }

    // Format SMS message: "SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE"
    // Keep it simple - no email (@ symbol can cause SMS issues)
    const lat = sosData.latitude?.toFixed(6) || '0';
    const lng = sosData.longitude?.toFixed(6) || '0';
    const agency = sosData.targetAgency.toUpperCase();
    const userId = sosData.userInfo.userId;
    const name = sosData.userInfo.name;
    const phone = sosData.userInfo.phone;
    
    const smsMessage = `SOS|${agency}|${lat},${lng}|${userId}|${name}|${phone}`;
    
    console.log('📱 Opening SMS app with message to gateway:', gatewayNumber);
    console.log('📱 Message:', smsMessage);
    console.log('📱 Message length:', smsMessage.length, 'characters');

    // Open SMS app with pre-filled message
    // NOTE: This CANNOT send automatically due to OS security restrictions
    // User MUST press SEND in the SMS app
    const { result } = await SMS.sendSMSAsync(
      [gatewayNumber],
      smsMessage
    );

    console.log('📱 SMS app result:', result);

    if (result === 'sent') {
      // User pressed SEND in SMS app
      console.log('✅ User sent SMS from SMS app');
      return true;
    } else if (result === 'cancelled') {
      // User cancelled in SMS app
      console.log('⚠️ User cancelled SMS send');
      throw new Error('SMS send cancelled by user');
    } else if (result === 'unknown') {
      // Unknown result (SMS app opened but we don't know if sent)
      console.log('⚠️ SMS app opened, result unknown');
      return true; // Assume success
    } else {
      console.error('❌ SMS failed:', result);
      throw new Error(`SMS failed: ${result}`);
    }

  } catch (error: any) {
    console.error('❌ Error with SMS:', error);
    
    // Re-throw with context
    if (error.message?.includes('not available')) {
      throw error;
    } else if (error.message?.includes('cancelled')) {
      throw error;
    } else {
      throw new Error('SMS failed - device may not support SMS or user has no cellular load');
    }
  }
}

/**
 * Check if device can send SMS
 */
export async function canSendSMS(): Promise<boolean> {
  try {
    return await SMS.isAvailableAsync();
  } catch (error) {
    console.error('Error checking SMS availability:', error);
    return false;
  }
}
