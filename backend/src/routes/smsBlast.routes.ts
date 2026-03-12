/**
 * SMS Blast Routes
 * 
 * Defines API endpoints for SMS blast operations with authentication,
 * authorization, and rate limiting middleware.
 * 
 * Requirements: 1.1, 2.1, 2.2, 7.1, 7.2, 8.1, 8.2, 8.3, 8.5, 8.6, 14.1
 */

import { Router } from 'express';
import { SMSBlastController } from '../controllers/smsBlast.controller';
import { 
  authenticateSMS, 
  requireSMSRole,
  SMSAuthRequest
} from '../middleware/smsAuth';
import { createUpdateLimiter } from '../middleware/rateLimiter';

const router = Router();
const smsBlastController = new SMSBlastController();

/**
 * POST /api/sms-blast
 * Create and send SMS blast
 * 
 * Requirements:
 * - 1.1: SMS message composition
 * - 2.1, 2.2: Recipient selection and targeting
 * - 7.1, 7.2: Scheduling and immediate delivery
 * - 8.1, 8.2, 8.3: Send confirmation and safety controls
 * - 8.5: Insufficient credits prevention
 * - 8.6: Rate limiting enforcement
 * - 14.1: Spending limit enforcement
 * 
 * Access: MDRRMO, Admin and Superadmin
 * Rate Limit: 20 requests per 15 minutes
 */
router.post(
  '/',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  createUpdateLimiter,
  (req: SMSAuthRequest, res, next) => smsBlastController.createSMSBlast(req, res, next)
);

/**
 * POST /api/sms-blast/estimate
 * Estimate recipient count and cost before sending
 * 
 * Access: MDRRMO, Admin and Superadmin
 */
router.post(
  '/estimate',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.estimateRecipients(req, res, next)
);

/**
 * GET /api/sms-blast/credits/balance
 * Get SMS credit balance from iProg API with caching
 * 
 * Requirements: 4.6, 11.1
 * 
 * Access: MDRRMO, Admin and Superadmin
 */
router.get(
  '/credits/balance',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.getCreditBalance(req, res, next)
);

/**
 * POST /api/sms-blast/templates
 * Create new SMS template
 * 
 * Requirements: 6.2, 9.5, 18.1
 * 
 * Access: Superadmin only
 */
router.post(
  '/templates',
  authenticateSMS,
  requireSMSRole('super_admin'),
  createUpdateLimiter,
  (req: SMSAuthRequest, res, next) => smsBlastController.createTemplate(req, res, next)
);

/**
 * GET /api/sms-blast/templates
 * List all SMS templates with filtering by category and language
 * 
 * Requirements: 6.1, 18.4
 * 
 * Access: MDRRMO, Admin and Superadmin
 */
router.get(
  '/templates',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.listTemplates(req, res, next)
);

/**
 * POST /api/sms-blast/contact-groups
 * Create contact group with recipient filters
 * 
 * Requirements: 17.1, 17.2
 * 
 * Access: MDRRMO, Admin and Superadmin (restricted to their jurisdiction)
 */
router.post(
  '/contact-groups',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  createUpdateLimiter,
  (req: SMSAuthRequest, res, next) => smsBlastController.createContactGroup(req, res, next)
);

/**
 * GET /api/sms-blast/contact-groups
 * List all contact groups
 * 
 * Requirements: 17.1
 * 
 * Access: MDRRMO, Admin and Superadmin
 */
router.get(
  '/contact-groups',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.listContactGroups(req, res, next)
);

/**
 * GET /api/sms-blast/audit-logs/export
 * Export audit logs as CSV or PDF
 * 
 * Requirement: 10.5
 * 
 * Access: Superadmin only
 */
router.get(
  '/audit-logs/export',
  authenticateSMS,
  requireSMSRole('super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.exportAuditLogs(req, res, next)
);

/**
 * GET /api/sms-blast/history
 * Get SMS blast history with filtering and pagination
 * 
 * Requirements: 16.2, 16.4
 * 
 * Access: MDRRMO, Admin and Superadmin (can only view their own blasts unless Superadmin)
 */
router.get(
  '/history',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.getSMSBlastHistory(req, res, next)
);

/**
 * GET /api/sms-blast/dashboard/statistics
 * Get dashboard statistics (total SMS sent, recent activity, delivery success rates)
 * 
 * Requirements: 16.1, 16.2
 * 
 * Access: MDRRMO, Admin and Superadmin
 */
router.get(
  '/dashboard/statistics',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.getDashboardStatistics(req, res, next)
);

/**
 * GET /api/sms-blast/dashboard/filtered
 * Get filtered dashboard data with pagination
 * 
 * Requirement: 16.4
 * 
 * Access: MDRRMO, Admin and Superadmin
 */
router.get(
  '/dashboard/filtered',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.getFilteredDashboard(req, res, next)
);

/**
 * GET /api/sms-blast/dashboard/export
 * Export dashboard report as CSV or PDF
 * 
 * Requirement: 16.5
 * 
 * Access: Superadmin only
 */
router.get(
  '/dashboard/export',
  authenticateSMS,
  requireSMSRole('super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.exportDashboardReport(req, res, next)
);

/**
 * GET /api/sms-blast/dashboard/credit-usage
 * Get credit usage report with breakdown by user
 * 
 * Requirements: 11.6, 14.4
 * 
 * Access: MDRRMO, Admin and Superadmin
 */
router.get(
  '/dashboard/credit-usage',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.getCreditUsageReport(req, res, next)
);

/**
 * GET /api/sms-blast/:blastId
 * Get SMS blast status with delivery statistics
 * 
 * Requirement: 12.5
 * 
 * Access: MDRRMO, Admin and Superadmin (can only view their own blasts unless Superadmin)
 */
router.get(
  '/:blastId',
  authenticateSMS,
  requireSMSRole('mdrrmo', 'admin', 'super_admin'),
  (req: SMSAuthRequest, res, next) => smsBlastController.getSMSBlastStatus(req, res, next)
);

export default router;

