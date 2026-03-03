/**
 * Dashboard and Reporting Service
 * 
 * Provides dashboard statistics, filtering, and report generation for SMS blasts.
 * 
 * Requirements: 16.1, 16.2, 16.4, 16.5, 11.6, 14.4
 */

import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { RecipientFilters } from './recipientFilter.service';

/**
 * Dashboard statistics interface
 */
export interface DashboardStatistics {
  totalSMSSent: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  recentActivity: RecentBlast[];
  deliverySuccessRate: {
    overall: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

/**
 * Recent blast summary interface
 */
export interface RecentBlast {
  blastId: string;
  sender: {
    id: number;
    name: string;
    email: string;
  };
  timestamp: Date;
  recipientCount: number;
  deliverySuccessRate: number;
  status: string;
  message: string;
}

/**
 * Dashboard filter options
 */
export interface DashboardFilters {
  startDate?: Date;
  endDate?: Date;
  senderId?: number;
  emergencyType?: string;
  location?: {
    province?: string;
    city?: string;
    barangay?: string;
  };
}

/**
 * Report export options
 */
export interface ReportExportOptions {
  filters: DashboardFilters;
  format: 'csv' | 'pdf';
  includeStatistics: boolean;
}

/**
 * Credit usage report interface
 */
export interface CreditUsageReport {
  period: 'day' | 'week' | 'month';
  totalCreditsUsed: number;
  breakdown: CreditUsageByUser[];
}

/**
 * Credit usage by user interface
 */
export interface CreditUsageByUser {
  userId: number;
  userName: string;
  userEmail: string;
  creditsUsed: number;
  messageCount: number;
  blastCount: number;
}

/**
 * Dashboard and Reporting Service
 */
export class DashboardReportingService {
  /**
   * Get dashboard statistics aggregation
   * Requirements: 16.1, 16.2
   * 
   * Provides:
   * - Total SMS sent (today, week, month)
   * - Recent activity (last 10 blasts)
   * - Delivery success rate calculations
   */
  async getDashboardStatistics(userId?: number, userRole?: string): Promise<DashboardStatistics> {
    const connection = await pool.getConnection();
    
    try {
      // Calculate date boundaries
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Build WHERE clause for user filtering
      const userFilter = (userId && userRole !== 'super_admin') 
        ? `AND sb.user_id = ${connection.escape(userId)}` 
        : '';

      // Requirement 16.1: Get total SMS sent for today, week, month
      const [totalSentRows] = await connection.query<RowDataPacket[]>(
        `SELECT 
          COALESCE(SUM(CASE WHEN sb.created_at >= ? THEN sb.recipient_count ELSE 0 END), 0) as today,
          COALESCE(SUM(CASE WHEN sb.created_at >= ? THEN sb.recipient_count ELSE 0 END), 0) as this_week,
          COALESCE(SUM(CASE WHEN sb.created_at >= ? THEN sb.recipient_count ELSE 0 END), 0) as this_month
         FROM sms_blasts sb
         WHERE sb.status IN ('completed', 'processing', 'queued')
         ${userFilter}`,
        [todayStart, weekStart, monthStart]
      );

      const totalSMSSent = {
        today: totalSentRows[0]?.today || 0,
        thisWeek: totalSentRows[0]?.this_week || 0,
        thisMonth: totalSentRows[0]?.this_month || 0
      };

      // Requirement 16.2: Get recent activity (last 10 blasts)
      const [recentBlastsRows] = await connection.query<RowDataPacket[]>(
        `SELECT 
          sb.id as blast_id,
          sb.user_id,
          sb.message,
          sb.recipient_count,
          sb.status,
          sb.created_at,
          CONCAT(u.first_name, ' ', u.last_name) as user_name,
          u.email as user_email
         FROM sms_blasts sb
         LEFT JOIN users u ON sb.user_id = u.id
         WHERE 1=1 ${userFilter}
         ORDER BY sb.created_at DESC
         LIMIT 10`
      );

      // Calculate delivery success rate for each recent blast
      const recentActivity: RecentBlast[] = await Promise.all(
        recentBlastsRows.map(async (blast) => {
          const [statsRows] = await connection.query<RowDataPacket[]>(
            `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
             FROM sms_jobs
             WHERE blast_id = ?`,
            [blast.blast_id]
          );

          const total = statsRows[0]?.total || 0;
          const delivered = statsRows[0]?.delivered || 0;
          const successRate = total > 0 ? (delivered / total) * 100 : 0;

          return {
            blastId: blast.blast_id,
            sender: {
              id: blast.user_id,
              name: blast.user_name || 'Unknown',
              email: blast.user_email || ''
            },
            timestamp: blast.created_at,
            recipientCount: blast.recipient_count,
            deliverySuccessRate: parseFloat(successRate.toFixed(2)),
            status: blast.status,
            message: blast.message.substring(0, 100) + (blast.message.length > 100 ? '...' : '')
          };
        })
      );

      // Requirement 16.1: Calculate delivery success rates
      const [overallStatsRows] = await connection.query<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
         FROM sms_jobs sj
         INNER JOIN sms_blasts sb ON sj.blast_id = sb.id
         WHERE 1=1 ${userFilter}`
      );

      const [todayStatsRows] = await connection.query<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
         FROM sms_jobs sj
         INNER JOIN sms_blasts sb ON sj.blast_id = sb.id
         WHERE sb.created_at >= ? ${userFilter}`,
        [todayStart]
      );

      const [weekStatsRows] = await connection.query<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
         FROM sms_jobs sj
         INNER JOIN sms_blasts sb ON sj.blast_id = sb.id
         WHERE sb.created_at >= ? ${userFilter}`,
        [weekStart]
      );

      const [monthStatsRows] = await connection.query<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
         FROM sms_jobs sj
         INNER JOIN sms_blasts sb ON sj.blast_id = sb.id
         WHERE sb.created_at >= ? ${userFilter}`,
        [monthStart]
      );

      const calculateRate = (delivered: number, total: number): number => {
        return total > 0 ? parseFloat(((delivered / total) * 100).toFixed(2)) : 0;
      };

      const deliverySuccessRate = {
        overall: calculateRate(
          overallStatsRows[0]?.delivered || 0,
          overallStatsRows[0]?.total || 0
        ),
        today: calculateRate(
          todayStatsRows[0]?.delivered || 0,
          todayStatsRows[0]?.total || 0
        ),
        thisWeek: calculateRate(
          weekStatsRows[0]?.delivered || 0,
          weekStatsRows[0]?.total || 0
        ),
        thisMonth: calculateRate(
          monthStatsRows[0]?.delivered || 0,
          monthStatsRows[0]?.total || 0
        )
      };

      return {
        totalSMSSent,
        recentActivity,
        deliverySuccessRate
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Get filtered dashboard data
   * Requirement: 16.4
   * 
   * Filters by:
   * - Date range
   * - Sender
   * - Emergency type
   * - Location (province, city, barangay)
   */
  async getFilteredBlasts(
    filters: DashboardFilters,
    userId?: number,
    userRole?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ blasts: RecentBlast[]; totalCount: number }> {
    const connection = await pool.getConnection();
    
    try {
      // Build WHERE conditions
      const conditions: string[] = [];
      const params: any[] = [];

      // User filtering
      if (userId && userRole !== 'super_admin') {
        conditions.push('sb.user_id = ?');
        params.push(userId);
      }

      // Requirement 16.4: Filter by date range
      if (filters.startDate) {
        conditions.push('sb.created_at >= ?');
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        conditions.push('sb.created_at <= ?');
        params.push(filters.endDate);
      }

      // Requirement 16.4: Filter by sender
      if (filters.senderId) {
        conditions.push('sb.user_id = ?');
        params.push(filters.senderId);
      }

      // Requirement 16.4: Filter by emergency type (stored in template category or metadata)
      if (filters.emergencyType) {
        conditions.push(`(
          st.category = ? OR
          sb.message LIKE ?
        )`);
        params.push(filters.emergencyType, `%${filters.emergencyType}%`);
      }

      // Requirement 16.4: Filter by location
      // Note: Location filtering requires joining with recipient data
      // For now, we'll filter based on message content containing location names
      if (filters.location) {
        const locationConditions: string[] = [];
        
        if (filters.location.province) {
          locationConditions.push('sb.message LIKE ?');
          params.push(`%${filters.location.province}%`);
        }
        
        if (filters.location.city) {
          locationConditions.push('sb.message LIKE ?');
          params.push(`%${filters.location.city}%`);
        }
        
        if (filters.location.barangay) {
          locationConditions.push('sb.message LIKE ?');
          params.push(`%${filters.location.barangay}%`);
        }

        if (locationConditions.length > 0) {
          conditions.push(`(${locationConditions.join(' OR ')})`);
        }
      }

      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';

      // Get total count
      const [countRows] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) as total
         FROM sms_blasts sb
         LEFT JOIN sms_templates st ON sb.template_id = st.id
         ${whereClause}`,
        params
      );

      const totalCount = countRows[0]?.total || 0;

      // Get paginated results
      const offset = (page - 1) * limit;
      const [blastsRows] = await connection.query<RowDataPacket[]>(
        `SELECT 
          sb.id as blast_id,
          sb.user_id,
          sb.message,
          sb.recipient_count,
          sb.status,
          sb.created_at,
          CONCAT(u.first_name, ' ', u.last_name) as user_name,
          u.email as user_email
         FROM sms_blasts sb
         LEFT JOIN sms_templates st ON sb.template_id = st.id
         LEFT JOIN users u ON sb.user_id = u.id
         ${whereClause}
         ORDER BY sb.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      // Calculate delivery success rate for each blast
      const blasts: RecentBlast[] = await Promise.all(
        blastsRows.map(async (blast) => {
          const [statsRows] = await connection.query<RowDataPacket[]>(
            `SELECT 
              COUNT(*) as total,
              SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered
             FROM sms_jobs
             WHERE blast_id = ?`,
            [blast.blast_id]
          );

          const total = statsRows[0]?.total || 0;
          const delivered = statsRows[0]?.delivered || 0;
          const successRate = total > 0 ? (delivered / total) * 100 : 0;

          return {
            blastId: blast.blast_id,
            sender: {
              id: blast.user_id,
              name: blast.user_name || 'Unknown',
              email: blast.user_email || ''
            },
            timestamp: blast.created_at,
            recipientCount: blast.recipient_count,
            deliverySuccessRate: parseFloat(successRate.toFixed(2)),
            status: blast.status,
            message: blast.message.substring(0, 100) + (blast.message.length > 100 ? '...' : '')
          };
        })
      );

      return {
        blasts,
        totalCount
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Generate report export with summary statistics
   * Requirement: 16.5
   * 
   * Generates PDF or CSV reports with:
   * - Filtered data based on user selections
   * - Summary statistics (total sent, delivered, failed)
   */
  async generateReport(options: ReportExportOptions): Promise<Buffer> {
    const connection = await pool.getConnection();
    
    try {
      // Get filtered blasts (no pagination for export)
      const { blasts, totalCount } = await this.getFilteredBlasts(
        options.filters,
        undefined,
        'super_admin',
        1,
        10000 // Max export limit
      );

      // Calculate summary statistics if requested
      let summaryStats = null;
      
      if (options.includeStatistics) {
        const blastIds = blasts.map(b => b.blastId);
        
        if (blastIds.length > 0) {
          const placeholders = blastIds.map(() => '?').join(',');
          const [statsRows] = await connection.query<RowDataPacket[]>(
            `SELECT 
              COUNT(*) as total_messages,
              SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
              SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
              SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
              SUM(CASE WHEN status IN ('queued', 'processing') THEN 1 ELSE 0 END) as pending
             FROM sms_jobs
             WHERE blast_id IN (${placeholders})`,
            blastIds
          );

          summaryStats = statsRows[0] || {
            total_messages: 0,
            sent: 0,
            delivered: 0,
            failed: 0,
            pending: 0
          };
        }
      }

      // Generate report based on format
      if (options.format === 'csv') {
        return this.generateCSVReport(blasts, summaryStats);
      } else {
        return this.generatePDFReport(blasts, summaryStats);
      }
    } finally {
      connection.release();
    }
  }

  /**
   * Generate CSV report
   * Requirement: 16.5
   */
  private generateCSVReport(blasts: RecentBlast[], summaryStats: any): Buffer {
    const lines: string[] = [];

    // Add summary statistics if available
    if (summaryStats) {
      lines.push('SMS Blast Report - Summary Statistics');
      lines.push('');
      lines.push(`Total Messages,${summaryStats.total_messages}`);
      lines.push(`Sent,${summaryStats.sent}`);
      lines.push(`Delivered,${summaryStats.delivered}`);
      lines.push(`Failed,${summaryStats.failed}`);
      lines.push(`Pending,${summaryStats.pending}`);
      lines.push('');
      lines.push('');
    }

    // Add header row
    lines.push('Blast ID,Sender Name,Sender Email,Timestamp,Recipient Count,Delivery Success Rate (%),Status,Message');

    // Add data rows
    blasts.forEach(blast => {
      const row = [
        blast.blastId,
        blast.sender.name,
        blast.sender.email,
        blast.timestamp.toISOString(),
        blast.recipientCount.toString(),
        blast.deliverySuccessRate.toString(),
        blast.status,
        `"${blast.message.replace(/"/g, '""')}"` // Escape quotes in message
      ];
      lines.push(row.join(','));
    });

    return Buffer.from(lines.join('\n'), 'utf-8');
  }

  /**
   * Generate PDF report
   * Requirement: 16.5
   * 
   * Note: This is a simplified implementation. In production, use a library like pdfkit or puppeteer.
   */
  private generatePDFReport(blasts: RecentBlast[], summaryStats: any): Buffer {
    // For now, return a simple text-based PDF-like format
    // In production, use a proper PDF generation library
    const lines: string[] = [];

    lines.push('SMS BLAST REPORT');
    lines.push('='.repeat(80));
    lines.push('');

    // Add summary statistics if available
    if (summaryStats) {
      lines.push('SUMMARY STATISTICS');
      lines.push('-'.repeat(80));
      lines.push(`Total Messages: ${summaryStats.total_messages}`);
      lines.push(`Sent: ${summaryStats.sent}`);
      lines.push(`Delivered: ${summaryStats.delivered}`);
      lines.push(`Failed: ${summaryStats.failed}`);
      lines.push(`Pending: ${summaryStats.pending}`);
      lines.push('');
      lines.push('');
    }

    lines.push('BLAST DETAILS');
    lines.push('-'.repeat(80));
    lines.push('');

    // Add blast details
    blasts.forEach((blast, index) => {
      lines.push(`${index + 1}. Blast ID: ${blast.blastId}`);
      lines.push(`   Sender: ${blast.sender.name} (${blast.sender.email})`);
      lines.push(`   Timestamp: ${blast.timestamp.toISOString()}`);
      lines.push(`   Recipients: ${blast.recipientCount}`);
      lines.push(`   Success Rate: ${blast.deliverySuccessRate}%`);
      lines.push(`   Status: ${blast.status}`);
      lines.push(`   Message: ${blast.message}`);
      lines.push('');
    });

    lines.push('');
    lines.push('='.repeat(80));
    lines.push(`Generated: ${new Date().toISOString()}`);

    return Buffer.from(lines.join('\n'), 'utf-8');
  }

  /**
   * Get credit usage report
   * Requirements: 11.6, 14.4
   * 
   * Calculates:
   * - Total credits used per day, week, month
   * - Breakdown by user
   */
  async getCreditUsageReport(
    period: 'day' | 'week' | 'month',
    userId?: number,
    userRole?: string
  ): Promise<CreditUsageReport> {
    const connection = await pool.getConnection();
    
    try {
      // Calculate date boundary based on period
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      // Build user filter
      const userFilter = (userId && userRole !== 'super_admin') 
        ? `AND su.user_id = ${connection.escape(userId)}` 
        : '';

      // Requirement 11.6, 14.4: Get total credits used
      const [totalRows] = await connection.query<RowDataPacket[]>(
        `SELECT COALESCE(SUM(credits_used), 0) as total_credits
         FROM sms_usage su
         WHERE su.created_at >= ? ${userFilter}`,
        [startDate]
      );

      const totalCreditsUsed = parseFloat(totalRows[0]?.total_credits || '0');

      // Requirement 14.4: Get breakdown by user
      const [breakdownRows] = await connection.query<RowDataPacket[]>(
        `SELECT 
          su.user_id,
          CONCAT(u.first_name, ' ', u.last_name) as user_name,
          u.email as user_email,
          COALESCE(SUM(su.credits_used), 0) as credits_used,
          COALESCE(SUM(su.message_count), 0) as message_count,
          COUNT(DISTINCT su.blast_id) as blast_count
         FROM sms_usage su
         LEFT JOIN users u ON su.user_id = u.id
         WHERE su.created_at >= ? ${userFilter}
         GROUP BY su.user_id, u.first_name, u.last_name, u.email
         ORDER BY credits_used DESC`,
        [startDate]
      );

      const breakdown: CreditUsageByUser[] = breakdownRows.map(row => ({
        userId: row.user_id,
        userName: row.user_name || 'Unknown',
        userEmail: row.user_email || '',
        creditsUsed: parseFloat(row.credits_used),
        messageCount: row.message_count,
        blastCount: row.blast_count
      }));

      return {
        period,
        totalCreditsUsed,
        breakdown
      };
    } finally {
      connection.release();
    }
  }
}
