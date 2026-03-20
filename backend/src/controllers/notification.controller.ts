/**
 * Notification Controller - Handle mobile app notification operations
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import db from '../config/database';
import notificationService from '../services/notification.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    jurisdiction?: string | null;
  };
}

export class NotificationController {
  /**
   * Register device token for push notifications
   */
  async registerDevice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { deviceToken, platform } = req.body;
      const userId = req.user?.id;

      if (!deviceToken || !userId) {
        res.status(400).json({
          status: 'error',
          message: 'Device token and user ID are required'
        });
        return;
      }

      // Check if device token already exists
      const [existing] = await db.query<any[]>(
        'SELECT id FROM device_tokens WHERE device_token = ? AND user_id = ?',
        [deviceToken, userId]
      );

      if (existing.length === 0) {
        // Insert new device token
        await db.query(
          `INSERT INTO device_tokens (user_id, device_token, platform, created_at, updated_at) 
           VALUES (?, ?, ?, NOW(), NOW())`,
          [userId, deviceToken, platform || 'mobile']
        );

        logger.info(`Device token registered for user ${userId}`);
      } else {
        // Update existing token timestamp
        await db.query(
          'UPDATE device_tokens SET updated_at = NOW(), platform = ? WHERE device_token = ? AND user_id = ?',
          [platform || 'mobile', deviceToken, userId]
        );

        logger.info(`Device token updated for user ${userId}`);
      }

      res.json({
        status: 'success',
        message: 'Device token registered successfully'
      });
    } catch (error) {
      logger.error('Error registering device token:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to register device token'
      });
    }
  }

  /**
   * Get unread notifications for user
   */
  async getUnreadNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
        return;
      }

      // Get unread notifications for user
      const [notifications] = await db.query<any[]>(
        `SELECT n.*, a.title as alert_title, a.description as alert_description, 
                a.severity, a.alert_type, a.latitude, a.longitude
         FROM user_notifications n
         LEFT JOIN alerts a ON n.alert_id = a.id
         WHERE n.user_id = ? AND n.read_at IS NULL
         ORDER BY n.created_at DESC
         LIMIT 50`,
        [userId]
      );

      // Format notifications for mobile app
      const formattedNotifications = notifications.map(notification => ({
        id: notification.id.toString(),
        type: notification.alert_id ? 'alert' : notification.type || 'notification',
        severity: notification.severity || 'medium',
        title: notification.alert_title || notification.title || 'SafeHaven Alert',
        body: notification.alert_description || notification.message || '',
        data: {
          alert_id: notification.alert_id,
          alert_type: notification.alert_type,
          latitude: notification.latitude,
          longitude: notification.longitude
        },
        timestamp: new Date(notification.created_at).getTime()
      }));

      res.json({
        status: 'success',
        data: {
          notifications: formattedNotifications,
          count: formattedNotifications.length
        }
      });
    } catch (error) {
      logger.error('Error getting unread notifications:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get notifications'
      });
    }
  }

  /**
   * Mark notifications as read
   */
  async markNotificationsAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { notificationIds } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
        return;
      }

      if (notificationIds === 'all') {
        // Mark all notifications as read for user
        await db.query(
          'UPDATE user_notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL',
          [userId]
        );

        logger.info(`All notifications marked as read for user ${userId}`);
      } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
        // Mark specific notifications as read
        const placeholders = notificationIds.map(() => '?').join(',');
        await db.query(
          `UPDATE user_notifications SET read_at = NOW() 
           WHERE user_id = ? AND id IN (${placeholders}) AND read_at IS NULL`,
          [userId, ...notificationIds]
        );

        logger.info(`${notificationIds.length} notifications marked as read for user ${userId}`);
      }

      res.json({
        status: 'success',
        message: 'Notifications marked as read'
      });
    } catch (error) {
      logger.error('Error marking notifications as read:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark notifications as read'
      });
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { severity = 'medium', title = 'Test Notification', message = 'This is a test notification.' } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
        return;
      }

      // Get user's device tokens
      const [tokens] = await db.query<any[]>(
        'SELECT device_token FROM device_tokens WHERE user_id = ? AND device_token IS NOT NULL',
        [userId]
      );

      const deviceTokens = tokens.map(t => t.device_token);

      if (deviceTokens.length === 0) {
        res.status(400).json({
          status: 'error',
          message: 'No device tokens found for user'
        });
        return;
      }

      // Create test alert object
      const testAlert = {
        id: 0,
        title,
        description: message,
        severity,
        alert_type: 'test'
      };

      // Send push notification
      const result = await notificationService.sendPushNotification(deviceTokens, testAlert);

      // Log test notification
      await notificationService.logNotification(
        userId,
        'push',
        title,
        message,
        result.success > 0 ? 'sent' : 'failed'
      );

      res.json({
        status: 'success',
        message: 'Test notification sent',
        data: {
          sent: result.success,
          failed: result.failure,
          errors: result.errors
        }
      });
    } catch (error) {
      logger.error('Error sending test notification:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send test notification'
      });
    }
  }

  /**
   * Get notification settings for user
   */
  async getNotificationSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
        return;
      }

      // Get user notification settings
      const [settings] = await db.query<any[]>(
        'SELECT * FROM user_notification_settings WHERE user_id = ?',
        [userId]
      );

      const userSettings = settings[0] || {
        push_enabled: true,
        sms_enabled: true,
        email_enabled: true,
        sound_enabled: true,
        vibration_enabled: true
      };

      res.json({
        status: 'success',
        data: {
          pushEnabled: userSettings.push_enabled,
          smsEnabled: userSettings.sms_enabled,
          emailEnabled: userSettings.email_enabled,
          soundEnabled: userSettings.sound_enabled,
          vibrationEnabled: userSettings.vibration_enabled
        }
      });
    } catch (error) {
      logger.error('Error getting notification settings:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get notification settings'
      });
    }
  }

  /**
   * Update notification settings for user
   */
  async updateNotificationSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        pushEnabled,
        smsEnabled,
        emailEnabled,
        soundEnabled,
        vibrationEnabled
      } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
        return;
      }

      // Check if settings exist
      const [existing] = await db.query<any[]>(
        'SELECT id FROM user_notification_settings WHERE user_id = ?',
        [userId]
      );

      if (existing.length === 0) {
        // Insert new settings
        await db.query(
          `INSERT INTO user_notification_settings 
           (user_id, push_enabled, sms_enabled, email_enabled, sound_enabled, vibration_enabled, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [userId, pushEnabled, smsEnabled, emailEnabled, soundEnabled, vibrationEnabled]
        );
      } else {
        // Update existing settings
        await db.query(
          `UPDATE user_notification_settings 
           SET push_enabled = ?, sms_enabled = ?, email_enabled = ?, 
               sound_enabled = ?, vibration_enabled = ?, updated_at = NOW()
           WHERE user_id = ?`,
          [pushEnabled, smsEnabled, emailEnabled, soundEnabled, vibrationEnabled, userId]
        );
      }

      logger.info(`Notification settings updated for user ${userId}`);

      res.json({
        status: 'success',
        message: 'Notification settings updated successfully'
      });
    } catch (error) {
      logger.error('Error updating notification settings:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update notification settings'
      });
    }
  }
}