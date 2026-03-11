import db from '../config/database';
import { logger } from '../utils/logger';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

type Role = 
  | 'super_admin'
  | 'admin'
  | 'pnp'
  | 'bfp'
  | 'mdrrmo'
  | 'lgu_officer'
  | 'citizen';

type AuditStatus = 'success' | 'denied' | 'error';

type SMSEventType = 
  | 'blast_created'
  | 'sms_sent'
  | 'status_change'
  | 'unauthorized_access'
  | 'template_created'
  | 'template_updated'
  | 'template_deleted';

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

// SMS Blast specific interfaces
interface BlastCreatedEvent {
  blastId: string;
  userId: number;
  message: string;
  recipientCount: number;
  filters: Record<string, any>;
  estimatedCost: number;
  timestamp: Date;
}

interface SMSSentEvent {
  blastId: string;
  jobId: string;
  recipientId: number;
  phoneNumber: string;
  messageId: string;
  creditsUsed: number;
  timestamp: Date;
}

interface StatusChangeEvent {
  jobId: string;
  messageId: string;
  oldStatus: string;
  newStatus: string;
  timestamp: Date;
}

interface UnauthorizedAccessEvent {
  userId: number;
  action: string;
  resource: string;
  reason: string;
  timestamp: Date;
}

interface SMSAuditLog {
  id: string;
  eventType: SMSEventType;
  userId: number | null;
  blastId: string | null;
  jobId: string | null;
  details: Record<string, any>;
  createdAt: Date;
}

interface SMSLogFilters {
  eventType?: SMSEventType | SMSEventType[];
  userId?: number;
  blastId?: string;
  jobId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

interface SMSAuditLogRow extends RowDataPacket {
  id: string;
  event_type: SMSEventType;
  user_id: number | null;
  blast_id: string | null;
  job_id: string | null;
  details: string;
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
        // Skip audit log if userId is invalid (0 or negative)
        // This happens when authentication fails before user is identified
        if (!userId || userId <= 0) {
          logger.warn('Skipping audit log for invalid user_id:', userId);
          return;
        }

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

  // ==================== SMS Blast Audit Logging Methods ====================

  /**
   * Log SMS blast creation
   * Requirements: 10.1
   */
  async logBlastCreated(event: BlastCreatedEvent): Promise<void> {
    setImmediate(async () => {
      try {
        await db.query(
          `INSERT INTO sms_audit_logs 
           (id, event_type, user_id, blast_id, details, created_at) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            'blast_created',
            event.userId,
            event.blastId,
            JSON.stringify({
              message: event.message,
              recipientCount: event.recipientCount,
              filters: event.filters,
              estimatedCost: event.estimatedCost
            }),
            event.timestamp
          ]
        );
      } catch (error) {
        logger.error('Failed to log blast creation:', error);
      }
    });
  }

  /**
   * Log SMS sent via iProg API
   * Requirements: 10.2
   */
  async logSMSSent(event: SMSSentEvent): Promise<void> {
    setImmediate(async () => {
      try {
        await db.query(
          `INSERT INTO sms_audit_logs 
           (id, event_type, user_id, blast_id, job_id, details, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            'sms_sent',
            event.recipientId,
            event.blastId,
            event.jobId,
            JSON.stringify({
              phoneNumber: event.phoneNumber,
              messageId: event.messageId,
              creditsUsed: event.creditsUsed
            }),
            event.timestamp
          ]
        );
      } catch (error) {
        logger.error('Failed to log SMS sent:', error);
      }
    });
  }

  /**
   * Log delivery status change
   * Requirements: 10.3
   */
  async logDeliveryStatusChange(event: StatusChangeEvent): Promise<void> {
    setImmediate(async () => {
      try {
        await db.query(
          `INSERT INTO sms_audit_logs 
           (id, event_type, job_id, details, created_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            'status_change',
            event.jobId,
            JSON.stringify({
              messageId: event.messageId,
              oldStatus: event.oldStatus,
              newStatus: event.newStatus
            }),
            event.timestamp
          ]
        );
      } catch (error) {
        logger.error('Failed to log status change:', error);
      }
    });
  }

  /**
   * Log unauthorized access attempt for SMS blast features
   * Requirements: 10.6
   */
  async logUnauthorizedAccess(event: UnauthorizedAccessEvent): Promise<void> {
    setImmediate(async () => {
      try {
        await db.query(
          `INSERT INTO sms_audit_logs 
           (id, event_type, user_id, details, created_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            'unauthorized_access',
            event.userId,
            JSON.stringify({
              action: event.action,
              resource: event.resource,
              reason: event.reason
            }),
            event.timestamp
          ]
        );
      } catch (error) {
        logger.error('Failed to log unauthorized access:', error);
      }
    });
  }

  /**
   * Log SMS template creation
   * Requirements: 9.5
   */
  async logTemplateCreated(event: {
    templateId: string;
    userId: number;
    name: string;
    category: string;
    language: string;
    timestamp: Date;
  }): Promise<void> {
    setImmediate(async () => {
      try {
        await db.query(
          `INSERT INTO sms_audit_logs 
           (id, event_type, user_id, details, created_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            'template_created',
            event.userId,
            JSON.stringify({
              templateId: event.templateId,
              name: event.name,
              category: event.category,
              language: event.language
            }),
            event.timestamp
          ]
        );
      } catch (error) {
        logger.error('Failed to log template creation:', error);
      }
    });
  }

  /**
   * Query SMS audit logs with filtering
   * Requirements: 10.4
   */
  async querySMSLogs(filters: SMSLogFilters): Promise<SMSAuditLog[]> {
    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (filters.eventType !== undefined) {
        if (Array.isArray(filters.eventType)) {
          const placeholders = filters.eventType.map(() => '?').join(',');
          conditions.push(`event_type IN (${placeholders})`);
          params.push(...filters.eventType);
        } else {
          conditions.push('event_type = ?');
          params.push(filters.eventType);
        }
      }

      if (filters.userId !== undefined) {
        conditions.push('user_id = ?');
        params.push(filters.userId);
      }

      if (filters.blastId) {
        conditions.push('blast_id = ?');
        params.push(filters.blastId);
      }

      if (filters.jobId) {
        conditions.push('job_id = ?');
        params.push(filters.jobId);
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

      const [rows] = await db.query<SMSAuditLogRow[]>(
        `SELECT id, event_type, user_id, blast_id, job_id, details, created_at
         FROM sms_audit_logs
         ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return rows.map(row => ({
        id: row.id,
        eventType: row.event_type,
        userId: row.user_id,
        blastId: row.blast_id,
        jobId: row.job_id,
        details: JSON.parse(row.details),
        createdAt: row.created_at
      }));
    } catch (error) {
      logger.error('Error querying SMS audit logs:', error);
      throw error;
    }
  }

  /**
   * Export SMS audit logs to CSV format
   * Requirements: 10.5
   */
  async exportSMSLogs(
    filters: SMSLogFilters,
    format: 'csv' | 'pdf'
  ): Promise<Buffer> {
    try {
      const logs = await this.querySMSLogs({ ...filters, limit: 10000 });

      if (format === 'csv') {
        return this.generateCSV(logs);
      } else {
        return this.generatePDF(logs);
      }
    } catch (error) {
      logger.error('Error exporting SMS audit logs:', error);
      throw error;
    }
  }

  /**
   * Generate CSV from SMS audit logs
   */
  private generateCSV(logs: SMSAuditLog[]): Buffer {
    const headers = [
      'ID',
      'Event Type',
      'User ID',
      'Blast ID',
      'Job ID',
      'Details',
      'Created At'
    ];

    const rows = logs.map(log => [
      log.id,
      log.eventType,
      log.userId?.toString() || '',
      log.blastId || '',
      log.jobId || '',
      JSON.stringify(log.details),
      log.createdAt.toISOString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    return Buffer.from(csvContent, 'utf-8');
  }

  /**
   * Generate PDF from SMS audit logs
   * Note: This is a placeholder. In production, use a library like pdfkit or puppeteer
   */
  private generatePDF(logs: SMSAuditLog[]): Buffer {
    // For now, return a simple text-based PDF placeholder
    // In production, implement proper PDF generation with pdfkit or similar
    const content = `SMS Audit Logs Report
Generated: ${new Date().toISOString()}
Total Records: ${logs.length}

${logs.map(log => `
ID: ${log.id}
Event Type: ${log.eventType}
User ID: ${log.userId || 'N/A'}
Blast ID: ${log.blastId || 'N/A'}
Job ID: ${log.jobId || 'N/A'}
Details: ${JSON.stringify(log.details, null, 2)}
Created At: ${log.createdAt.toISOString()}
${'='.repeat(80)}
`).join('\n')}
`;

    return Buffer.from(content, 'utf-8');
  }
}

// Export singleton instance
export const auditLogger = new AuditLoggerService();
