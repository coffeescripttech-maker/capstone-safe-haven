import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';

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
    } = data;

    const photosJson = photos && photos.length > 0 ? JSON.stringify(photos) : null;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO incident_reports 
       (user_id, incident_type, title, description, latitude, longitude, address, severity, photos, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, incidentType, title, description, latitude, longitude, address, severity, photosJson]
    );

    return this.getIncidentById(result.insertId);
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
    } = filters;

    let query = `
      SELECT 
        ir.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.phone as user_phone
      FROM incident_reports ir
      LEFT JOIN users u ON ir.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

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
      'SELECT \n      ir.*,\n        CONCAT(u.first_name, \' \', u.last_name) as user_name,\n        u.phone as user_phone\n      FROM incident_reports ir',
      'SELECT COUNT(*) as total FROM incident_reports ir'
    );
    const [countResult] = await pool.query<RowDataPacket[]>(countQuery, params);
    const total = countResult[0]?.total || 0;

    // Add pagination
    query += ' ORDER BY ir.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const [rows] = await pool.query<IncidentReport[]>(query, params);

    // Parse photos JSON and convert to camelCase
    const incidents = rows.map(incident => ({
      id: incident.id,
      userId: incident.user_id,
      incidentType: incident.incident_type,
      title: incident.title,
      description: incident.description,
      latitude: incident.latitude || null,
      longitude: incident.longitude || null,
      address: incident.address,
      severity: incident.severity,
      status: incident.status,
      photos: incident.photos ? JSON.parse(incident.photos) : [],
      assignedTo: incident.assigned_to,
      createdAt: incident.created_at ? new Date(incident.created_at).toISOString() : null,
      updatedAt: incident.updated_at ? new Date(incident.updated_at).toISOString() : null,
      userName: incident.user_name,
      userPhone: incident.user_phone,
    }));

    return {
      data: incidents,
      total,
      page,
      limit,
    };
  }

  async getIncidentById(id: number): Promise<any> {
    const [rows] = await pool.query<IncidentReport[]>(
      `SELECT 
        ir.*,
        CONCAT(u.first_name, ' ', u.last_name) as user_name,
        u.phone as user_phone
       FROM incident_reports ir
       LEFT JOIN users u ON ir.user_id = u.id
       WHERE ir.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Incident not found');
    }

    const incident = rows[0];
    return {
      id: incident.id,
      userId: incident.user_id,
      incidentType: incident.incident_type,
      title: incident.title,
      description: incident.description,
      latitude: incident.latitude || null,
      longitude: incident.longitude || null,
      address: incident.address,
      severity: incident.severity,
      status: incident.status,
      photos: incident.photos ? JSON.parse(incident.photos) : [],
      assignedTo: incident.assigned_to,
      createdAt: incident.created_at ? new Date(incident.created_at).toISOString() : null,
      updatedAt: incident.updated_at ? new Date(incident.updated_at).toISOString() : null,
      userName: incident.user_name,
      userPhone: incident.user_phone,
    };
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
      latitude: incident.latitude || null,
      longitude: incident.longitude || null,
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
