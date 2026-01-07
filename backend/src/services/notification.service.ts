import admin from 'firebase-admin';
import axios from 'axios';
import { logger } from '../utils/logger';
import db from '../config/database';

// Initialize Firebase Admin (only if credentials are provided)
let firebaseInitialized = false;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL
      })
    });
    firebaseInitialized = true;
    logger.info('Firebase Admin initialized successfully');
  } catch (error) {
    logger.warn('Firebase Admin initialization skipped - credentials not configured');
  }
}

interface PushResult {
  success: number;
  failure: number;
  errors: string[];
}

interface SMSResult {
  success: number;
  failure: number;
  errors: string[];
}

interface Alert {
  id: number;
  title: string;
  description: string;
  severity: string;
  alert_type: string;
}

export class NotificationService {
  /**
   * Send push notifications via Firebase Cloud Messaging
   */
  async sendPushNotification(tokens: string[], alert: Alert): Promise<PushResult> {
    if (!firebaseInitialized || tokens.length === 0) {
      logger.warn('Push notification skipped - Firebase not initialized or no tokens');
      return { success: 0, failure: 0, errors: [] };
    }

    const message = {
      notification: {
        title: `${this.getSeverityEmoji(alert.severity)} ${alert.title}`,
        body: alert.description.substring(0, 200)
      },
      data: {
        alert_id: alert.id.toString(),
        alert_type: alert.alert_type,
        severity: alert.severity
      }
    };

    const result: PushResult = {
      success: 0,
      failure: 0,
      errors: []
    };

    try {
      // Send to multiple devices (FCM supports up to 500 tokens per request)
      const batchSize = 500;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        
        const response = await admin.messaging().sendEachForMulticast({
          tokens: batch,
          ...message
        });

        result.success += response.successCount;
        result.failure += response.failureCount;

        // Collect error messages
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            result.errors.push(`Token ${batch[idx]}: ${resp.error.message}`);
          }
        });
      }

      logger.info(`Push notifications sent: ${result.success} success, ${result.failure} failed`);
    } catch (error: any) {
      logger.error('Push notification error:', error);
      result.failure = tokens.length;
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Send SMS via provider API (Semaphore for Philippines)
   */
  async sendSMS(phones: string[], message: string): Promise<SMSResult> {
    const apiKey = process.env.SMS_API_KEY;
    const senderName = process.env.SMS_SENDER_NAME || 'SafeHaven';

    if (!apiKey) {
      logger.warn('SMS sending skipped - API key not configured');
      return { success: 0, failure: 0, errors: ['SMS API key not configured'] };
    }

    const result: SMSResult = {
      success: 0,
      failure: 0,
      errors: []
    };

    // Format message to fit 160 characters
    const formattedMessage = this.formatSMSMessage(message);

    try {
      // Semaphore API endpoint
      const response = await axios.post('https://api.semaphore.co/api/v4/messages', {
        apikey: apiKey,
        number: phones.join(','),
        message: formattedMessage,
        sendername: senderName
      });

      if (response.data && response.data.length > 0) {
        response.data.forEach((item: any) => {
          if (item.status === 'Queued' || item.status === 'Sent') {
            result.success++;
          } else {
            result.failure++;
            result.errors.push(`${item.number}: ${item.status}`);
          }
        });
      }

      logger.info(`SMS sent: ${result.success} success, ${result.failure} failed`);
    } catch (error: any) {
      logger.error('SMS sending error:', error);
      result.failure = phones.length;
      result.errors.push(error.message);
    }

    return result;
  }

  /**
   * Log notification attempt to database
   */
  async logNotification(
    userId: number | null,
    type: 'push' | 'sms' | 'email',
    title: string,
    message: string,
    status: 'sent' | 'failed' | 'pending'
  ): Promise<void> {
    try {
      await db.query(
        `INSERT INTO notification_log (user_id, type, title, message, status) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, type, title, message, status]
      );
    } catch (error) {
      logger.error('Failed to log notification:', error);
    }
  }

  /**
   * Format SMS message to fit within 160 characters
   */
  formatSMSMessage(alert: Alert | string): string {
    let message: string;
    
    if (typeof alert === 'string') {
      message = alert;
    } else {
      message = `${alert.title}: ${alert.description}`;
    }

    // Truncate to 160 characters
    if (message.length > 160) {
      message = message.substring(0, 157) + '...';
    }

    return message;
  }

  /**
   * Get emoji for severity level
   */
  private getSeverityEmoji(severity: string): string {
    const emojis: Record<string, string> = {
      critical: '🚨',
      high: '⚠️',
      moderate: '⚡',
      low: 'ℹ️'
    };
    return emojis[severity] || 'ℹ️';
  }
}
