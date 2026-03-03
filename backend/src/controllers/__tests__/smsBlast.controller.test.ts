/**
 * SMS Blast Controller Tests
 * 
 * Tests for the SMS blast API endpoint including:
 * - Request validation
 * - Authentication and authorization
 * - Recipient filtering
 * - Cost estimation and credit checking
 * - Rate limiting
 * - Spending limits
 * - Queue job creation
 * 
 * Requirements: 1.1, 2.1, 2.2, 7.1, 7.2, 8.1, 8.2, 8.3, 8.5, 8.6, 14.1
 */

import { Request, Response, NextFunction } from 'express';
import { SMSBlastController } from '../smsBlast.controller';
import { SMSAuthRequest } from '../../middleware/smsAuth';
import { RecipientFilter } from '../../services/recipientFilter.service';
import { MessageComposer } from '../../services/messageComposer.service';
import { CostEstimator } from '../../services/costEstimator.service';
import { SMSQueue } from '../../services/smsQueue.service';
import { IProgAPIClient } from '../../services/iProgAPIClient.service';
import { auditLogger } from '../../services/auditLogger.service';
import pool from '../../config/database';

// Mock dependencies
jest.mock('../../services/recipientFilter.service');
jest.mock('../../services/messageComposer.service');
jest.mock('../../services/costEstimator.service');
jest.mock('../../services/smsQueue.service');
jest.mock('../../services/iProgAPIClient.service');
jest.mock('../../services/auditLogger.service');
jest.mock('../../config/database');

describe('SMSBlastController', () => {
  let controller: SMSBlastController;
  let mockRequest: Partial<SMSAuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockConnection: any;

  beforeEach(() => {
    controller = new SMSBlastController();
    
    mockRequest = {
      user: {
        id: 1,
        email: 'admin@test.com',
        role: 'super_admin',
        jurisdiction: null
      },
      body: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Mock database connection
    mockConnection = {
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
      query: jest.fn()
    };

    (pool.getConnection as jest.Mock).mockResolvedValue(mockConnection);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('createSMSBlast', () => {
    const validRequestBody = {
      message: 'Test emergency alert',
      recipientFilters: {
        provinces: ['Metro Manila']
      },
      language: 'en' as const,
      priority: 'normal' as const
    };

    const mockRecipients = [
      {
        userId: 1,
        phoneNumber: '+639171234567',
        name: 'John Doe',
        location: { province: 'Metro Manila', city: 'Manila', barangay: 'Test' }
      },
      {
        userId: 2,
        phoneNumber: '+639181234567',
        name: 'Jane Smith',
        location: { province: 'Metro Manila', city: 'Quezon City', barangay: 'Test' }
      }
    ];

    const mockComposedMessage = {
      content: 'Test emergency alert',
      characterCount: 21,
      smsPartCount: 1,
      language: 'en' as const,
      encoding: 'GSM-7' as const
    };

    const mockCostEstimate = {
      totalCredits: 2,
      creditsPerMessage: 1,
      recipientCount: 2,
      withinLimit: true
    };

    beforeEach(() => {
      mockRequest.body = validRequestBody;

      // Mock RecipientFilter
      (RecipientFilter.prototype.getRecipients as jest.Mock).mockResolvedValue(mockRecipients);

      // Mock MessageComposer
      (MessageComposer.prototype.composeFromText as jest.Mock).mockReturnValue(mockComposedMessage);

      // Mock CostEstimator
      (CostEstimator.prototype.estimateBulkBlast as jest.Mock).mockResolvedValue(mockCostEstimate);
      (CostEstimator.prototype.checkSpendingLimit as jest.Mock).mockResolvedValue({
        withinLimit: true,
        dailyLimit: 10000,
        currentDailySpend: 0,
        remainingBudget: 10000
      });

      // Mock IProgAPIClient
      (IProgAPIClient.prototype.getBalance as jest.Mock).mockResolvedValue(1000);

      // Mock SMSQueue
      (SMSQueue.prototype.enqueueBulk as jest.Mock).mockResolvedValue(['job1', 'job2']);

      // Mock auditLogger
      (auditLogger.logBlastCreated as jest.Mock).mockResolvedValue(undefined);

      // Mock database queries
      mockConnection.query.mockResolvedValue([[]]);
    });

    it('should create SMS blast successfully with valid request', async () => {
      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          blastId: expect.any(String),
          recipientCount: 2,
          estimatedCost: 2,
          creditsPerMessage: 1,
          status: 'queued'
        })
      });
    });

    it('should reject request without message or templateId', async () => {
      mockRequest.body = {
        recipientFilters: { provinces: ['Metro Manila'] },
        language: 'en'
      };

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Either message or templateId must be provided',
          statusCode: 400
        })
      );
    });

    it('should reject request without recipient filters', async () => {
      mockRequest.body = {
        message: 'Test alert',
        language: 'en'
      };

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Recipient filters are required',
          statusCode: 400
        })
      );
    });

    it('should reject request with invalid language', async () => {
      mockRequest.body = {
        message: 'Test alert',
        recipientFilters: { provinces: ['Metro Manila'] },
        language: 'invalid'
      };

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Language must be either "en" or "fil"',
          statusCode: 400
        })
      );
    });

    it('should reject request when no recipients match filters', async () => {
      (RecipientFilter.prototype.getRecipients as jest.Mock).mockResolvedValue([]);

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No recipients match the specified filters',
          statusCode: 400
        })
      );
    });

    it('should reject request when insufficient credits', async () => {
      (IProgAPIClient.prototype.getBalance as jest.Mock).mockResolvedValue(1);

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Insufficient credits'),
          statusCode: 402
        })
      );
    });

    it('should reject request when rate limit exceeded', async () => {
      mockConnection.query.mockResolvedValueOnce([[{ total_sent: 4999 }]]);

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Rate limit exceeded'),
          statusCode: 429
        })
      );
    });

    it('should reject Admin request when spending limit exceeded', async () => {
      mockRequest.user!.role = 'admin';
      
      (CostEstimator.prototype.estimateBulkBlast as jest.Mock).mockResolvedValue({
        ...mockCostEstimate,
        withinLimit: false
      });

      (CostEstimator.prototype.checkSpendingLimit as jest.Mock).mockResolvedValue({
        withinLimit: false,
        dailyLimit: 100,
        currentDailySpend: 99,
        remainingBudget: 1
      });

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Daily spending limit would be exceeded'),
          statusCode: 403
        })
      );
    });

    it('should allow Superadmin to override spending limit', async () => {
      (CostEstimator.prototype.estimateBulkBlast as jest.Mock).mockResolvedValue({
        ...mockCostEstimate,
        withinLimit: false
      });

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should schedule SMS blast for future delivery', async () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      mockRequest.body.scheduledTime = futureDate.toISOString();

      (SMSQueue.prototype.schedule as jest.Mock).mockResolvedValue('job1');

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(SMSQueue.prototype.schedule).toHaveBeenCalledTimes(2);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          status: 'scheduled',
          scheduledTime: futureDate.toISOString()
        })
      });
    });

    it('should reject scheduled time in the past', async () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      mockRequest.body.scheduledTime = pastDate.toISOString();

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Scheduled time must be in the future',
          statusCode: 400
        })
      );
    });

    it('should compose message from template when templateId provided', async () => {
      mockRequest.body = {
        templateId: 'template-123',
        templateVariables: { location: 'Metro Manila' },
        recipientFilters: { provinces: ['Metro Manila'] },
        language: 'en'
      };

      (MessageComposer.prototype.composeFromTemplate as jest.Mock).mockResolvedValue(mockComposedMessage);

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(MessageComposer.prototype.composeFromTemplate).toHaveBeenCalledWith(
        'template-123',
        { location: 'Metro Manila' },
        'en'
      );
      expect(mockConnection.commit).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      (RecipientFilter.prototype.getRecipients as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should log blast creation to audit logs', async () => {
      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(auditLogger.logBlastCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          blastId: expect.any(String),
          userId: 1,
          message: 'Test emergency alert',
          recipientCount: 2,
          estimatedCost: 2
        })
      );
    });

    it('should create SMS usage record', async () => {
      await controller.createSMSBlast(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      // Check that usage record was inserted
      const insertCalls = mockConnection.query.mock.calls.filter(
        (call: any[]) => call[0].includes('INSERT INTO sms_usage')
      );
      
      expect(insertCalls.length).toBeGreaterThan(0);
    });
  });
});



  describe('getDashboardStatistics', () => {
    it('should return dashboard statistics for superadmin', async () => {
      const mockStats = {
        totalSMSSent: {
          today: 100,
          thisWeek: 500,
          thisMonth: 2000
        },
        recentActivity: [
          {
            blastId: 'blast-1',
            sender: { id: 1, name: 'Admin', email: 'admin@test.com' },
            timestamp: new Date(),
            recipientCount: 100,
            deliverySuccessRate: 95,
            status: 'completed',
            message: 'Test message'
          }
        ],
        deliverySuccessRate: {
          overall: 90,
          today: 95,
          thisWeek: 92,
          thisMonth: 91
        }
      };

      // Mock the dashboard service
      const dashboardService = require('../../services/dashboardReporting.service');
      dashboardService.DashboardReportingService = jest.fn().mockImplementation(() => ({
        getDashboardStatistics: jest.fn().mockResolvedValue(mockStats)
      }));

      await controller.getDashboardStatistics(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockStats
      });
    });

    it('should filter statistics by user ID for admin', async () => {
      mockRequest.user = {
        id: 2,
        email: 'admin@test.com',
        role: 'admin',
        jurisdiction: { provinces: ['Cebu'] }
      };

      const mockStats = {
        totalSMSSent: {
          today: 50,
          thisWeek: 200,
          thisMonth: 800
        },
        recentActivity: [],
        deliverySuccessRate: {
          overall: 88,
          today: 90,
          thisWeek: 89,
          thisMonth: 88
        }
      };

      const dashboardService = require('../../services/dashboardReporting.service');
      dashboardService.DashboardReportingService = jest.fn().mockImplementation(() => ({
        getDashboardStatistics: jest.fn().mockResolvedValue(mockStats)
      }));

      await controller.getDashboardStatistics(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getFilteredDashboard', () => {
    it('should return filtered blasts with pagination', async () => {
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        page: '1',
        limit: '20'
      };

      const mockResult = {
        blasts: [
          {
            blastId: 'blast-1',
            sender: { id: 1, name: 'Admin', email: 'admin@test.com' },
            timestamp: new Date(),
            recipientCount: 100,
            deliverySuccessRate: 95,
            status: 'completed',
            message: 'Test message'
          }
        ],
        totalCount: 1
      };

      const dashboardService = require('../../services/dashboardReporting.service');
      dashboardService.DashboardReportingService = jest.fn().mockImplementation(() => ({
        getFilteredBlasts: jest.fn().mockResolvedValue(mockResult)
      }));

      await controller.getFilteredDashboard(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          blasts: mockResult.blasts,
          pagination: expect.objectContaining({
            page: 1,
            limit: 20,
            totalCount: 1
          })
        })
      });
    });

    it('should apply all filter types', async () => {
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        senderId: '1',
        emergencyType: 'typhoon',
        province: 'Metro Manila',
        city: 'Manila',
        barangay: 'Test Barangay'
      };

      const mockResult = {
        blasts: [],
        totalCount: 0
      };

      const dashboardService = require('../../services/dashboardReporting.service');
      const mockGetFilteredBlasts = jest.fn().mockResolvedValue(mockResult);
      dashboardService.DashboardReportingService = jest.fn().mockImplementation(() => ({
        getFilteredBlasts: mockGetFilteredBlasts
      }));

      await controller.getFilteredDashboard(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetFilteredBlasts).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          senderId: 1,
          emergencyType: 'typhoon',
          location: {
            province: 'Metro Manila',
            city: 'Manila',
            barangay: 'Test Barangay'
          }
        }),
        expect.any(Number),
        expect.any(String),
        1,
        20
      );
    });
  });

  describe('exportDashboardReport', () => {
    it('should export CSV report for superadmin', async () => {
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        format: 'csv',
        includeStatistics: 'true'
      };

      const mockBuffer = Buffer.from('CSV content');

      const dashboardService = require('../../services/dashboardReporting.service');
      dashboardService.DashboardReportingService = jest.fn().mockImplementation(() => ({
        generateReport: jest.fn().mockResolvedValue(mockBuffer)
      }));

      mockResponse.setHeader = jest.fn();
      mockResponse.send = jest.fn();

      await controller.exportDashboardReport(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('attachment; filename="sms-dashboard-report-')
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
    });

    it('should export PDF report for superadmin', async () => {
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        format: 'pdf',
        includeStatistics: 'false'
      };

      const mockBuffer = Buffer.from('PDF content');

      const dashboardService = require('../../services/dashboardReporting.service');
      dashboardService.DashboardReportingService = jest.fn().mockImplementation(() => ({
        generateReport: jest.fn().mockResolvedValue(mockBuffer)
      }));

      mockResponse.setHeader = jest.fn();
      mockResponse.send = jest.fn();

      await controller.exportDashboardReport(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
    });

    it('should reject non-superadmin users', async () => {
      mockRequest.user = {
        id: 2,
        email: 'admin@test.com',
        role: 'admin',
        jurisdiction: { provinces: ['Cebu'] }
      };

      mockRequest.query = {
        format: 'csv'
      };

      await controller.exportDashboardReport(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Only Superadmin can export dashboard reports',
          statusCode: 403
        })
      );
    });

    it('should validate format parameter', async () => {
      mockRequest.query = {
        format: 'invalid'
      };

      await controller.exportDashboardReport(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Format must be either "csv" or "pdf"',
          statusCode: 400
        })
      );
    });
  });

  describe('getCreditUsageReport', () => {
    it('should return daily credit usage report', async () => {
      mockRequest.query = {
        period: 'day'
      };

      const mockReport = {
        period: 'day' as const,
        totalCreditsUsed: 500,
        breakdown: [
          {
            userId: 1,
            userName: 'Admin',
            userEmail: 'admin@test.com',
            creditsUsed: 300,
            messageCount: 150,
            blastCount: 3
          },
          {
            userId: 2,
            userName: 'Super Admin',
            userEmail: 'super@test.com',
            creditsUsed: 200,
            messageCount: 100,
            blastCount: 2
          }
        ]
      };

      const dashboardService = require('../../services/dashboardReporting.service');
      dashboardService.DashboardReportingService = jest.fn().mockImplementation(() => ({
        getCreditUsageReport: jest.fn().mockResolvedValue(mockReport)
      }));

      await controller.getCreditUsageReport(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockReport
      });
    });

    it('should return weekly credit usage report', async () => {
      mockRequest.query = {
        period: 'week'
      };

      const mockReport = {
        period: 'week' as const,
        totalCreditsUsed: 2500,
        breakdown: []
      };

      const dashboardService = require('../../services/dashboardReporting.service');
      dashboardService.DashboardReportingService = jest.fn().mockImplementation(() => ({
        getCreditUsageReport: jest.fn().mockResolvedValue(mockReport)
      }));

      await controller.getCreditUsageReport(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return monthly credit usage report', async () => {
      mockRequest.query = {
        period: 'month'
      };

      const mockReport = {
        period: 'month' as const,
        totalCreditsUsed: 10000,
        breakdown: []
      };

      const dashboardService = require('../../services/dashboardReporting.service');
      dashboardService.DashboardReportingService = jest.fn().mockImplementation(() => ({
        getCreditUsageReport: jest.fn().mockResolvedValue(mockReport)
      }));

      await controller.getCreditUsageReport(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should validate period parameter', async () => {
      mockRequest.query = {
        period: 'invalid'
      };

      await controller.getCreditUsageReport(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Period must be "day", "week", or "month"',
          statusCode: 400
        })
      );
    });

    it('should default to day period if not specified', async () => {
      mockRequest.query = {};

      const mockReport = {
        period: 'day' as const,
        totalCreditsUsed: 500,
        breakdown: []
      };

      const dashboardService = require('../../services/dashboardReporting.service');
      const mockGetCreditUsageReport = jest.fn().mockResolvedValue(mockReport);
      dashboardService.DashboardReportingService = jest.fn().mockImplementation(() => ({
        getCreditUsageReport: mockGetCreditUsageReport
      }));

      await controller.getCreditUsageReport(
        mockRequest as SMSAuthRequest,
        mockResponse as Response,
        mockNext
      );

      expect(mockGetCreditUsageReport).toHaveBeenCalledWith(
        'day',
        expect.any(Number),
        expect.any(String)
      );
    });
  });
});
