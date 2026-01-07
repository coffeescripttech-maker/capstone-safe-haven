import db from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { NotificationService } from './notification.service';

const notificationService = new NotificationService();

interface CreateAlertDto {
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  source: string;
  affected_areas: string[];
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  start_time: string;
  end_time?: string;
  metadata?: Record<string, any>;
}

interface AlertFilters {
  alert_type?: string;
  severity?: string;
  is_active?: boolean;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

interface Alert {
  id: number;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  source: string;
  affected_areas: string[];
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  start_time: Date;
  end_time?: Date;
  is_active: boolean;
  metadata?: Record<string, any>;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

interface BroadcastResult {
  total_recipients: number;
  push_sent: number;
  push_failed: number;
  sms_sent: number;
  sms_failed: number;
}

interface AlertStatistics {
  total_notifications: number;
  push_count: number;
  sms_count: number;
  successful: number;
  failed: number;
}

export class AlertService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Broadcast alert to targeted users
   */
  async broadcastAlert(alertId: number): Promise<BroadcastResult> {
    const alert = await this.getAlertById(alertId);
    const users = await this.getTargetedUsers(alert);

    const result: BroadcastResult = {
      total_recipients: users.length,
      push_sent: 0,
      push_failed: 0,
      sms_sent: 0,
      sms_failed: 0
    };

    if (users.length === 0) {
      return result;
    }

    // Get device tokens for push notifications
    const userIds = users.map(u => u.id);
    const [tokens] = await db.query(
      `SELECT user_id, token FROM device_tokens 
       WHERE user_id IN (?) AND is_active = TRUE`,
      [userIds]
    );

    const tokenMap = new Map<number, string[]>();
    (tokens as any[]).forEach(t => {
      if (!tokenMap.has(t.user_id)) {
        tokenMap.set(t.user_id, []);
      }
      tokenMap.get(t.user_id)!.push(t.token);
    });

    // Send push notifications
    const allTokens: string[] = [];
    tokenMap.forEach(tokens => allTokens.push(...tokens));

    if (allTokens.length > 0) {
      const pushResult = await this.notificationService.sendPushNotification(allTokens, alert);
      result.push_sent = pushResult.success;
      result.push_failed = pushResult.failure;

      // Log push notifications
      for (const user of users) {
        const userTokens = tokenMap.get(user.id) || [];
        if (userTokens.length > 0) {
          await this.notificationService.logNotification(
            user.id,
            'push',
            alert.title,
            alert.description,
            pushResult.success > 0 ? 'sent' : 'failed'
          );
        }
      }
    }

    // SMS fallback for users without tokens or failed push
    const usersForSMS = users.filter(u => {
      const hasTokens = tokenMap.has(u.id);
      return !hasTokens && u.phone;
    });

    if (usersForSMS.length > 0) {
      const phones = usersForSMS.map(u => u.phone).filter(p => p);
      const smsMessage = this.notificationService.formatSMSMessage(alert);
      const smsResult = await this.notificationService.sendSMS(phones, smsMessage);
      
      result.sms_sent = smsResult.success;
      result.sms_failed = smsResult.failure;

      // Log SMS notifications
      for (const user of usersForSMS) {
        await this.notificationService.logNotification(
          user.id,
          'sms',
          alert.title,
          alert.description,
          smsResult.success > 0 ? 'sent' : 'failed'
        );
      }
    }

    return result;
  }

  /**
   * Get broadcast statistics for an alert
   */
  async getAlertStatistics(alertId: number): Promise<AlertStatistics> {
    await this.getAlertById(alertId); // Verify alert exists

    try {
      const [stats] = await db.query(
        `SELECT 
          COUNT(*) as total_notifications,
          SUM(CASE WHEN type = 'push' THEN 1 ELSE 0 END) as push_count,
          SUM(CASE WHEN type = 'sms' THEN 1 ELSE 0 END) as sms_count,
          SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as successful,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
         FROM notification_log
         WHERE title = (SELECT title FROM disaster_alerts WHERE id = ?)`,
        [alertId]
      );

      return (stats as any)[0];
    } catch (error) {
      throw new AppError('Failed to get alert statistics', 500);
    }
  }

  /**
   * Create a new disaster alert
   */
  async createAlert(data: CreateAlertDto, createdBy: number): Promise<Alert> {
    const {
      alert_type,
      severity,
      title,
      description,
      source,
      affected_areas,
      latitude,
      longitude,
      radius_km,
      start_time,
      end_time,
      metadata
    } = data;

    // Validation
    this.validateAlertType(alert_type);
    this.validateSeverity(severity);
    this.validateSource(source);
    this.validateAffectedAreas(affected_areas);
    this.validateCoordinates(latitude, longitude);
    this.validateDateRange(start_time, end_time);

    try {
      const [result] = await db.query(
        `INSERT INTO disaster_alerts 
         (alert_type, severity, title, description, source, affected_areas, 
          latitude, longitude, radius_km, start_time, end_time, metadata, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          alert_type,
          severity,
          title,
          description,
          source,
          JSON.stringify(affected_areas),
          latitude || null,
          longitude || null,
          radius_km || null,
          start_time,
          end_time || null,
          metadata ? JSON.stringify(metadata) : null,
          createdBy
        ]
      );

      const alertId = (result as any).insertId;
      return this.getAlertById(alertId);
    } catch (error) {
      throw new AppError('Failed to create alert', 500);
    }
  }

  /**
   * Get alerts with filtering and pagination
   */
  async getAlerts(filters: AlertFilters): Promise<{ alerts: Alert[]; total: number; page: number; limit: number }> {
    const {
      alert_type,
      severity,
      is_active = true,
      latitude,
      longitude,
      radius,
      page = 1,
      limit = 20
    } = filters;

    let query = `
      SELECT * FROM disaster_alerts 
      WHERE 1=1
    `;
    const params: any[] = [];

    // Apply filters
    if (alert_type) {
      query += ` AND alert_type = ?`;
      params.push(alert_type);
    }

    if (severity) {
      query += ` AND severity = ?`;
      params.push(severity);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(is_active);
    }

    // Location-based filtering
    if (latitude && longitude && radius) {
      // This is a simplified version - in production, use spatial queries
      query += ` AND (
        latitude IS NULL OR 
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
         cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
         sin(radians(latitude)))) <= ?
      )`;
      params.push(latitude, longitude, latitude, radius);
    }

    // Sort by severity (critical > high > moderate > low) and date
    query += ` ORDER BY 
      FIELD(severity, 'critical', 'high', 'moderate', 'low'),
      created_at DESC
    `;

    // Pagination
    const offset = (page - 1) * limit;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    try {
      const [alerts] = await db.query(query, params);
      
      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM disaster_alerts WHERE 1=1`;
      const countParams: any[] = [];
      
      if (alert_type) {
        countQuery += ` AND alert_type = ?`;
        countParams.push(alert_type);
      }
      if (severity) {
        countQuery += ` AND severity = ?`;
        countParams.push(severity);
      }
      if (is_active !== undefined) {
        countQuery += ` AND is_active = ?`;
        countParams.push(is_active);
      }

      const [countResult] = await db.query(countQuery, countParams);
      const total = (countResult as any)[0].total;

      return {
        alerts: this.parseAlerts(alerts as any[]),
        total,
        page,
        limit
      };
    } catch (error) {
      throw new AppError('Failed to fetch alerts', 500);
    }
  }

  /**
   * Get single alert by ID
   */
  async getAlertById(id: number): Promise<Alert> {
    try {
      const [alerts] = await db.query(
        'SELECT * FROM disaster_alerts WHERE id = ?',
        [id]
      );

      if (!Array.isArray(alerts) || alerts.length === 0) {
        throw new AppError('Alert not found', 404);
      }

      return this.parseAlert(alerts[0]);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch alert', 500);
    }
  }

  /**
   * Update an existing alert
   */
  async updateAlert(id: number, data: Partial<CreateAlertDto>): Promise<Alert> {
    // Verify alert exists
    const existingAlert = await this.getAlertById(id);

    const updates: string[] = [];
    const params: any[] = [];
    let severityUpgraded = false;

    if (data.alert_type) {
      this.validateAlertType(data.alert_type);
      updates.push('alert_type = ?');
      params.push(data.alert_type);
    }

    if (data.severity) {
      this.validateSeverity(data.severity);
      // Check if severity is being upgraded
      const severityLevels = { low: 1, moderate: 2, high: 3, critical: 4 };
      if (severityLevels[data.severity as keyof typeof severityLevels] > 
          severityLevels[existingAlert.severity as keyof typeof severityLevels]) {
        severityUpgraded = true;
      }
      updates.push('severity = ?');
      params.push(data.severity);
    }

    if (data.title) {
      updates.push('title = ?');
      params.push(data.title);
    }

    if (data.description) {
      updates.push('description = ?');
      params.push(data.description);
    }

    if (data.source) {
      this.validateSource(data.source);
      updates.push('source = ?');
      params.push(data.source);
    }

    if (data.affected_areas) {
      this.validateAffectedAreas(data.affected_areas);
      updates.push('affected_areas = ?');
      params.push(JSON.stringify(data.affected_areas));
    }

    if (data.latitude !== undefined) {
      updates.push('latitude = ?');
      params.push(data.latitude);
    }

    if (data.longitude !== undefined) {
      updates.push('longitude = ?');
      params.push(data.longitude);
    }

    if (data.radius_km !== undefined) {
      updates.push('radius_km = ?');
      params.push(data.radius_km);
    }

    if (data.start_time) {
      updates.push('start_time = ?');
      params.push(data.start_time);
    }

    if (data.end_time !== undefined) {
      updates.push('end_time = ?');
      params.push(data.end_time);
    }

    if (data.metadata !== undefined) {
      updates.push('metadata = ?');
      params.push(data.metadata ? JSON.stringify(data.metadata) : null);
    }

    if (updates.length === 0) {
      return this.getAlertById(id);
    }

    updates.push('updated_at = NOW()');
    params.push(id);

    try {
      await db.query(
        `UPDATE disaster_alerts SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      const updatedAlert = await this.getAlertById(id);

      // If severity was upgraded, send update notifications
      if (severityUpgraded) {
        await this.sendUpdateNotification(updatedAlert, 'Severity upgraded');
      }

      return updatedAlert;
    } catch (error) {
      throw new AppError('Failed to update alert', 500);
    }
  }

  /**
   * Send update notification to users
   */
  private async sendUpdateNotification(alert: Alert, reason: string): Promise<void> {
    try {
      const users = await this.getTargetedUsers(alert);
      
      if (users.length === 0) return;

      // Get device tokens
      const userIds = users.map(u => u.id);
      const [tokens] = await db.query(
        `SELECT user_id, token FROM device_tokens 
         WHERE user_id IN (?) AND is_active = TRUE`,
        [userIds]
      );

      const allTokens: string[] = (tokens as any[]).map(t => t.token);

      if (allTokens.length > 0) {
        const updateMessage = {
          ...alert,
          title: `UPDATE: ${alert.title}`,
          description: `${reason}. ${alert.description}`
        };
        
        await this.notificationService.sendPushNotification(allTokens, updateMessage);
      }
    } catch (error) {
      // Log error but don't throw - update notifications are best-effort
      console.error('Failed to send update notification:', error);
    }
  }

  /**
   * Auto-deactivate expired alerts
   */
  async deactivateExpiredAlerts(): Promise<number> {
    try {
      const [result] = await db.query(
        `UPDATE disaster_alerts 
         SET is_active = FALSE, updated_at = NOW()
         WHERE is_active = TRUE 
         AND end_time IS NOT NULL 
         AND end_time < NOW()`
      );

      return (result as any).affectedRows;
    } catch (error) {
      throw new AppError('Failed to deactivate expired alerts', 500);
    }
  }

  /**
   * Search alerts by keyword and date range
   */
  async searchAlerts(query: string, startDate?: string, endDate?: string): Promise<Alert[]> {
    try {
      let sql = `
        SELECT * FROM disaster_alerts 
        WHERE is_active = TRUE
        AND (title LIKE ? OR description LIKE ?)
      `;
      const params: any[] = [`%${query}%`, `%${query}%`];

      if (startDate) {
        sql += ` AND created_at >= ?`;
        params.push(startDate);
      }

      if (endDate) {
        sql += ` AND created_at <= ?`;
        params.push(endDate);
      }

      sql += ` ORDER BY 
        FIELD(severity, 'critical', 'high', 'moderate', 'low'),
        created_at DESC
      `;

      const [alerts] = await db.query(sql, params);
      return this.parseAlerts(alerts as any[]);
    } catch (error) {
      throw new AppError('Failed to search alerts', 500);
    }
  }

  /**
   * Deactivate an alert (soft delete)
   */
  async deactivateAlert(id: number): Promise<void> {
    // Verify alert exists
    await this.getAlertById(id);

    try {
      await db.query(
        'UPDATE disaster_alerts SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
        [id]
      );
    } catch (error) {
      throw new AppError('Failed to deactivate alert', 500);
    }
  }

  /**
   * Get targeted users based on alert location and affected areas
   */
  async getTargetedUsers(alert: Alert): Promise<any[]> {
    try {
      let query = `
        SELECT DISTINCT u.id, u.email, u.phone, p.latitude, p.longitude
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        WHERE u.is_active = TRUE
      `;
      const params: any[] = [];

      // If alert has specific coordinates and radius, use distance calculation
      if (alert.latitude && alert.longitude && alert.radius_km) {
        query += ` AND (
          p.latitude IS NULL OR
          (6371 * acos(cos(radians(?)) * cos(radians(p.latitude)) * 
           cos(radians(p.longitude) - radians(?)) + sin(radians(?)) * 
           sin(radians(p.latitude)))) <= ?
        )`;
        params.push(alert.latitude, alert.longitude, alert.latitude, alert.radius_km);
      }
      // If alert has affected areas, match by city/province
      else if (alert.affected_areas && alert.affected_areas.length > 0) {
        const areaConditions = alert.affected_areas.map(() => 
          '(p.city = ? OR p.province = ?)'
        ).join(' OR ');
        
        query += ` AND (p.city IS NULL OR p.province IS NULL OR ${areaConditions})`;
        
        alert.affected_areas.forEach(area => {
          params.push(area, area);
        });
      }

      const [users] = await db.query(query, params);
      return users as any[];
    } catch (error) {
      throw new AppError('Failed to get targeted users', 500);
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Validation methods
   */
  private validateAlertType(type: string): void {
    const validTypes = ['typhoon', 'earthquake', 'flood', 'storm_surge', 'volcanic', 'tsunami', 'landslide'];
    if (!validTypes.includes(type)) {
      throw new AppError(
        `Invalid alert type. Must be one of: ${validTypes.join(', ')}`,
        400
      );
    }
  }

  private validateSource(source: string): void {
    const validSources = ['PAGASA', 'PHIVOLCS', 'NDRRMC', 'LGU', 'OTHER'];
    if (!validSources.includes(source)) {
      throw new AppError(
        `Invalid source. Must be one of: ${validSources.join(', ')}`,
        400
      );
    }
  }

  private validateSeverity(severity: string): void {
    const validSeverities = ['low', 'moderate', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      throw new AppError(
        `Invalid severity. Must be one of: ${validSeverities.join(', ')}`,
        400
      );
    }
  }

  private validateAffectedAreas(areas: string[]): void {
    if (!areas || areas.length === 0) {
      throw new AppError('At least one affected area is required', 400);
    }
  }

  private validateCoordinates(lat?: number, lng?: number): void {
    if (lat !== undefined && (lat < -90 || lat > 90)) {
      throw new AppError('Latitude must be between -90 and 90', 400);
    }
    if (lng !== undefined && (lng < -180 || lng > 180)) {
      throw new AppError('Longitude must be between -180 and 180', 400);
    }
  }

  private validateDateRange(startTime: string, endTime?: string): void {
    if (endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (end <= start) {
        throw new AppError('End time must be after start time', 400);
      }
    }
  }

  /**
   * Parse alert from database
   */
  private parseAlert(row: any): Alert {
    return {
      ...row,
      affected_areas: JSON.parse(row.affected_areas || '[]'),
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    };
  }

  private parseAlerts(rows: any[]): Alert[] {
    return rows.map(row => this.parseAlert(row));
  }
}
