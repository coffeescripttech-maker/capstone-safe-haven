// Admin Service - Business logic for admin operations

import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats() {
    const connection = await pool.getConnection();
    
    try {
      // Get total and active alerts
      const [alertStats] = await connection.query<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
        FROM disaster_alerts
      `);

      // Get incidents by status
      const [incidentStats] = await connection.query<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
        FROM incident_reports
      `);

      // Get evacuation centers
      const [centerStats] = await connection.query<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
        FROM evacuation_centers
      `);

      // Get active SOS alerts (last 24 hours)
      const [sosStats] = await connection.query<RowDataPacket[]>(`
        SELECT COUNT(*) as active
        FROM sos_alerts
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `);

      // Get user statistics
      const [userStats] = await connection.query<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
          SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as users
        FROM users
      `);

      // Get today's activity
      const [todayActivity] = await connection.query<RowDataPacket[]>(`
        SELECT 
          (SELECT COUNT(*) FROM disaster_alerts WHERE DATE(created_at) = CURDATE()) as alerts_today,
          (SELECT COUNT(*) FROM incident_reports WHERE DATE(created_at) = CURDATE()) as incidents_today,
          (SELECT COUNT(*) FROM sos_alerts WHERE DATE(created_at) = CURDATE()) as sos_today,
          (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as users_today
      `);

      return {
        alerts: {
          total: alertStats[0].total || 0,
          active: alertStats[0].active || 0
        },
        incidents: {
          total: incidentStats[0].total || 0,
          pending: incidentStats[0].pending || 0,
          in_progress: incidentStats[0].in_progress || 0,
          resolved: incidentStats[0].resolved || 0
        },
        centers: {
          total: centerStats[0].total || 0,
          active: centerStats[0].active || 0
        },
        sos: {
          active: sosStats[0].active || 0
        },
        users: {
          total: userStats[0].total || 0,
          admins: userStats[0].admins || 0,
          users: userStats[0].users || 0
        },
        today: {
          alerts: todayActivity[0].alerts_today || 0,
          incidents: todayActivity[0].incidents_today || 0,
          sos: todayActivity[0].sos_today || 0,
          users: todayActivity[0].users_today || 0
        }
      };
    } finally {
      connection.release();
    }
  },

  // Get analytics data for charts
  async getAnalytics(days: number = 30) {
    const connection = await pool.getConnection();
    
    try {
      // Alerts over time
      const [alertsOverTime] = await connection.query<RowDataPacket[]>(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM disaster_alerts
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [days]);

      // Incidents by type
      const [incidentsByType] = await connection.query<RowDataPacket[]>(`
        SELECT 
          incident_type as type,
          COUNT(*) as count
        FROM incident_reports
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY incident_type
      `, [days]);

      // Alerts by severity
      const [alertsBySeverity] = await connection.query<RowDataPacket[]>(`
        SELECT 
          severity,
          COUNT(*) as count
        FROM disaster_alerts
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY severity
      `, [days]);

      // SOS alerts by location (top 10 cities)
      const [sosByLocation] = await connection.query<RowDataPacket[]>(`
        SELECT 
          COALESCE(u.city, 'Unknown') as location,
          COUNT(*) as count
        FROM sos_alerts s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY u.city
        ORDER BY count DESC
        LIMIT 10
      `, [days]);

      // User registrations over time
      const [userRegistrations] = await connection.query<RowDataPacket[]>(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `, [days]);

      return {
        alertsOverTime,
        incidentsByType,
        alertsBySeverity,
        sosByLocation,
        userRegistrations
      };
    } finally {
      connection.release();
    }
  },

  // Get recent activity
  async getRecentActivity(limit: number = 20, offset: number = 0) {
    const connection = await pool.getConnection();
    
    try {
      const [activities] = await connection.query<RowDataPacket[]>(`
        SELECT * FROM (
          SELECT 
            'alert' as type,
            id,
            title as description,
            created_at,
            NULL as user_name
          FROM disaster_alerts
          
          UNION ALL
          
          SELECT 
            'incident' as type,
            i.id,
            i.title as description,
            i.created_at,
            CONCAT(u.first_name, ' ', u.last_name) as user_name
          FROM incident_reports i
          LEFT JOIN users u ON i.user_id = u.id
          
          UNION ALL
          
          SELECT 
            'sos' as type,
            s.id,
            'SOS Alert' as description,
            s.created_at,
            CONCAT(u.first_name, ' ', u.last_name) as user_name
          FROM sos_alerts s
          LEFT JOIN users u ON s.user_id = u.id
          
          UNION ALL
          
          SELECT 
            'user' as type,
            id,
            CONCAT('New user: ', first_name, ' ', last_name) as description,
            created_at,
            NULL as user_name
          FROM users
        ) as activities
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      return activities;
    } finally {
      connection.release();
    }
  },

  // Get system health metrics
  async getSystemHealth() {
    const connection = await pool.getConnection();
    
    try {
      // Database connection status
      const dbStatus = connection ? 'healthy' : 'unhealthy';

      // Get database size
      const [dbSize] = await connection.query<RowDataPacket[]>(`
        SELECT 
          SUM(data_length + index_length) / 1024 / 1024 AS size_mb
        FROM information_schema.TABLES
        WHERE table_schema = DATABASE()
      `);

      // Get table counts
      const [tableCounts] = await connection.query<RowDataPacket[]>(`
        SELECT 
          (SELECT COUNT(*) FROM users) as users,
          (SELECT COUNT(*) FROM disaster_alerts) as alerts,
          (SELECT COUNT(*) FROM incident_reports) as incidents,
          (SELECT COUNT(*) FROM evacuation_centers) as centers,
          (SELECT COUNT(*) FROM sos_alerts) as sos_alerts
      `);

      // Get recent errors (if you have an error log table)
      // For now, we'll return 0
      const errorCount = 0;

      return {
        database: {
          status: dbStatus,
          size_mb: Math.round(dbSize[0].size_mb || 0),
          tables: tableCounts[0]
        },
        api: {
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage()
        },
        errors: {
          last_24h: errorCount
        }
      };
    } finally {
      connection.release();
    }
  }
};
