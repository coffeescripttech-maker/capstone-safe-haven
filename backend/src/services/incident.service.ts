import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { dataFilterService } from './dataFilter.service';
import notificationService from './notification.service';
import { websocketService } from './websocket.service';
import { logger } from '../utils/logger';

export interface IncidentReport extends RowDataPacket {
  id: number;
  user_id: number;
  incident_type: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  severity: string;
  status: string;
  photos: string;
  assigned_to?: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_phone?: string;
}

export interface CreateIncidentData {
  userId: number;
  incidentType: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  severity: string;
  photos?: string[];
  targetAgency?: string;
}

export interface IncidentFilters {
  type?: string;
  severity?: string;
  status?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  userRole?: string;
  userJurisdiction?: string | null;
  currentUserId?: number; // For citizen filtering
}

class IncidentService {
  async createIncident(data: CreateIncidentData): Promise<any> {
    const {
      userId,
      incidentType,
      title,
      description,
      latitude,
      longitude,
      address,
      severity,
      photos,
      targetAgency,
    } = data;

    const photosJson = photos && photos.length > 0 ? JSON.stringify(photos) : null;

    // Find agency admin user if targetAgency is specified
    let assignedTo: number | null = null;
    if (targetAgency) {
      try {
        const [agencyUsers] = await pool.query<RowDataPacket[]>(
          'SELECT id FROM users WHERE role = ? LIMIT 1',
          [targetAgency]
        );
        
        if (agencyUsers.length > 0) {
          assignedTo = agencyUsers[0].id;
          logger.info(`Incident assigned to ${targetAgency} admin (user ID: ${assignedTo})`);
        } else {
          logger.warn(`No admin found for agency: ${targetAgency}`);
        }
      } catch (error) {
        logger.error(`Error finding agency admin for ${targetAgency}:`, error);
      }
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO incident_reports 
       (user_id, incident_type, title, description, latitude, longitude, address, severity, photos, status, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [userId, incidentType, title, description, latitude, longitude, address, severity, photosJson, assignedTo]
    );

    const incident = await this.getIncidentById(result.insertId);

    // Send notification to assigned agency if available
    if (assignedTo && targetAgency) {
      try {
        await notificationService.sendIncidentNotification(
          assignedTo,
          {
            id: result.insertId,
            incidentType,
            title,
            severity,
            address: address || `${latitude}, ${longitude}`,
          },
          targetAgency
        );
        logger.info(`Notification sent to ${targetAgency} for incident ${result.insertId}`);
      } catch (error) {
        logger.error('Error sending incident notification:', error);
        // Don't fail the incident creation if notification fails
      }
    }

    // Broadcast new incident via WebSocket for real-time notifications
    try {
      websocketService.broadcastNewIncident({
        id: incident.id,
        userId: incident.user_id,
        incidentType: incident.incident_type,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status,
        latitude: incident.latitude,
        longitude: incident.longitude,
        address: incident.address,
        assignedTo: incident.assigned_to,
        targetAgency,
        createdAt: incident.created_at,
        userName: incident.user_name,
        userPhone: incident.user_phone
      });
      logger.info(`✅ WebSocket broadcast sent for incident ${result.insertId}`);
    } catch (error) {
      logger.error('Error broadcasting incident via WebSocket:', error);
      // Don't fail the incident creation if WebSocket broadcast fails
    }

    return incident;
  }

  async getIncidents(filters: IncidentFilters = {}): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const {
      type,
      severity,
      status,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      userRole,
      userJurisdiction,
      currentUserId
    } = filters;

    let query = `
      SELECT 
        ir.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.phone as user_phone,
        assigned_user.role as assigned_agency
      FROM incident_reports ir
      LEFT JOIN users u ON ir.user_id = u.id
      LEFT JOIN users assigned_user ON ir.assigned_to = assigned_user.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Apply geographic and role-based filtering using DataFilterService
    // Requirements: 4.1, 5.1, 7.2, 11.1
    if (userRole && userJurisdiction !== undefined) {
      const filterConditions = dataFilterService.applyIncidentFilter(userRole, userJurisdiction);
      if (filterConditions.whereClause) {
        query += ` AND ${filterConditions.whereClause}`;
        params.push(...filterConditions.params);
      }
    }

    // Filter by assigned agency for agency roles (PNP, BFP, MDRRMO)
    // Each agency only sees incidents assigned to them
    // Super admin and admin see all incidents
    if (userRole && ['pnp', 'bfp', 'mdrrmo'].includes(userRole)) {
      query += ' AND (assigned_user.role = ? OR ir.assigned_to IS NULL)';
      params.push(userRole);
    }

    // Citizens can only see their own incidents
    // Requirements: Privacy and data access control
    if (userRole === 'citizen' && currentUserId) {
      query += ' AND ir.user_id = ?';
      params.push(currentUserId);
    }

    if (type) {
      query += ' AND ir.incident_type = ?';
      params.push(type);
    }

    if (severity) {
      query += ' AND ir.severity = ?';
      params.push(severity);
    }

    if (status) {
      query += ' AND ir.status = ?';
      params.push(status);
    }

    if (userId) {
      query += ' AND ir.user_id = ?';
      params.push(userId);
    }

    if (startDate) {
      query += ' AND ir.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND ir.created_at <= ?';
      params.push(endDate);
    }

    // Get total count
    const countQuery = query.replace(
      'SELECT \n      ir.*,\n        CONCAT(u.first_name, \' \', u.last_name) as user_name,\n        u.phone as user_phone,\n        assigned_user.role as assigned_agency\n      FROM incident_reports ir',
      'SELECT COUNT(*) as total FROM incident_reports ir'
    );
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Add pagination
    query += ' ORDER BY ir.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const [rows] = await pool.query<IncidentReport[]>(query, params);

    // Parse photos JSON and convert to camelCase
    // Apply fire incident filtering for BFP role
    // Requirements: 5.1, 5.6
    const incidents = rows.map(incident => this.formatIncidentForRole(incident, userRole));

    return {
      data: incidents,
      total,
      page,
      limit,
    };
  }

  /**
   * Format incident based on user role
   * BFP role: full details for fire incidents, basic info for others
   * Requirements: 5.1, 5.6
   */
  private formatIncidentForRole(incident: IncidentReport, userRole?: string): any {
    const baseIncident = {
      id: incident.id,
      userId: incident.user_id,
      incidentType: incident.incident_type,
      latitude: incident.latitude ? Number(incident.latitude) : null,
      longitude: incident.longitude ? Number(incident.longitude) : null,
      status: incident.status,
      createdAt: incident.created_at ? new Date(incident.created_at).toISOString() : null,
      updatedAt: incident.updated_at ? new Date(incident.updated_at).toISOString() : null,
      // Always include reporter information
      userName: incident.user_name,
      userPhone: incident.user_phone,
    };

    // BFP role: full details for fire incidents, basic info for others
    // Requirements: 5.1, 5.6
    if (userRole === 'bfp' && incident.incident_type !== 'fire') {
      return baseIncident;
    }

    // Full details for all other roles or fire incidents for BFP
    return {
      ...baseIncident,
      title: incident.title,
      description: incident.description,
      address: incident.address,
      severity: incident.severity,
      photos: incident.photos ? JSON.parse(incident.photos) : [],
      assignedTo: incident.assigned_to,
      assignedAgency: (incident as any).assigned_agency || null,
      // Add nested user object for frontend compatibility
      user: incident.user_name ? {
        firstName: incident.user_name.split(' ')[0] || '',
        lastName: incident.user_name.split(' ').slice(1).join(' ') || '',
        phone: incident.user_phone || ''
      } : undefined
    };
  }

  async getIncidentById(id: number, userRole?: string): Promise<any> {
    const [rows] = await pool.query<IncidentReport[]>(
      `SELECT 
        ir.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.phone as user_phone,
        assigned_user.role as assigned_agency
       FROM incident_reports ir
       LEFT JOIN users u ON ir.user_id = u.id
       LEFT JOIN users assigned_user ON ir.assigned_to = assigned_user.id
       WHERE ir.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Incident not found');
    }

    const incident = rows[0];
    
    // Apply role-based formatting
    // Requirements: 5.1, 5.6
    return this.formatIncidentForRole(incident, userRole);
  }

  async getUserIncidents(userId: number): Promise<any[]> {
    const [rows] = await pool.query<IncidentReport[]>(
      `SELECT * FROM incident_reports 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    return rows.map(incident => ({
      id: incident.id,
      userId: incident.user_id,
      incidentType: incident.incident_type,
      title: incident.title,
      description: incident.description,
      latitude: incident.latitude ? Number(incident.latitude) : null,
      longitude: incident.longitude ? Number(incident.longitude) : null,
      address: incident.address,
      severity: incident.severity,
      status: incident.status,
      photos: incident.photos ? JSON.parse(incident.photos) : [],
      assignedTo: incident.assigned_to,
      createdAt: incident.created_at ? new Date(incident.created_at).toISOString() : null,
      updatedAt: incident.updated_at ? new Date(incident.updated_at).toISOString() : null,
    }));
  }

  async updateIncidentStatus(id: number, status: string, assignedTo?: number): Promise<any> {
    await pool.query(
      `UPDATE incident_reports 
       SET status = ?, assigned_to = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, assignedTo, id]
    );

    return this.getIncidentById(id);
  }

  async deleteIncident(id: number): Promise<void> {
    await pool.query('DELETE FROM incident_reports WHERE id = ?', [id]);
  }
}

export default new IncidentService();
