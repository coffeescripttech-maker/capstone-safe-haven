// Alert Targeting Service - Find and notify users based on location

import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import admin from 'firebase-admin';

export const alertTargetingService = {
  // Target users by city
  async targetUsersByCity(city: string, alertId: number, alertTitle: string): Promise<number> {
    const connection = await pool.getConnection();
    
    try {
      // Find users in the specified city with FCM tokens
      const [users] = await connection.query<RowDataPacket[]>(
        `SELECT id, fcm_token, first_name, notification_preferences 
         FROM users 
         WHERE city = ? 
         AND fcm_token IS NOT NULL 
         AND fcm_token != ''`,
        [city]
      );
      
      console.log(`[Alert Targeting] Found ${users.length} users in ${city}`);
      
      // Filter users based on notification preferences
      const targetUsers = users.filter(user => {
        const prefs = user.notification_preferences 
          ? (typeof user.notification_preferences === 'string' 
              ? JSON.parse(user.notification_preferences) 
              : user.notification_preferences)
          : { weather: true };
        return prefs.weather !== false;
      });
      
      console.log(`[Alert Targeting] ${targetUsers.length} users have weather notifications enabled`);
      
      return targetUsers.length;
    } finally {
      connection.release();
    }
  },

  // Target users within radius of coordinates
  async targetUsersByRadius(
    latitude: number,
    longitude: number,
    radiusKm: number,
    alertId: number,
    alertTitle: string
  ): Promise<number> {
    const connection = await pool.getConnection();
    
    try {
      // Find users within radius using Haversine formula
      // Note: This is approximate. For production, consider using PostGIS or similar
      const [users] = await connection.query<RowDataPacket[]>(
        `SELECT 
          id, fcm_token, first_name, latitude, longitude, notification_preferences,
          (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
           cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
           sin(radians(latitude)))) AS distance
         FROM users
         WHERE fcm_token IS NOT NULL 
         AND fcm_token != ''
         AND latitude IS NOT NULL
         AND longitude IS NOT NULL
         HAVING distance <= ?
         ORDER BY distance`,
        [latitude, longitude, latitude, radiusKm]
      );
      
      console.log(`[Alert Targeting] Found ${users.length} users within ${radiusKm}km`);
      
      // Filter users based on notification preferences
      const targetUsers = users.filter(user => {
        const prefs = user.notification_preferences 
          ? (typeof user.notification_preferences === 'string' 
              ? JSON.parse(user.notification_preferences) 
              : user.notification_preferences)
          : { earthquake: true };
        return prefs.earthquake !== false;
      });
      
      console.log(`[Alert Targeting] ${targetUsers.length} users have earthquake notifications enabled`);
      
      return targetUsers.length;
    } finally {
      connection.release();
    }
  },

  // Send push notifications for an alert
  async sendNotificationsForAlert(alertId: number): Promise<number> {
    const connection = await pool.getConnection();
    
    try {
      // Get alert details
      const [alerts] = await connection.query<RowDataPacket[]>(
        `SELECT * FROM disaster_alerts WHERE id = ?`,
        [alertId]
      );
      
      if (alerts.length === 0) {
        console.log(`[Alert Targeting] Alert ${alertId} not found`);
        return 0;
      }
      
      const alert = alerts[0];
      const affectedAreas = typeof alert.affected_areas === 'string' 
        ? JSON.parse(alert.affected_areas) 
        : alert.affected_areas;
      
      let targetUsers: RowDataPacket[] = [];
      
      // Determine targeting strategy based on alert source
      if (alert.source === 'auto_weather' && affectedAreas && affectedAreas.length > 0) {
        // Target by city
        const [users] = await connection.query<RowDataPacket[]>(
          `SELECT id, fcm_token, first_name, notification_preferences 
           FROM users 
           WHERE city IN (?) 
           AND fcm_token IS NOT NULL 
           AND fcm_token != ''`,
          [affectedAreas]
        );
        targetUsers = users;
      } else if (alert.source === 'auto_earthquake' && alert.latitude && alert.longitude && alert.radius_km) {
        // Target by radius
        const [users] = await connection.query<RowDataPacket[]>(
          `SELECT 
            id, fcm_token, first_name, notification_preferences,
            (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
             cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
             sin(radians(latitude)))) AS distance
           FROM users
           WHERE fcm_token IS NOT NULL 
           AND fcm_token != ''
           AND latitude IS NOT NULL
           AND longitude IS NOT NULL
           HAVING distance <= ?`,
          [alert.latitude, alert.longitude, alert.latitude, alert.radius_km]
        );
        targetUsers = users;
      } else {
        // Manual alert or no specific targeting - send to all
        const [users] = await connection.query<RowDataPacket[]>(
          `SELECT id, fcm_token, first_name, notification_preferences 
           FROM users 
           WHERE fcm_token IS NOT NULL 
           AND fcm_token != ''`
        );
        targetUsers = users;
      }
      
      // Filter based on preferences
      const notificationType = alert.source === 'auto_weather' ? 'weather' : 
                              alert.source === 'auto_earthquake' ? 'earthquake' : 'alerts';
      
      const filteredUsers = targetUsers.filter(user => {
        const prefs = user.notification_preferences 
          ? (typeof user.notification_preferences === 'string' 
              ? JSON.parse(user.notification_preferences) 
              : user.notification_preferences)
          : {};
        return prefs[notificationType] !== false;
      });
      
      console.log(`[Alert Targeting] Sending notifications to ${filteredUsers.length} users for alert ${alertId}`);
      
      // Send notifications in batches
      const batchSize = 500;
      let sentCount = 0;
      
      for (let i = 0; i < filteredUsers.length; i += batchSize) {
        const batch = filteredUsers.slice(i, i + batchSize);
        const tokens = batch.map(user => user.fcm_token).filter(token => token);
        
        if (tokens.length > 0) {
          try {
            const message = {
              notification: {
                title: this.getSeverityEmoji(alert.severity) + ' ' + alert.title,
                body: alert.description.substring(0, 200),
              },
              data: {
                alertId: alertId.toString(),
                type: alert.alert_type,
                severity: alert.severity,
                source: alert.source,
                latitude: alert.latitude?.toString() || '',
                longitude: alert.longitude?.toString() || '',
              },
              tokens: tokens,
            };
            
            const response = await admin.messaging().sendEachForMulticast(message);
            sentCount += response.successCount;
            
            if (response.failureCount > 0) {
              console.log(`[Alert Targeting] ${response.failureCount} notifications failed in batch`);
            }
          } catch (error) {
            console.error('[Alert Targeting] Error sending notification batch:', error);
          }
        }
      }
      
      // Update log with actual sent count
      await connection.query(
        `UPDATE alert_automation_logs 
         SET users_notified = ?
         WHERE alert_id = ?`,
        [sentCount, alertId]
      );
      
      console.log(`[Alert Targeting] Successfully sent ${sentCount} notifications for alert ${alertId}`);
      
      return sentCount;
    } catch (error) {
      console.error('[Alert Targeting] Error sending notifications:', error);
      return 0;
    } finally {
      connection.release();
    }
  },

  // Get severity emoji
  getSeverityEmoji(severity: string): string {
    const emojiMap: { [key: string]: string } = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨',
      extreme: '🔴'
    };
    return emojiMap[severity] || '📢';
  },

  // Get all users (for testing)
  async getAllActiveUsers(): Promise<number> {
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count 
         FROM users 
         WHERE fcm_token IS NOT NULL 
         AND fcm_token != ''`
      );
      
      return users[0].count || 0;
    } finally {
      connection.release();
    }
  }
};
