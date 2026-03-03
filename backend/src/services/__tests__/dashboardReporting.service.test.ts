/**
 * Dashboard and Reporting Service Tests
 * 
 * Tests dashboard statistics, filtering, and report generation.
 */

import { DashboardReportingService, DashboardFilters } from '../dashboardReporting.service';
import pool from '../../config/database';

// Mock the database pool
jest.mock('../../config/database');

describe('DashboardReportingService', () => {
  let service: DashboardReportingService;
  let mockConnection: any;

  beforeEach(() => {
    service = new DashboardReportingService();
    
    // Create mock connection
    mockConnection = {
      query: jest.fn(),
      release: jest.fn(),
      escape: jest.fn((val) => `'${val}'`)
    };

    (pool.getConnection as jest.Mock).mockResolvedValue(mockConnection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStatistics', () => {
    it('should return dashboard statistics with total SMS sent', async () => {
      // Mock total SMS sent query
      mockConnection.query
        .mockResolvedValueOnce([[{ today: 100, this_week: 500, this_month: 2000 }]])
        .mockResolvedValueOnce([[]])  // Recent blasts
        .mockResolvedValueOnce([[{ total: 1000, delivered: 900 }]])  // Overall stats
        .mockResolvedValueOnce([[{ total: 100, delivered: 95 }]])   // Today stats
        .mockResolvedValueOnce([[{ total: 500, delivered: 475 }]])  // Week stats
        .mockResolvedValueOnce([[{ total: 2000, delivered: 1900 }]]); // Month stats

      const result = await service.getDashboardStatistics();

      expect(result.totalSMSSent).toEqual({
        today: 100,
        thisWeek: 500,
        thisMonth: 2000
      });

      expect(result.deliverySuccessRate.overall).toBe(90);
      expect(result.deliverySuccessRate.today).toBe(95);
      expect(result.deliverySuccessRate.thisWeek).toBe(95);
      expect(result.deliverySuccessRate.thisMonth).toBe(95);
    });

    it('should return recent activity with last 10 blasts', async () => {
      const mockBlasts = [
        {
          blast_id: 'blast-1',
          user_id: 1,
          user_name: 'Admin User',
          user_email: 'admin@test.com',
          message: 'Test message 1',
          recipient_count: 100,
          status: 'completed',
          created_at: new Date('2024-01-01')
        },
        {
          blast_id: 'blast-2',
          user_id: 2,
          user_name: 'Super Admin',
          user_email: 'super@test.com',
          message: 'Test message 2',
          recipient_count: 200,
          status: 'completed',
          created_at: new Date('2024-01-02')
        }
      ];

      mockConnection.query
        .mockResolvedValueOnce([[{ today: 0, this_week: 0, this_month: 0 }]])
        .mockResolvedValueOnce([mockBlasts])  // Recent blasts
        .mockResolvedValueOnce([[{ total: 100, delivered: 90 }]])  // Stats for blast-1
        .mockResolvedValueOnce([[{ total: 200, delivered: 180 }]]) // Stats for blast-2
        .mockResolvedValueOnce([[{ total: 0, delivered: 0 }]])     // Overall stats
        .mockResolvedValueOnce([[{ total: 0, delivered: 0 }]])     // Today stats
        .mockResolvedValueOnce([[{ total: 0, delivered: 0 }]])     // Week stats
        .mockResolvedValueOnce([[{ total: 0, delivered: 0 }]]);    // Month stats

      const result = await service.getDashboardStatistics();

      expect(result.recentActivity).toHaveLength(2);
      expect(result.recentActivity[0]).toMatchObject({
        blastId: 'blast-1',
        sender: {
          id: 1,
          name: 'Admin User',
          email: 'admin@test.com'
        },
        recipientCount: 100,
        deliverySuccessRate: 90,
        status: 'completed'
      });
    });

    it('should filter statistics by user ID for non-superadmin', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ today: 50, this_week: 200, this_month: 800 }]])
        .mockResolvedValueOnce([[]])  // Recent blasts
        .mockResolvedValueOnce([[{ total: 800, delivered: 750 }]])  // Overall stats
        .mockResolvedValueOnce([[{ total: 50, delivered: 48 }]])    // Today stats
        .mockResolvedValueOnce([[{ total: 200, delivered: 190 }]])  // Week stats
        .mockResolvedValueOnce([[{ total: 800, delivered: 750 }]]); // Month stats

      await service.getDashboardStatistics(1, 'admin');

      // Verify user filter was applied in queries
      const calls = mockConnection.query.mock.calls;
      expect(calls[0][0]).toContain('AND sb.user_id');
    });

    it('should handle zero delivery rate gracefully', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ today: 0, this_week: 0, this_month: 0 }]])
        .mockResolvedValueOnce([[]])  // Recent blasts
        .mockResolvedValueOnce([[{ total: 0, delivered: 0 }]])  // Overall stats
        .mockResolvedValueOnce([[{ total: 0, delivered: 0 }]])  // Today stats
        .mockResolvedValueOnce([[{ total: 0, delivered: 0 }]])  // Week stats
        .mockResolvedValueOnce([[{ total: 0, delivered: 0 }]]); // Month stats

      const result = await service.getDashboardStatistics();

      expect(result.deliverySuccessRate.overall).toBe(0);
      expect(result.deliverySuccessRate.today).toBe(0);
    });
  });

  describe('getFilteredBlasts', () => {
    it('should filter blasts by date range', async () => {
      const filters: DashboardFilters = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      mockConnection.query
        .mockResolvedValueOnce([[{ total: 5 }]])  // Count
        .mockResolvedValueOnce([[]]);             // Blasts

      await service.getFilteredBlasts(filters);

      const countQuery = mockConnection.query.mock.calls[0][0];
      expect(countQuery).toContain('sb.created_at >= ?');
      expect(countQuery).toContain('sb.created_at <= ?');
    });

    it('should filter blasts by sender ID', async () => {
      const filters: DashboardFilters = {
        senderId: 1
      };

      mockConnection.query
        .mockResolvedValueOnce([[{ total: 3 }]])  // Count
        .mockResolvedValueOnce([[]]);             // Blasts

      await service.getFilteredBlasts(filters);

      const countQuery = mockConnection.query.mock.calls[0][0];
      expect(countQuery).toContain('sb.user_id = ?');
    });

    it('should filter blasts by emergency type', async () => {
      const filters: DashboardFilters = {
        emergencyType: 'typhoon'
      };

      mockConnection.query
        .mockResolvedValueOnce([[{ total: 2 }]])  // Count
        .mockResolvedValueOnce([[]]);             // Blasts

      await service.getFilteredBlasts(filters);

      const countQuery = mockConnection.query.mock.calls[0][0];
      expect(countQuery).toContain('st.category = ?');
    });

    it('should filter blasts by location', async () => {
      const filters: DashboardFilters = {
        location: {
          province: 'Metro Manila',
          city: 'Quezon City'
        }
      };

      mockConnection.query
        .mockResolvedValueOnce([[{ total: 4 }]])  // Count
        .mockResolvedValueOnce([[]]);             // Blasts

      await service.getFilteredBlasts(filters);

      const countQuery = mockConnection.query.mock.calls[0][0];
      expect(countQuery).toContain('sb.message LIKE ?');
    });

    it('should return paginated results', async () => {
      const mockBlasts = [
        {
          blast_id: 'blast-1',
          user_id: 1,
          user_name: 'Admin',
          user_email: 'admin@test.com',
          message: 'Test',
          recipient_count: 100,
          status: 'completed',
          created_at: new Date()
        }
      ];

      mockConnection.query
        .mockResolvedValueOnce([[{ total: 25 }]])  // Count
        .mockResolvedValueOnce([mockBlasts])       // Blasts
        .mockResolvedValueOnce([[{ total: 100, delivered: 90 }]]); // Stats

      const result = await service.getFilteredBlasts({}, undefined, 'super_admin', 2, 10);

      expect(result.totalCount).toBe(25);
      expect(result.blasts).toHaveLength(1);

      // Verify pagination parameters
      const blastsQuery = mockConnection.query.mock.calls[1];
      expect(blastsQuery[1]).toContain(10);  // LIMIT
      expect(blastsQuery[1]).toContain(10);  // OFFSET (page 2, limit 10)
    });

    it('should combine multiple filters with AND logic', async () => {
      const filters: DashboardFilters = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        senderId: 1,
        emergencyType: 'earthquake'
      };

      mockConnection.query
        .mockResolvedValueOnce([[{ total: 1 }]])  // Count
        .mockResolvedValueOnce([[]]);             // Blasts

      await service.getFilteredBlasts(filters);

      const countQuery = mockConnection.query.mock.calls[0][0];
      expect(countQuery).toContain('AND');
      expect(countQuery).toContain('sb.created_at >= ?');
      expect(countQuery).toContain('sb.user_id = ?');
    });
  });

  describe('generateReport', () => {
    it('should generate CSV report with summary statistics', async () => {
      const mockBlasts = [
        {
          blast_id: 'blast-1',
          user_id: 1,
          user_name: 'Admin',
          user_email: 'admin@test.com',
          message: 'Test message',
          recipient_count: 100,
          status: 'completed',
          created_at: new Date('2024-01-01')
        }
      ];

      mockConnection.query
        .mockResolvedValueOnce([[{ total: 1 }]])   // Count
        .mockResolvedValueOnce([mockBlasts])       // Blasts
        .mockResolvedValueOnce([[{ total: 100, delivered: 90 }]]) // Stats for blast
        .mockResolvedValueOnce([[{                 // Summary stats
          total_messages: 100,
          sent: 95,
          delivered: 90,
          failed: 5,
          pending: 0
        }]]);

      const buffer = await service.generateReport({
        filters: {},
        format: 'csv',
        includeStatistics: true
      });

      const content = buffer.toString('utf-8');
      
      expect(content).toContain('SMS Blast Report - Summary Statistics');
      expect(content).toContain('Total Messages,100');
      expect(content).toContain('Delivered,90');
      expect(content).toContain('Failed,5');
      expect(content).toContain('Blast ID,Sender Name');
      expect(content).toContain('blast-1');
    });

    it('should generate PDF report with summary statistics', async () => {
      const mockBlasts = [
        {
          blast_id: 'blast-1',
          user_id: 1,
          user_name: 'Admin',
          user_email: 'admin@test.com',
          message: 'Test message',
          recipient_count: 100,
          status: 'completed',
          created_at: new Date('2024-01-01')
        }
      ];

      mockConnection.query
        .mockResolvedValueOnce([[{ total: 1 }]])   // Count
        .mockResolvedValueOnce([mockBlasts])       // Blasts
        .mockResolvedValueOnce([[{ total: 100, delivered: 90 }]]) // Stats for blast
        .mockResolvedValueOnce([[{                 // Summary stats
          total_messages: 100,
          sent: 95,
          delivered: 90,
          failed: 5,
          pending: 0
        }]]);

      const buffer = await service.generateReport({
        filters: {},
        format: 'pdf',
        includeStatistics: true
      });

      const content = buffer.toString('utf-8');
      
      expect(content).toContain('SMS BLAST REPORT');
      expect(content).toContain('SUMMARY STATISTICS');
      expect(content).toContain('Total Messages: 100');
      expect(content).toContain('Delivered: 90');
      expect(content).toContain('BLAST DETAILS');
    });

    it('should generate report without summary statistics', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ total: 0 }]])  // Count
        .mockResolvedValueOnce([[]]);             // Blasts

      const buffer = await service.generateReport({
        filters: {},
        format: 'csv',
        includeStatistics: false
      });

      const content = buffer.toString('utf-8');
      
      expect(content).not.toContain('Summary Statistics');
      expect(content).toContain('Blast ID,Sender Name');
    });

    it('should escape quotes in CSV message content', async () => {
      const mockBlasts = [
        {
          blast_id: 'blast-1',
          user_id: 1,
          user_name: 'Admin',
          user_email: 'admin@test.com',
          message: 'Message with "quotes" inside',
          recipient_count: 100,
          status: 'completed',
          created_at: new Date('2024-01-01')
        }
      ];

      mockConnection.query
        .mockResolvedValueOnce([[{ total: 1 }]])   // Count
        .mockResolvedValueOnce([mockBlasts])       // Blasts
        .mockResolvedValueOnce([[{ total: 100, delivered: 90 }]]); // Stats

      const buffer = await service.generateReport({
        filters: {},
        format: 'csv',
        includeStatistics: false
      });

      const content = buffer.toString('utf-8');
      
      // Quotes should be escaped as ""
      expect(content).toContain('Message with ""quotes"" inside');
    });
  });

  describe('getCreditUsageReport', () => {
    it('should calculate daily credit usage', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ total_credits: 500 }]])  // Total
        .mockResolvedValueOnce([[                           // Breakdown
          {
            user_id: 1,
            user_name: 'Admin',
            user_email: 'admin@test.com',
            credits_used: 300,
            message_count: 150,
            blast_count: 3
          },
          {
            user_id: 2,
            user_name: 'Super Admin',
            user_email: 'super@test.com',
            credits_used: 200,
            message_count: 100,
            blast_count: 2
          }
        ]]);

      const result = await service.getCreditUsageReport('day');

      expect(result.period).toBe('day');
      expect(result.totalCreditsUsed).toBe(500);
      expect(result.breakdown).toHaveLength(2);
      expect(result.breakdown[0]).toMatchObject({
        userId: 1,
        userName: 'Admin',
        creditsUsed: 300,
        messageCount: 150,
        blastCount: 3
      });
    });

    it('should calculate weekly credit usage', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ total_credits: 2500 }]])  // Total
        .mockResolvedValueOnce([[]]);                         // Breakdown

      const result = await service.getCreditUsageReport('week');

      expect(result.period).toBe('week');
      expect(result.totalCreditsUsed).toBe(2500);
    });

    it('should calculate monthly credit usage', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ total_credits: 10000 }]]) // Total
        .mockResolvedValueOnce([[]]);                         // Breakdown

      const result = await service.getCreditUsageReport('month');

      expect(result.period).toBe('month');
      expect(result.totalCreditsUsed).toBe(10000);
    });

    it('should filter by user ID for non-superadmin', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ total_credits: 300 }]])  // Total
        .mockResolvedValueOnce([[]]);                        // Breakdown

      await service.getCreditUsageReport('day', 1, 'admin');

      // Verify user filter was applied
      const totalQuery = mockConnection.query.mock.calls[0][0];
      expect(totalQuery).toContain('AND su.user_id');
    });

    it('should order breakdown by credits used descending', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ total_credits: 600 }]])  // Total
        .mockResolvedValueOnce([[                           // Breakdown
          {
            user_id: 2,
            user_name: 'User 2',
            user_email: 'user2@test.com',
            credits_used: 400,
            message_count: 200,
            blast_count: 4
          },
          {
            user_id: 1,
            user_name: 'User 1',
            user_email: 'user1@test.com',
            credits_used: 200,
            message_count: 100,
            blast_count: 2
          }
        ]]);

      const result = await service.getCreditUsageReport('day');

      // Should be ordered by credits_used DESC
      expect(result.breakdown[0].creditsUsed).toBe(400);
      expect(result.breakdown[1].creditsUsed).toBe(200);
    });

    it('should handle zero credit usage', async () => {
      mockConnection.query
        .mockResolvedValueOnce([[{ total_credits: 0 }]])  // Total
        .mockResolvedValueOnce([[]]);                      // Breakdown

      const result = await service.getCreditUsageReport('day');

      expect(result.totalCreditsUsed).toBe(0);
      expect(result.breakdown).toHaveLength(0);
    });
  });
});
