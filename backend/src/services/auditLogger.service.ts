import db from '../config/database';
import { logger } from '../utils/logger';
import { RowDataPacket } from 'mysql2';

type Role = 
  | 'super_admin'
  | 'admin'
  | 'pnp'
  | 'bfp'
  | 'mdrrmo'
  | 'lgu_officer'
  | 'citizen';

type AuditStatus = 'success' | 'denied' | 'error';

interface AuditLog {
  id: number;
  userId: number;
  role: string;
  action: string;
  resource: string;
  resourceId: number | null;
  status: AuditStatus;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

interface LogFilters {
  userId?: number;
  role?: Role;
  action?: string;
  status?: AuditStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

interface AuditLogRow extends RowDataPacket {
  id: number;
  user_id: number;
  role: string;
  action: string;
  resource: string;
  resource_id: number | null;
  status: AuditStatus;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export class AuditLoggerService {
  /**
   * Log an access attempt (success or denied)
   */
  async logAccess(
    userId: number,
    role: Role,
    action: string,
    resource: string,
    resourceId: number | null,
    status: AuditStatus,
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      [key: string]: any; // Allow additional metadata fields
    }
  ): Promise<void> {
    // Run asynchronously without blocking the request
    setImmediate(async () => {
      try {
        await db.query(
          `INSERT INTO audit_logs 
           (user_id, role, action, resource, resource_id, status, ip_address, user_agent) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            role,
            action,
            resource,
            resourceId,
            status,
            metadata?.ipAddress || null,
            metadata?.userAgent || null
          ]
        );
      } catch (error) {
        // Log error but don't throw - audit failures should not break requests
        logger.error('Failed to write audit log:', error);
      }
    });
  }

  /**
   * Log an authentication attempt
   */
  async logAuthAttempt(
    email: string,
    success: boolean,
    ipAddress: string,
    userAgent?: string,
    userId?: number,
    role?: Role
  ): Promise<void> {
    setImmediate(async () => {
      try {
        await db.query(
          `INSERT INTO audit_logs 
           (user_id, role, action, resource, resource_id, status, ip_address, user_agent) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId || null,
            role || 'unknown',
            success ? 'login_success' : 'login_failed',
            'authentication',
            null,
            success ? 'success' : 'denied',
            ipAddress,
            userAgent || null
          ]
        );
      } catch (error) {
        logger.error('Failed to log authentication attempt:', error);
      }
    });
  }

  /**
   * Log a permission change (add or remove)
   */
  async logPermissionChange(
    adminId: number,
    adminRole: Role,
    targetRole: Role,
    resource: string,
    action: string,
    operation: 'add' | 'remove',
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    setImmediate(async () => {
      try {
        await db.query(
          `INSERT INTO audit_logs 
           (user_id, role, action, resource, resource_id, status, ip_address, user_agent) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            adminId,
            adminRole,
            `permission_${operation}`,
            `${targetRole}:${resource}:${action}`,
            null,
            'success',
            ipAddress || null,
            userAgent || null
          ]
        );
      } catch (error) {
        logger.error('Failed to log permission change:', error);
      }
    });
  }

  /**
   * Query audit logs with filtering
   */
  async queryLogs(filters: LogFilters): Promise<AuditLog[]> {
    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters.userId !== undefined) {
        conditions.push('user_id = ?');
        params.push(filters.userId);
      }

      if (filters.role) {
        conditions.push('role = ?');
        params.push(filters.role);
      }

      if (filters.action) {
        // Support comma-separated actions for filtering multiple action types
        const actions = filters.action.split(',').map(a => a.trim());
        if (actions.length === 1) {
          conditions.push('action = ?');
          params.push(filters.action);
        } else {
          const placeholders = actions.map(() => '?').join(',');
          conditions.push(`action IN (${placeholders})`);
          params.push(...actions);
        }
      }

      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }

      if (filters.startDate) {
        conditions.push('created_at >= ?');
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        conditions.push('created_at <= ?');
        params.push(filters.endDate);
      }

      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';

      const limit = filters.limit || 100;
      const offset = filters.offset || 0;

      const [rows] = await db.query<AuditLogRow[]>(
        `SELECT id, user_id, role, action, resource, resource_id, status, 
                ip_address, user_agent, created_at
         FROM audit_logs
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        role: row.role,
        action: row.action,
        resource: row.resource,
        resourceId: row.resource_id,
        status: row.status,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        createdAt: row.created_at
      }));
    } catch (error) {
      logger.error('Error querying audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalLogs: number;
    successCount: number;
    deniedCount: number;
    errorCount: number;
    byRole: Record<string, number>;
  }> {
    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters?.startDate) {
        conditions.push('created_at >= ?');
        params.push(filters.startDate);
      }

      if (filters?.endDate) {
        conditions.push('created_at <= ?');
        params.push(filters.endDate);
      }

      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';

      // Get total counts
      const [countRows] = await db.query<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success,
          SUM(CASE WHEN status = 'denied' THEN 1 ELSE 0 END) as denied,
          SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as error
         FROM audit_logs
         ${whereClause}`,
        params
      );

      // Get counts by role
      const [roleRows] = await db.query<RowDataPacket[]>(
        `SELECT role, COUNT(*) as count
         FROM audit_logs
         ${whereClause}
         GROUP BY role`,
        params
      );

      const byRole: Record<string, number> = {};
      roleRows.forEach(row => {
        byRole[row.role] = row.count;
      });

      const counts = countRows[0];

      return {
        totalLogs: counts.total || 0,
        successCount: counts.success || 0,
        deniedCount: counts.denied || 0,
        errorCount: counts.error || 0,
        byRole
      };
    } catch (error) {
      logger.error('Error getting audit statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const auditLogger = new AuditLoggerService();
