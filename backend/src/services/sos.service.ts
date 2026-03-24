// SOS Service - Handles emergency SOS alerts

import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { logger } from '../utils/logger';
import { dataFilterService } from './dataFilter.service';
import { websocketService } from './websocket.service';
import { toPhilippineTime } from '../utils/timezone';

export interface SOSAlert {
  id: number;
  userId: number;
  latitude?: number;
  longitude?: number;
  message: string;
  userInfo: any;
  status: string;
  priority: string;
  targetAgency: string;
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
  targetAgency: 'barangay' | 'lgu' | 'bfp' | 'pnp' | 'mdrrmo' | 'all';
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
        `INSERT INTO sos_alerts (user_id, latitude, longitude, message, user_info, status, priority, target_agency)
         VALUES (?, ?, ?, ?, ?, 'sent', 'high', ?)`,
        [
          data.userId,
          data.latitude || null,
          data.longitude || null,
          data.message,
          JSON.stringify(data.userInfo),
          data.targetAgency
        ]
      );

      const sosId = result.insertId;

      // Get the created SOS alert
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM sos_alerts WHERE id = ?',
        [sosId]
      );

      const sosAlert = rows[0] as SOSAlert;

      // Broadcast new SOS via WebSocket for real-time notifications
      websocketService.broadcastNewSOS(sosAlert);
      logger.info(`📢 WebSocket broadcast sent for new SOS alert: ${sosId}`);

      // Send notifications asynchronously (don't wait) based on target agency
      this.sendNotifications(sosId, data).catch(error => {
        logger.error('Error sending SOS notifications:', error);
      });

      await connection.commit();

      logger.info(`SOS alert created: ${sosId} by user ${data.userId}, target: ${data.targetAgency}`);

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
      const targetAgency = data.targetAgency;

      // 1. Always notify emergency services (911) for critical emergencies
      await this.createNotification({
        sosAlertId: sosId,
        recipientType: 'emergency_services',
        recipientInfo: { service: '911', location: 'Philippines' },
        notificationMethod: 'call',
        status: 'pending'
      });

      // 2. Notify user's emergency contact (if available)
      await this.notifyEmergencyContact(sosId, data.userId);

      // 3. Route to specific agencies based on target
      if (targetAgency === 'all') {
        // Notify all agencies
        await this.notifyAgency(sosId, 'lgu_officer', 'Barangay/LGU');
        await this.notifyAgency(sosId, 'bfp', 'BFP');
        await this.notifyAgency(sosId, 'pnp', 'PNP');
        await this.notifyAgency(sosId, 'mdrrmo', 'MDRRMO');
        await this.notifyAgency(sosId, 'admin', 'Admin');
      } else if (targetAgency === 'barangay' || targetAgency === 'lgu') {
        // Notify LGU officers (includes barangay officials)
        await this.notifyAgency(sosId, 'lgu_officer', 'Barangay/LGU');
        await this.notifyAgency(sosId, 'admin', 'Admin'); // Always notify admins
      } else {
        // Notify specific agency (bfp, pnp, mdrrmo)
        await this.notifyAgency(sosId, targetAgency, targetAgency.toUpperCase());
        await this.notifyAgency(sosId, 'admin', 'Admin'); // Always notify admins
      }

      // 4. Notify nearby responders (within 10km) if location available
      if (data.latitude && data.longitude) {
        await this.notifyNearbyResponders(sosId, data.latitude, data.longitude, targetAgency);
      }

      logger.info(`Notifications sent for SOS alert ${sosId} to ${targetAgency}`);
    } catch (error) {
      logger.error(`Error sending notifications for SOS ${sosId}:`, error);
    }
  }

  // Notify specific agency by role
  private async notifyAgency(sosId: number, role: string, agencyName: string): Promise<void> {
    try {
      const [responders] = await pool.query<RowDataPacket[]>(
        `SELECT id, email, phone FROM users WHERE role = ? AND is_active = true`,
        [role]
      );

      for (const responder of responders) {
        await this.createNotification({
          sosAlertId: sosId,
          recipientType: 'responder',
          recipientId: responder.id,
          recipientInfo: { 
            email: responder.email, 
            phone: responder.phone,
            agency: agencyName
          },
          notificationMethod: 'push',
          status: 'pending'
        });
      }

      logger.info(`Notified ${responders.length} ${agencyName} responders for SOS ${sosId}`);
    } catch (error) {
      logger.error(`Error notifying ${agencyName}:`, error);
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

  // Notify nearby responders (within radius) - filtered by target agency
  private async notifyNearbyResponders(sosId: number, latitude: number, longitude: number, targetAgency: string, radiusKm: number = 10): Promise<void> {
    try {
      // Build role filter based on target agency
      let roleFilter = '';
      if (targetAgency === 'all') {
        roleFilter = "role IN ('lgu_officer', 'admin', 'pnp', 'bfp', 'mdrrmo')";
      } else if (targetAgency === 'barangay' || targetAgency === 'lgu') {
        roleFilter = "role IN ('lgu_officer', 'admin')";
      } else {
        roleFilter = `role IN ('${targetAgency}', 'admin')`;
      }

      // Find responders within radius using Haversine formula
      const [responders] = await pool.query<RowDataPacket[]>(
        `SELECT id, email, phone, role,
         (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
         FROM users
         WHERE ${roleFilter}
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
            distance: responder.distance,
            role: responder.role
          },
          notificationMethod: 'push',
          status: 'pending'
        });
      }

      logger.info(`Notified ${responders.length} nearby responders for SOS ${sosId}`);
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

  // Format SOS alert with timezone conversion
  private formatSOSAlert(alert: any): any {
    return {
      ...alert,
      created_at: alert.created_at ? toPhilippineTime(alert.created_at) : null,
      updated_at: alert.updated_at ? toPhilippineTime(alert.updated_at) : null,
      response_time: alert.response_time ? toPhilippineTime(alert.response_time) : null,
    };
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

      if (rows.length === 0) return null;
      
      return this.formatSOSAlert(rows[0]) as SOSAlert;
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
    userRole?: string;
    userJurisdiction?: string | null;
  }): Promise<{ alerts: SOSAlert[]; total: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      let whereConditions: string[] = [];
      let params: any[] = [];

      // Apply role-based filtering for target_agency
      // Super admin sees all alerts
      // MDRRMO/admin, PNP, BFP, and other roles only see alerts targeted to them or 'all'
      if (filters.userRole && filters.userRole !== 'super_admin') {
        // Map role to target_agency values they should see
        const roleAgencyMap: Record<string, string[]> = {
          'mdrrmo': ['mdrrmo', 'admin', 'all'],
          'admin': ['mdrrmo', 'admin', 'all'],
          'pnp': ['pnp', 'all'],
          'bfp': ['bfp', 'all'],
          'lgu_officer': ['barangay', 'lgu', 'all']
        };

        const allowedAgencies = roleAgencyMap[filters.userRole] || ['all'];
        const placeholders = allowedAgencies.map(() => '?').join(',');
        whereConditions.push(`sa.target_agency IN (${placeholders})`);
        params.push(...allowedAgencies);

        logger.info(`Filtering SOS alerts for role ${filters.userRole}: ${allowedAgencies.join(', ')}`);
      }

      // Apply geographic filtering using DataFilterService (if applicable)
      // Requirements: 4.1, 7.4, 11.2
      if (filters.userRole && filters.userJurisdiction !== undefined) {
        const filterConditions = dataFilterService.applySOSAlertFilter(filters.userRole, filters.userJurisdiction);
        if (filterConditions.whereClause) {
          whereConditions.push(filterConditions.whereClause);
          params.push(...filterConditions.params);
        }
      }

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

      // Format alerts with timezone conversion
      const formattedAlerts = rows.map(alert => this.formatSOSAlert(alert));

      return {
        alerts: formattedAlerts as SOSAlert[],
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

  // Get SOS statistics with role-based filtering
  async getSOSStatistics(filters?: { userId?: number; userRole?: string }): Promise<any> {
    try {
      let whereConditions: string[] = [];
      let params: any[] = [];

      // Apply role-based filtering for target_agency
      if (filters?.userRole && filters.userRole !== 'super_admin' && filters.userRole !== 'admin' && filters.userRole !== 'mdrrmo') {
        const roleAgencyMap: Record<string, string[]> = {
          'pnp': ['pnp', 'all'],
          'bfp': ['bfp', 'all'],
          'lgu_officer': ['barangay', 'lgu', 'all']
        };

        const allowedAgencies = roleAgencyMap[filters.userRole] || ['all'];
        const placeholders = allowedAgencies.map(() => '?').join(',');
        whereConditions.push(`target_agency IN (${placeholders})`);
        params.push(...allowedAgencies);
      }

      // Filter by specific user if provided
      if (filters?.userId) {
        whereConditions.push('user_id = ?');
        params.push(filters.userId);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

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
         ${whereClause}`,
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
