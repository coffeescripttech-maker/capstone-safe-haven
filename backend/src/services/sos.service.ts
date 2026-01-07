// SOS Service - Handles emergency SOS alerts

import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { logger } from '../utils/logger';

export interface SOSAlert {
  id: number;
  userId: number;
  latitude?: number;
  longitude?: number;
  message: string;
  userInfo: any;
  status: string;
  priority: string;
  responderId?: number;
  responseTime?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSOSRequest {
  userId: number;
  latitude?: number;
  longitude?: number;
  message: string;
  userInfo: {
    name: string;
    phone: string;
    [key: string]: any;
  };
}

export interface SOSNotification {
  sosAlertId: number;
  recipientType: 'emergency_services' | 'emergency_contact' | 'responder' | 'admin';
  recipientId?: number;
  recipientInfo?: any;
  notificationMethod: 'push' | 'sms' | 'email' | 'call';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

class SOSService {
  // Create new SOS alert
  async createSOSAlert(data: CreateSOSRequest): Promise<SOSAlert> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert SOS alert
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO sos_alerts (user_id, latitude, longitude, message, user_info, status, priority)
         VALUES (?, ?, ?, ?, ?, 'sent', 'high')`,
        [
          data.userId,
          data.latitude || null,
          data.longitude || null,
          data.message,
          JSON.stringify(data.userInfo)
        ]
      );

      const sosId = result.insertId;

      // Get the created SOS alert
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM sos_alerts WHERE id = ?',
        [sosId]
      );

      const sosAlert = rows[0] as SOSAlert;

      // Send notifications asynchronously (don't wait)
      this.sendNotifications(sosId, data).catch(error => {
        logger.error('Error sending SOS notifications:', error);
      });

      await connection.commit();

      logger.info(`SOS alert created: ${sosId} by user ${data.userId}`);

      return sosAlert;
    } catch (error) {
      await connection.rollback();
      logger.error('Error creating SOS alert:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Send notifications for SOS alert
  private async sendNotifications(sosId: number, data: CreateSOSRequest): Promise<void> {
    try {
      // 1. Notify emergency services (911)
      await this.createNotification({
        sosAlertId: sosId,
        recipientType: 'emergency_services',
        recipientInfo: { service: '911', location: 'Philippines' },
        notificationMethod: 'call',
        status: 'pending'
      });

      // 2. Notify local disaster response team
      await this.notifyLocalResponders(sosId, data.latitude, data.longitude);

      // 3. Notify user's emergency contact (if available)
      await this.notifyEmergencyContact(sosId, data.userId);

      // 4. Notify nearby responders (within 10km)
      if (data.latitude && data.longitude) {
        await this.notifyNearbyResponders(sosId, data.latitude, data.longitude);
      }

      // 5. Send push notifications to admins
      await this.notifyAdmins(sosId);

      logger.info(`Notifications sent for SOS alert ${sosId}`);
    } catch (error) {
      logger.error(`Error sending notifications for SOS ${sosId}:`, error);
    }
  }

  // Create notification record
  private async createNotification(data: SOSNotification): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO sos_notifications (sos_alert_id, recipient_type, recipient_id, recipient_info, notification_method, status, sent_at)
         VALUES (?, ?, ?, ?, ?, 'sent', NOW())`,
        [
          data.sosAlertId,
          data.recipientType,
          data.recipientId || null,
          data.recipientInfo ? JSON.stringify(data.recipientInfo) : null,
          data.notificationMethod
        ]
      );
    } catch (error) {
      logger.error('Error creating notification:', error);
    }
  }

  // Notify local disaster response team
  private async notifyLocalResponders(sosId: number, latitude?: number, longitude?: number): Promise<void> {
    try {
      // Get LGU officers and disaster response team
      const [responders] = await pool.query<RowDataPacket[]>(
        `SELECT id, email, phone FROM users WHERE role IN ('lgu_officer', 'admin') AND is_active = true`
      );

      for (const responder of responders) {
        await this.createNotification({
          sosAlertId: sosId,
          recipientType: 'responder',
          recipientId: responder.id,
          recipientInfo: { email: responder.email, phone: responder.phone },
          notificationMethod: 'push',
          status: 'pending'
        });
      }
    } catch (error) {
      logger.error('Error notifying local responders:', error);
    }
  }

  // Notify user's emergency contact
  private async notifyEmergencyContact(sosId: number, userId: number): Promise<void> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT emergency_contact_name, emergency_contact_phone FROM users WHERE id = ?`,
        [userId]
      );

      if (rows.length > 0 && rows[0].emergency_contact_phone) {
        await this.createNotification({
          sosAlertId: sosId,
          recipientType: 'emergency_contact',
          recipientInfo: {
            name: rows[0].emergency_contact_name,
            phone: rows[0].emergency_contact_phone
          },
          notificationMethod: 'sms',
          status: 'pending'
        });
      }
    } catch (error) {
      logger.error('Error notifying emergency contact:', error);
    }
  }

  // Notify nearby responders (within radius)
  private async notifyNearbyResponders(sosId: number, latitude: number, longitude: number, radiusKm: number = 10): Promise<void> {
    try {
      // Find responders within radius using Haversine formula
      const [responders] = await pool.query<RowDataPacket[]>(
        `SELECT id, email, phone,
         (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
         FROM users
         WHERE role IN ('lgu_officer', 'admin') 
         AND is_active = true
         AND latitude IS NOT NULL 
         AND longitude IS NOT NULL
         HAVING distance < ?
         ORDER BY distance
         LIMIT 10`,
        [latitude, longitude, latitude, radiusKm]
      );

      for (const responder of responders) {
        await this.createNotification({
          sosAlertId: sosId,
          recipientType: 'responder',
          recipientId: responder.id,
          recipientInfo: { 
            email: responder.email, 
            phone: responder.phone,
            distance: responder.distance 
          },
          notificationMethod: 'push',
          status: 'pending'
        });
      }
    } catch (error) {
      logger.error('Error notifying nearby responders:', error);
    }
  }

  // Notify all admins
  private async notifyAdmins(sosId: number): Promise<void> {
    try {
      const [admins] = await pool.query<RowDataPacket[]>(
        `SELECT id, email FROM users WHERE role = 'admin' AND is_active = true`
      );

      for (const admin of admins) {
        await this.createNotification({
          sosAlertId: sosId,
          recipientType: 'admin',
          recipientId: admin.id,
          recipientInfo: { email: admin.email },
          notificationMethod: 'email',
          status: 'pending'
        });
      }
    } catch (error) {
      logger.error('Error notifying admins:', error);
    }
  }

  // Get SOS alert by ID
  async getSOSAlertById(id: number): Promise<SOSAlert | null> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT sa.*, 
         u.first_name, u.last_name, u.email, u.phone,
         r.first_name as responder_first_name, r.last_name as responder_last_name
         FROM sos_alerts sa
         LEFT JOIN users u ON sa.user_id = u.id
         LEFT JOIN users r ON sa.responder_id = r.id
         WHERE sa.id = ?`,
        [id]
      );

      return rows.length > 0 ? rows[0] as SOSAlert : null;
    } catch (error) {
      logger.error('Error getting SOS alert:', error);
      throw error;
    }
  }

  // Get all SOS alerts with filters
  async getSOSAlerts(filters: {
    userId?: number;
    status?: string;
    priority?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ alerts: SOSAlert[]; total: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      let whereConditions: string[] = [];
      let params: any[] = [];

      if (filters.userId) {
        whereConditions.push('sa.user_id = ?');
        params.push(filters.userId);
      }

      if (filters.status) {
        whereConditions.push('sa.status = ?');
        params.push(filters.status);
      }

      if (filters.priority) {
        whereConditions.push('sa.priority = ?');
        params.push(filters.priority);
      }

      if (filters.startDate) {
        whereConditions.push('sa.created_at >= ?');
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        whereConditions.push('sa.created_at <= ?');
        params.push(filters.endDate);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const [countRows] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total FROM sos_alerts sa ${whereClause}`,
        params
      );
      const total = countRows[0].total;

      // Get alerts
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT sa.*, 
         u.first_name, u.last_name, u.email, u.phone
         FROM sos_alerts sa
         LEFT JOIN users u ON sa.user_id = u.id
         ${whereClause}
         ORDER BY sa.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return {
        alerts: rows as SOSAlert[],
        total
      };
    } catch (error) {
      logger.error('Error getting SOS alerts:', error);
      throw error;
    }
  }

  // Update SOS alert status
  async updateSOSStatus(id: number, status: string, responderId?: number, notes?: string): Promise<void> {
    try {
      const updates: string[] = ['status = ?'];
      const params: any[] = [status];

      if (responderId) {
        updates.push('responder_id = ?');
        params.push(responderId);
      }

      if (status === 'acknowledged' || status === 'responding') {
        updates.push('response_time = NOW()');
      }

      if (notes) {
        updates.push('resolution_notes = ?');
        params.push(notes);
      }

      params.push(id);

      await pool.query(
        `UPDATE sos_alerts SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      logger.info(`SOS alert ${id} status updated to ${status}`);
    } catch (error) {
      logger.error('Error updating SOS status:', error);
      throw error;
    }
  }

  // Get SOS statistics
  async getSOSStatistics(userId?: number): Promise<any> {
    try {
      const userCondition = userId ? 'WHERE user_id = ?' : '';
      const params = userId ? [userId] : [];

      const [stats] = await pool.query<RowDataPacket[]>(
        `SELECT 
         COUNT(*) as total,
         SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as pending,
         SUM(CASE WHEN status = 'acknowledged' THEN 1 ELSE 0 END) as acknowledged,
         SUM(CASE WHEN status = 'responding' THEN 1 ELSE 0 END) as responding,
         SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
         SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
         AVG(TIMESTAMPDIFF(MINUTE, created_at, response_time)) as avg_response_time_minutes
         FROM sos_alerts
         ${userCondition}`,
        params
      );

      return stats[0];
    } catch (error) {
      logger.error('Error getting SOS statistics:', error);
      throw error;
    }
  }
}

export const sosService = new SOSService();
