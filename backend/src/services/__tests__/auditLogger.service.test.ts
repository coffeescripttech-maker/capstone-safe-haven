import { AuditLoggerService } from '../auditLogger.service';
import db from '../../config/database';
import { logger } from '../../utils/logger';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234')
}));

// Mock the database pool
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    execute: jest.fn(),
    query: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../utils/logger');

describe('AuditLoggerService - SMS Blast Logging', () => {
  let auditLogger: AuditLoggerService;
  const mockQuery = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    auditLogger = new AuditLoggerService();
    (db.query as jest.Mock) = mockQuery;
  });

  describe('logBlastCreated', () => {
    it('should log SMS blast creation with all required fields', async () => {
      const event = {
        blastId: 'blast-123',
        userId: 1,
        message: 'Emergency alert: Typhoon approaching',
        recipientCount: 100,
        filters: { provinces: ['Metro Manila'] },
        estimatedCost: 50.0,
        timestamp: new Date('2024-01-01T10:00:00Z')
      };

      await auditLogger.logBlastCreated(event);

      // Wait for setImmediate to execute
      await new Promise(resolve => setImmediate(resolve));

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_audit_logs'),
        expect.arrayContaining([
          expect.any(String), // UUID
          'blast_created',
          event.userId,
          event.blastId,
          expect.stringContaining(event.message),
          event.timestamp
        ])
      );
    });

    it('should not throw error if database insert fails', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      const event = {
        blastId: 'blast-123',
        userId: 1,
        message: 'Test message',
        recipientCount: 10,
        filters: {},
        estimatedCost: 5.0,
        timestamp: new Date()
      };

      await expect(auditLogger.logBlastCreated(event)).resolves.not.toThrow();
    });
  });

  describe('logSMSSent', () => {
    it('should log SMS sent with message ID and credits used', async () => {
      const event = {
        blastId: 'blast-123',
        jobId: 'job-456',
        recipientId: 2,
        phoneNumber: '+639171234567',
        messageId: 'iprog-msg-789',
        creditsUsed: 1.0,
        timestamp: new Date('2024-01-01T10:05:00Z')
      };

      await auditLogger.logSMSSent(event);

      // Wait for setImmediate to execute
      await new Promise(resolve => setImmediate(resolve));

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_audit_logs'),
        expect.arrayContaining([
          expect.any(String), // UUID
          'sms_sent',
          event.recipientId,
          event.blastId,
          event.jobId,
          expect.stringContaining(event.phoneNumber),
          event.timestamp
        ])
      );
    });

    it('should handle logging errors gracefully', async () => {
      mockQuery.mockRejectedValue(new Error('Connection timeout'));

      const event = {
        blastId: 'blast-123',
        jobId: 'job-456',
        recipientId: 2,
        phoneNumber: '+639171234567',
        messageId: 'iprog-msg-789',
        creditsUsed: 1.0,
        timestamp: new Date()
      };

      await expect(auditLogger.logSMSSent(event)).resolves.not.toThrow();
      
      // Wait for setImmediate
      await new Promise(resolve => setImmediate(resolve));
      
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to log SMS sent:',
        expect.any(Error)
      );
    });
  });

  describe('logDeliveryStatusChange', () => {
    it('should log status change from sent to delivered', async () => {
      const event = {
        jobId: 'job-456',
        messageId: 'iprog-msg-789',
        oldStatus: 'sent',
        newStatus: 'delivered',
        timestamp: new Date('2024-01-01T10:10:00Z')
      };

      await auditLogger.logDeliveryStatusChange(event);

      // Wait for setImmediate to execute
      await new Promise(resolve => setImmediate(resolve));

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_audit_logs'),
        expect.arrayContaining([
          expect.any(String), // UUID
          'status_change',
          event.jobId,
          expect.stringContaining(event.oldStatus),
          event.timestamp
        ])
      );
    });

    it('should log status change from sent to failed', async () => {
      const event = {
        jobId: 'job-789',
        messageId: 'iprog-msg-999',
        oldStatus: 'sent',
        newStatus: 'failed',
        timestamp: new Date()
      };

      await auditLogger.logDeliveryStatusChange(event);

      // Wait for setImmediate
      await new Promise(resolve => setImmediate(resolve));

      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('logUnauthorizedAccess', () => {
    it('should log unauthorized SMS blast access attempt', async () => {
      const event = {
        userId: 3,
        action: 'create_sms_blast',
        resource: 'sms_blast',
        reason: 'Insufficient permissions - Regular user role',
        timestamp: new Date('2024-01-01T10:15:00Z')
      };

      await auditLogger.logUnauthorizedAccess(event);

      // Wait for setImmediate to execute
      await new Promise(resolve => setImmediate(resolve));

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sms_audit_logs'),
        expect.arrayContaining([
          expect.any(String), // UUID
          'unauthorized_access',
          event.userId,
          expect.stringContaining(event.reason),
          event.timestamp
        ])
      );
    });

    it('should log jurisdiction violation attempt', async () => {
      const event = {
        userId: 4,
        action: 'send_sms_blast',
        resource: 'sms_blast',
        reason: 'Jurisdiction violation - Admin accessing out-of-scope location',
        timestamp: new Date()
      };

      await auditLogger.logUnauthorizedAccess(event);

      // Wait for setImmediate
      await new Promise(resolve => setImmediate(resolve));

      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('querySMSLogs', () => {
    it('should query logs by event type', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          event_type: 'blast_created',
          user_id: 1,
          blast_id: 'blast-123',
          job_id: null,
          details: JSON.stringify({ message: 'Test' }),
          created_at: new Date()
        }
      ];

      mockQuery.mockResolvedValue([mockLogs]);

      const result = await auditLogger.querySMSLogs({
        eventType: 'blast_created'
      });

      expect(result).toHaveLength(1);
      expect(result[0].eventType).toBe('blast_created');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE event_type = ?'),
        expect.arrayContaining(['blast_created', 100, 0])
      );
    });

    it('should query logs by multiple event types', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          event_type: 'blast_created',
          user_id: 1,
          blast_id: 'blast-123',
          job_id: null,
          details: JSON.stringify({}),
          created_at: new Date()
        },
        {
          id: 'log-2',
          event_type: 'sms_sent',
          user_id: 2,
          blast_id: 'blast-123',
          job_id: 'job-456',
          details: JSON.stringify({}),
          created_at: new Date()
        }
      ];

      mockQuery.mockResolvedValue([mockLogs]);

      const result = await auditLogger.querySMSLogs({
        eventType: ['blast_created', 'sms_sent']
      });

      expect(result).toHaveLength(2);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('event_type IN (?,?)'),
        expect.arrayContaining(['blast_created', 'sms_sent', 100, 0])
      );
    });

    it('should query logs by blast ID', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          event_type: 'blast_created',
          user_id: 1,
          blast_id: 'blast-123',
          job_id: null,
          details: JSON.stringify({}),
          created_at: new Date()
        }
      ];

      mockQuery.mockResolvedValue([mockLogs]);

      const result = await auditLogger.querySMSLogs({
        blastId: 'blast-123'
      });

      expect(result).toHaveLength(1);
      expect(result[0].blastId).toBe('blast-123');
    });

    it('should query logs with date range filter', async () => {
      const mockLogs = [];
      mockQuery.mockResolvedValue([mockLogs]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await auditLogger.querySMSLogs({
        startDate,
        endDate
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('created_at >= ?'),
        expect.arrayContaining([startDate, endDate, 100, 0])
      );
    });

    it('should apply pagination with limit and offset', async () => {
      const mockLogs = [];
      mockQuery.mockResolvedValue([mockLogs]);

      await auditLogger.querySMSLogs({
        limit: 50,
        offset: 100
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([50, 100])
      );
    });

    it('should parse JSON details field correctly', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          event_type: 'blast_created',
          user_id: 1,
          blast_id: 'blast-123',
          job_id: null,
          details: JSON.stringify({
            message: 'Emergency alert',
            recipientCount: 100
          }),
          created_at: new Date()
        }
      ];

      mockQuery.mockResolvedValue([mockLogs]);

      const result = await auditLogger.querySMSLogs({});

      expect(result[0].details).toEqual({
        message: 'Emergency alert',
        recipientCount: 100
      });
    });

    it('should throw error if query fails', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));

      await expect(
        auditLogger.querySMSLogs({})
      ).rejects.toThrow('Database error');
    });
  });

  describe('exportSMSLogs', () => {
    it('should export logs as CSV format', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          event_type: 'blast_created',
          user_id: 1,
          blast_id: 'blast-123',
          job_id: null,
          details: JSON.stringify({ message: 'Test' }),
          created_at: new Date('2024-01-01T10:00:00Z')
        }
      ];

      mockQuery.mockResolvedValue([mockLogs]);

      const result = await auditLogger.exportSMSLogs({}, 'csv');

      expect(result).toBeInstanceOf(Buffer);
      const csvContent = result.toString('utf-8');
      expect(csvContent).toContain('ID,Event Type,User ID');
      expect(csvContent).toContain('log-1');
      expect(csvContent).toContain('blast_created');
    });

    it('should export logs as PDF format', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          event_type: 'blast_created',
          user_id: 1,
          blast_id: 'blast-123',
          job_id: null,
          details: JSON.stringify({ message: 'Test' }),
          created_at: new Date('2024-01-01T10:00:00Z')
        }
      ];

      mockQuery.mockResolvedValue([mockLogs]);

      const result = await auditLogger.exportSMSLogs({}, 'pdf');

      expect(result).toBeInstanceOf(Buffer);
      const pdfContent = result.toString('utf-8');
      expect(pdfContent).toContain('SMS Audit Logs Report');
      expect(pdfContent).toContain('log-1');
    });

    it('should handle CSV export with special characters', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          event_type: 'blast_created',
          user_id: 1,
          blast_id: 'blast-123',
          job_id: null,
          details: JSON.stringify({ message: 'Test "quoted" message' }),
          created_at: new Date()
        }
      ];

      mockQuery.mockResolvedValue([mockLogs]);

      const result = await auditLogger.exportSMSLogs({}, 'csv');
      const csvContent = result.toString('utf-8');
      
      // CSV should escape quotes properly - the JSON stringified details will have escaped quotes
      expect(csvContent).toContain('Test');
      expect(csvContent).toContain('quoted');
    });

    it('should throw error if export fails', async () => {
      mockQuery.mockRejectedValue(new Error('Export error'));

      await expect(
        auditLogger.exportSMSLogs({}, 'csv')
      ).rejects.toThrow('Export error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null user ID in logs', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          event_type: 'status_change',
          user_id: null,
          blast_id: 'blast-123',
          job_id: 'job-456',
          details: JSON.stringify({}),
          created_at: new Date()
        }
      ];

      mockQuery.mockResolvedValue([mockLogs]);

      const result = await auditLogger.querySMSLogs({});

      expect(result[0].userId).toBeNull();
    });

    it('should handle empty details object', async () => {
      const event = {
        blastId: 'blast-123',
        userId: 1,
        message: '',
        recipientCount: 0,
        filters: {},
        estimatedCost: 0,
        timestamp: new Date()
      };

      await auditLogger.logBlastCreated(event);

      // Wait for setImmediate
      await new Promise(resolve => setImmediate(resolve));

      expect(mockQuery).toHaveBeenCalled();
    });

    it('should handle very large details object', async () => {
      const largeFilters = {
        provinces: Array(100).fill('Province'),
        cities: Array(100).fill('City')
      };

      const event = {
        blastId: 'blast-123',
        userId: 1,
        message: 'Test',
        recipientCount: 10000,
        filters: largeFilters,
        estimatedCost: 5000,
        timestamp: new Date()
      };

      await auditLogger.logBlastCreated(event);

      // Wait for setImmediate
      await new Promise(resolve => setImmediate(resolve));

      expect(mockQuery).toHaveBeenCalled();
    });
  });
});
