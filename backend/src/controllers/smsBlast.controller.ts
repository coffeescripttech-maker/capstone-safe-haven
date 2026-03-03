/**
 * SMS Blast Controller
 * 
 * Handles HTTP requests for SMS blast operations including:
 * - Creating and sending SMS blasts
 * - Retrieving blast status and history
 * - Managing SMS credits
 * 
 * Requirements: 1.1, 2.1, 2.2, 7.1, 7.2, 8.1, 8.2, 8.3, 8.5, 8.6, 14.1
 */

import { Response, NextFunction } from 'express';
import { SMSAuthRequest } from '../middleware/smsAuth';
import { AppError } from '../middleware/errorHandler';
import { RecipientFilter, RecipientFilters } from '../services/recipientFilter.service';
import { MessageComposer } from '../services/messageComposer.service';
import { CostEstimator } from '../services/costEstimator.service';
import { SMSQueue, SMSJob, Priority } from '../services/smsQueue.service';
import { auditLogger } from '../services/auditLogger.service';
import { IProgAPIClient } from '../services/iProgAPIClient.service';
import { TemplateManager, TemplateInput } from '../services/templateManager.service';
import { ContactGroupManager, ContactGroupInput } from '../services/contactGroupManager.service';
import { DashboardReportingService, DashboardFilters } from '../services/dashboardReporting.service';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

const recipientFilter = new RecipientFilter();
const messageComposer = new MessageComposer();
const costEstimator = new CostEstimator();
const smsQueue = new SMSQueue();
const iProgClient = new IProgAPIClient();
const templateManager = new TemplateManager();
const contactGroupManager = new ContactGroupManager();
const dashboardService = new DashboardReportingService();

/**
 * Request body interface for creating SMS blast
 */
interface CreateSMSBlastRequest {
  message?: string;
  templateId?: string;
  templateVariables?: Record<string, string>;
  recipientFilters: RecipientFilters;
  scheduledTime?: string;
  language: 'en' | 'fil';
  priority?: Priority;
}

export class SMSBlastController {
  /**
   * Create and send SMS blast
   * Requirements: 1.1, 2.1, 2.2, 7.1, 7.2, 8.1, 8.2, 8.3, 8.5, 8.6, 14.1
   * 
   * POST /api/sms-blast
   */
  async createSMSBlast(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Validate request body
      const {
        message,
        templateId,
        templateVariables,
        recipientFilters: filters,
        scheduledTime,
        language,
        priority = 'normal'
      } = req.body as CreateSMSBlastRequest;

      // Requirement 1.1: Validate message or template is provided
      if (!message && !templateId) {
        throw new AppError('Either message or templateId must be provided', 400);
      }

      if (!filters) {
        throw new AppError('Recipient filters are required', 400);
      }

      if (!language || !['en', 'fil'].includes(language)) {
        throw new AppError('Language must be either "en" or "fil"', 400);
      }

      // Validate scheduled time if provided
      let scheduledDate: Date | undefined;
      if (scheduledTime) {
        scheduledDate = new Date(scheduledTime);
        if (isNaN(scheduledDate.getTime())) {
          throw new AppError('Invalid scheduled time format', 400);
        }
        if (scheduledDate <= new Date()) {
          throw new AppError('Scheduled time must be in the future', 400);
        }
      }

      // Requirement 2.1, 2.2: Validate recipient filters and count recipients
      const user = req.user!;
      const recipients = await recipientFilter.getRecipients(filters, user);

      // Requirement 2.5: Validate that at least one recipient matches
      if (recipients.length === 0) {
        throw new AppError('No recipients match the specified filters', 400);
      }

      // Compose message
      let composedMessage;
      if (templateId) {
        // Requirement 1.3: Compose from template
        composedMessage = await messageComposer.composeFromTemplate(
          templateId,
          templateVariables || {},
          language
        );
      } else {
        // Compose from direct message
        composedMessage = messageComposer.composeFromText(message!, language);
      }

      // Requirement 1.2, 1.6: Calculate cost estimate
      const costEstimate = await costEstimator.estimateBulkBlast(
        composedMessage.content,
        recipients.length
      );

      // Requirement 8.5: Check if cost exceeds available credits
      const balance = await iProgClient.getBalance();
      if (costEstimate.totalCredits > balance) {
        throw new AppError(
          `Insufficient credits. Required: ${costEstimate.totalCredits}, Available: ${balance}`,
          402
        );
      }

      // Requirement 14.1: Check spending limits
      if (!costEstimate.withinLimit) {
        const limitCheck = await costEstimator.checkSpendingLimit(
          costEstimate.totalCredits,
          user.id.toString()
        );
        
        // Only Superadmin can override spending limits
        if (user.role !== 'super_admin') {
          throw new AppError(
            `Daily spending limit would be exceeded. Limit: ${limitCheck.dailyLimit}, ` +
            `Current spend: ${limitCheck.currentDailySpend}, ` +
            `Remaining: ${limitCheck.remainingBudget}`,
            403
          );
        }
      }

      // Requirement 8.6: Check rate limits (5000 SMS per hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const [rateLimitRows] = await connection.query<any[]>(
        `SELECT COALESCE(SUM(recipient_count), 0) as total_sent
         FROM sms_blasts
         WHERE user_id = ? AND created_at >= ?`,
        [user.id, oneHourAgo]
      );
      
      const recentSentCount = rateLimitRows[0]?.total_sent || 0;
      const rateLimit = parseInt(process.env.SMS_RATE_LIMIT_PER_HOUR || '5000', 10);
      
      if (recentSentCount + recipients.length > rateLimit) {
        throw new AppError(
          `Rate limit exceeded. You can send ${rateLimit} SMS per hour. ` +
          `Already sent: ${recentSentCount}, Attempting: ${recipients.length}`,
          429
        );
      }

      // Requirement 8.3: Create confirmation record (blast record)
      const blastId = uuidv4();
      const status = scheduledDate ? 'scheduled' : 'queued';
      
      await connection.query(
        `INSERT INTO sms_blasts (
          id, user_id, message, template_id, language,
          recipient_count, estimated_cost, status, scheduled_time, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          blastId,
          user.id,
          composedMessage.content,
          templateId || null,
          language,
          recipients.length,
          costEstimate.totalCredits,
          status,
          scheduledDate || null
        ]
      );

      // Requirement 8.1: Create SMS blast record and enqueue jobs
      const jobs: SMSJob[] = recipients.map(recipient => ({
        blastId,
        recipientId: recipient.userId.toString(),
        phoneNumber: recipient.phoneNumber,
        message: composedMessage.content,
        priority,
        metadata: {
          userId: user.id.toString(),
          templateId: templateId || undefined,
          emergencyType: filters.provinces ? 'location-based' : 'custom'
        }
      }));

      // Requirement 7.1, 7.2: Enqueue jobs for immediate or scheduled delivery
      if (scheduledDate) {
        // Schedule for future delivery
        for (const job of jobs) {
          await smsQueue.schedule(job, scheduledDate);
        }
      } else {
        // Requirement 7.2: Immediate delivery (within 1 minute)
        await smsQueue.enqueueBulk(jobs);
      }

      // Log blast creation to audit logs
      await auditLogger.logBlastCreated({
        blastId,
        userId: user.id,
        message: composedMessage.content,
        recipientCount: recipients.length,
        filters,
        estimatedCost: costEstimate.totalCredits,
        timestamp: new Date()
      });

      // Record SMS usage
      const usageId = uuidv4();
      await connection.query(
        `INSERT INTO sms_usage (id, user_id, blast_id, credits_used, message_count, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [usageId, user.id, blastId, costEstimate.totalCredits, recipients.length]
      );

      await connection.commit();

      // Requirement 8.2: Return blast ID, recipient count, estimated cost
      res.status(201).json({
        status: 'success',
        data: {
          blastId,
          recipientCount: recipients.length,
          estimatedCost: costEstimate.totalCredits,
          creditsPerMessage: costEstimate.creditsPerMessage,
          status: scheduledDate ? 'scheduled' : 'queued',
          scheduledTime: scheduledDate?.toISOString(),
          message: {
            content: composedMessage.content,
            characterCount: composedMessage.characterCount,
            smsPartCount: composedMessage.smsPartCount,
            encoding: composedMessage.encoding,
            language: composedMessage.language
          }
        }
      });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }

  /**
   * Get SMS blast status with delivery statistics
   * Requirement: 12.5
   * 
   * GET /api/sms-blast/:blastId
   */
  async getSMSBlastStatus(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { blastId } = req.params;
      const user = req.user!;

      // Get blast details
      const [blastRows] = await pool.query<any[]>(
        `SELECT id, user_id, message, template_id, language, recipient_count,
                estimated_cost, actual_cost, status, scheduled_time, created_at, completed_at
         FROM sms_blasts
         WHERE id = ?`,
        [blastId]
      );

      if (blastRows.length === 0) {
        throw new AppError('SMS blast not found', 404);
      }

      const blast = blastRows[0];

      // Check authorization - users can only view their own blasts unless they're superadmin
      if (user.role !== 'super_admin' && blast.user_id !== user.id) {
        throw new AppError('Unauthorized to view this SMS blast', 403);
      }

      // Get delivery statistics
      const [statsRows] = await pool.query<any[]>(
        `SELECT 
          status,
          COUNT(*) as count
         FROM sms_jobs
         WHERE blast_id = ?
         GROUP BY status`,
        [blastId]
      );

      // Initialize counts
      const stats = {
        queued: 0,
        processing: 0,
        sent: 0,
        delivered: 0,
        failed: 0
      };

      // Populate counts from query results
      statsRows.forEach((row: any) => {
        if (row.status in stats) {
          stats[row.status as keyof typeof stats] = row.count;
        }
      });

      // Calculate pending count (queued + processing)
      const pendingCount = stats.queued + stats.processing;

      // Requirement 12.5: Return blast status with delivery statistics
      res.status(200).json({
        status: 'success',
        data: {
          blastId: blast.id,
          userId: blast.user_id,
          message: blast.message,
          templateId: blast.template_id,
          language: blast.language,
          recipientCount: blast.recipient_count,
          estimatedCost: parseFloat(blast.estimated_cost),
          actualCost: blast.actual_cost ? parseFloat(blast.actual_cost) : null,
          status: blast.status,
          scheduledTime: blast.scheduled_time,
          createdAt: blast.created_at,
          completedAt: blast.completed_at,
          deliveryStatistics: {
            sentCount: stats.sent,
            deliveredCount: stats.delivered,
            failedCount: stats.failed,
            pendingCount: pendingCount,
            queuedCount: stats.queued,
            processingCount: stats.processing
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get SMS credit balance from iProg API with caching
   * Requirements: 4.6, 11.1
   * 
   * GET /api/sms-blast/credits/balance
   */
  async getCreditBalance(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Requirement 4.6: Fetch balance from iProg API with caching (5 minutes)
      const balance = await iProgClient.getBalance();

      // Get last updated timestamp from cache or database
      const [creditRows] = await pool.query<any[]>(
        `SELECT last_checked FROM sms_credits ORDER BY last_checked DESC LIMIT 1`
      );

      const lastUpdated = creditRows.length > 0 
        ? creditRows[0].last_checked 
        : new Date();

      // Requirement 11.1: Display current SMS credit balance
      res.status(200).json({
        status: 'success',
        data: {
          balance,
          lastUpdated,
          // Add warning flags based on balance thresholds
          warnings: {
            low: balance < 1000,
            critical: balance < 500,
            empty: balance === 0
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get SMS blast history with filtering and pagination
   * Requirements: 16.2, 16.4
   * 
   * GET /api/sms-blast/history
   */
  async getSMSBlastHistory(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;
      
      // Parse query parameters
      const {
        startDate,
        endDate,
        userId,
        status,
        page = '1',
        limit = '10'
      } = req.query;

      // Validate and parse pagination
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build WHERE clause based on filters
      const conditions: string[] = [];
      const params: any[] = [];

      // Requirement 16.4: Filter by date range
      if (startDate) {
        conditions.push('created_at >= ?');
        params.push(new Date(startDate as string));
      }

      if (endDate) {
        conditions.push('created_at <= ?');
        params.push(new Date(endDate as string));
      }

      // Requirement 16.4: Filter by user (only Superadmin can view all users)
      if (user.role === 'super_admin') {
        if (userId) {
          conditions.push('user_id = ?');
          params.push(userId);
        }
      } else {
        // Non-superadmin can only view their own blasts
        conditions.push('user_id = ?');
        params.push(user.id);
      }

      // Requirement 16.4: Filter by status
      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }

      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';

      // Get total count for pagination
      const [countRows] = await pool.query<any[]>(
        `SELECT COUNT(*) as total FROM sms_blasts ${whereClause}`,
        params
      );
      const totalCount = countRows[0].total;

      // Get paginated results
      const [blastRows] = await pool.query<any[]>(
        `SELECT 
          sb.id, sb.user_id, sb.message, sb.template_id, sb.language,
          sb.recipient_count, sb.estimated_cost, sb.actual_cost,
          sb.status, sb.scheduled_time, sb.created_at, sb.completed_at,
          u.name as user_name, u.email as user_email
         FROM sms_blasts sb
         LEFT JOIN users u ON sb.user_id = u.id
         ${whereClause}
         ORDER BY sb.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      );

      // Get delivery statistics for each blast
      const blastsWithStats = await Promise.all(
        blastRows.map(async (blast: any) => {
          const [statsRows] = await pool.query<any[]>(
            `SELECT 
              status,
              COUNT(*) as count
             FROM sms_jobs
             WHERE blast_id = ?
             GROUP BY status`,
            [blast.id]
          );

          const stats = {
            sent: 0,
            delivered: 0,
            failed: 0,
            pending: 0
          };

          statsRows.forEach((row: any) => {
            if (row.status === 'sent') stats.sent = row.count;
            if (row.status === 'delivered') stats.delivered = row.count;
            if (row.status === 'failed') stats.failed = row.count;
            if (row.status === 'queued' || row.status === 'processing') {
              stats.pending += row.count;
            }
          });

          // Calculate delivery success rate
          const totalProcessed = stats.sent + stats.delivered + stats.failed;
          const successRate = totalProcessed > 0 
            ? ((stats.delivered / totalProcessed) * 100).toFixed(2)
            : '0.00';

          return {
            blastId: blast.id,
            userId: blast.user_id,
            userName: blast.user_name,
            userEmail: blast.user_email,
            message: blast.message.substring(0, 100) + (blast.message.length > 100 ? '...' : ''),
            templateId: blast.template_id,
            language: blast.language,
            recipientCount: blast.recipient_count,
            estimatedCost: parseFloat(blast.estimated_cost),
            actualCost: blast.actual_cost ? parseFloat(blast.actual_cost) : null,
            status: blast.status,
            scheduledTime: blast.scheduled_time,
            createdAt: blast.created_at,
            completedAt: blast.completed_at,
            deliveryStatistics: stats,
            successRate: parseFloat(successRate)
          };
        })
      );

      // Requirement 16.2: Return paginated results with recent activity
      res.status(200).json({
        status: 'success',
        data: {
          blasts: blastsWithStats,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages: Math.ceil(totalCount / limitNum),
            hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
            hasPreviousPage: pageNum > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new SMS template
   * Requirements: 6.2, 9.5, 18.1
   * 
   * POST /api/sms-blast/templates
   */
  async createTemplate(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;

      // Requirement 9.5: Only Superadmin can create templates
      if (user.role !== 'super_admin') {
        throw new AppError('Only Superadmin can create SMS templates', 403);
      }

      // Validate request body
      const { name, category, content, language } = req.body as TemplateInput;

      if (!name || !category || !content || !language) {
        throw new AppError('Name, category, content, and language are required', 400);
      }

      // Requirement 18.1: Validate language
      if (!['en', 'fil'].includes(language)) {
        throw new AppError('Language must be either "en" or "fil"', 400);
      }

      // Validate category
      const validCategories = ['typhoon', 'earthquake', 'flood', 'evacuation', 'all-clear', 'custom'];
      if (!validCategories.includes(category)) {
        throw new AppError(
          `Category must be one of: ${validCategories.join(', ')}`,
          400
        );
      }

      // Validate content is not empty
      if (content.trim().length === 0) {
        throw new AppError('Template content cannot be empty', 400);
      }

      // Requirement 6.2: Create template with validation
      const templateId = await templateManager.createTemplate(
        { name, category, content, language },
        user.id
      );

      // Parse variables from template
      const variables = templateManager.parseVariables(content);

      // Log template creation to audit logs
      await auditLogger.logTemplateCreated({
        templateId,
        userId: user.id,
        name,
        category,
        language,
        timestamp: new Date()
      });

      res.status(201).json({
        status: 'success',
        data: {
          templateId,
          name,
          category,
          content,
          variables,
          language
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all SMS templates with filtering
   * Requirements: 6.1, 18.4
   * 
   * GET /api/sms-blast/templates
   */
  async listTemplates(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Parse query parameters for filtering
      const { category, language } = req.query;

      // Build filters
      const filters: any = {};

      // Requirement 18.4: Filter by category
      if (category && typeof category === 'string') {
        const validCategories = ['typhoon', 'earthquake', 'flood', 'evacuation', 'all-clear', 'custom'];
        if (validCategories.includes(category)) {
          filters.category = category;
        }
      }

      // Requirement 18.4: Filter by language
      if (language && typeof language === 'string') {
        if (['en', 'fil'].includes(language)) {
          filters.language = language;
        }
      }

      // Requirement 6.1: List all templates with filtering
      const templates = await templateManager.listTemplates(filters);

      res.status(200).json({
        status: 'success',
        data: {
          templates: templates.map(template => ({
            id: template.id,
            name: template.name,
            category: template.category,
            content: template.content,
            variables: template.variables,
            language: template.language,
            isDefault: template.isDefault,
            createdBy: template.createdBy,
            createdAt: template.createdAt,
            updatedAt: template.updatedAt
          })),
          count: templates.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create contact group with recipient filters
   * Requirements: 17.1, 17.2
   * 
   * POST /api/sms-blast/contact-groups
   */
  async createContactGroup(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;

      // Validate request body
      const { name, recipientFilters } = req.body as ContactGroupInput;

      if (!name || !recipientFilters) {
        throw new AppError('Name and recipient filters are required', 400);
      }

      // Requirement 17.1, 17.2: Create contact group with jurisdiction restrictions
      const result = await contactGroupManager.createGroup(
        { name, recipientFilters },
        user
      );

      res.status(201).json({
        status: 'success',
        data: {
          groupId: result.groupId,
          name,
          memberCount: result.memberCount,
          recipientFilters
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export audit logs as CSV or PDF
   * Requirement: 10.5
   * 
   * GET /api/sms-blast/audit-logs/export
   */
  async exportAuditLogs(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;

      // Only Superadmin can export audit logs
      if (user.role !== 'super_admin') {
        throw new AppError('Only Superadmin can export audit logs', 403);
      }

      // Parse query parameters
      const {
        startDate,
        endDate,
        eventType,
        userId,
        blastId,
        format = 'csv'
      } = req.query;

      // Validate format
      if (format !== 'csv' && format !== 'pdf') {
        throw new AppError('Format must be either "csv" or "pdf"', 400);
      }

      // Validate date range
      if (!startDate || !endDate) {
        throw new AppError('Start date and end date are required', 400);
      }

      // Build filters
      const filters: any = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        limit: 10000 // Max export limit
      };

      if (eventType) {
        // Support multiple event types separated by comma
        const types = (eventType as string).split(',').map(t => t.trim());
        filters.eventType = types.length === 1 ? types[0] : types;
      }

      if (userId) {
        filters.userId = parseInt(userId as string, 10);
      }

      if (blastId) {
        filters.blastId = blastId as string;
      }

      // Requirement 10.5: Export audit logs with date range and filter parameters
      const exportBuffer = await auditLogger.exportSMSLogs(filters, format as 'csv' | 'pdf');

      // Set appropriate headers for file download
      const filename = `sms-audit-logs-${Date.now()}.${format}`;
      const contentType = format === 'csv' 
        ? 'text/csv' 
        : 'application/pdf';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', exportBuffer.length);

      res.send(exportBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get dashboard statistics
   * Requirements: 16.1, 16.2
   * 
   * GET /api/sms-blast/dashboard/statistics
   */
  async getDashboardStatistics(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;

      // Get dashboard statistics (filtered by user if not superadmin)
      const statistics = await dashboardService.getDashboardStatistics(
        user.id,
        user.role
      );

      res.status(200).json({
        status: 'success',
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get filtered dashboard data
   * Requirement: 16.4
   * 
   * GET /api/sms-blast/dashboard/filtered
   */
  async getFilteredDashboard(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;

      // Parse query parameters
      const {
        startDate,
        endDate,
        senderId,
        emergencyType,
        province,
        city,
        barangay,
        page = '1',
        limit = '20'
      } = req.query;

      // Build filters
      const filters: DashboardFilters = {};

      // Requirement 16.4: Filter by date range
      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }

      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }

      // Requirement 16.4: Filter by sender
      if (senderId) {
        filters.senderId = parseInt(senderId as string, 10);
      }

      // Requirement 16.4: Filter by emergency type
      if (emergencyType) {
        filters.emergencyType = emergencyType as string;
      }

      // Requirement 16.4: Filter by location
      if (province || city || barangay) {
        filters.location = {};
        
        if (province) {
          filters.location.province = province as string;
        }
        
        if (city) {
          filters.location.city = city as string;
        }
        
        if (barangay) {
          filters.location.barangay = barangay as string;
        }
      }

      // Parse pagination
      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));

      // Get filtered blasts
      const result = await dashboardService.getFilteredBlasts(
        filters,
        user.id,
        user.role,
        pageNum,
        limitNum
      );

      res.status(200).json({
        status: 'success',
        data: {
          blasts: result.blasts,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount: result.totalCount,
            totalPages: Math.ceil(result.totalCount / limitNum),
            hasNextPage: pageNum < Math.ceil(result.totalCount / limitNum),
            hasPreviousPage: pageNum > 1
          },
          filters: filters
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export dashboard report
   * Requirement: 16.5
   * 
   * GET /api/sms-blast/dashboard/export
   */
  async exportDashboardReport(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;

      // Only Superadmin can export reports
      if (user.role !== 'super_admin') {
        throw new AppError('Only Superadmin can export dashboard reports', 403);
      }

      // Parse query parameters
      const {
        startDate,
        endDate,
        senderId,
        emergencyType,
        province,
        city,
        barangay,
        format = 'csv',
        includeStatistics = 'true'
      } = req.query;

      // Validate format
      if (format !== 'csv' && format !== 'pdf') {
        throw new AppError('Format must be either "csv" or "pdf"', 400);
      }

      // Build filters
      const filters: DashboardFilters = {};

      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }

      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }

      if (senderId) {
        filters.senderId = parseInt(senderId as string, 10);
      }

      if (emergencyType) {
        filters.emergencyType = emergencyType as string;
      }

      if (province || city || barangay) {
        filters.location = {};
        
        if (province) {
          filters.location.province = province as string;
        }
        
        if (city) {
          filters.location.city = city as string;
        }
        
        if (barangay) {
          filters.location.barangay = barangay as string;
        }
      }

      // Requirement 16.5: Generate report with summary statistics
      const exportBuffer = await dashboardService.generateReport({
        filters,
        format: format as 'csv' | 'pdf',
        includeStatistics: includeStatistics === 'true'
      });

      // Set appropriate headers for file download
      const filename = `sms-dashboard-report-${Date.now()}.${format}`;
      const contentType = format === 'csv' 
        ? 'text/csv' 
        : 'application/pdf';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', exportBuffer.length);

      res.send(exportBuffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get credit usage report
   * Requirements: 11.6, 14.4
   * 
   * GET /api/sms-blast/dashboard/credit-usage
   */
  async getCreditUsageReport(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = req.user!;

      // Parse query parameters
      const { period = 'day' } = req.query;

      // Validate period
      if (!['day', 'week', 'month'].includes(period as string)) {
        throw new AppError('Period must be "day", "week", or "month"', 400);
      }

      // Requirements 11.6, 14.4: Get credit usage report
      const report = await dashboardService.getCreditUsageReport(
        period as 'day' | 'week' | 'month',
        user.id,
        user.role
      );

      res.status(200).json({
        status: 'success',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }
}

