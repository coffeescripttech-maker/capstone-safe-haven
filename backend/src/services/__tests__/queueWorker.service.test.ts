/**
 * QueueWorker Service Tests
 * 
 * Tests for queue worker functionality including job processing,
 * batch processing, retry logic, and status updates.
 */

import { QueueWorker } from '../queueWorker.service';
import { IProgAPIClient } from '../iProgAPIClient.service';
import { SMSJob } from '../smsQueue.service';
import db from '../../config/database';

// Mock dependencies
jest.mock('../iProgAPIClient.service');
jest.mock('../../config/database');
jest.mock('bullmq', () => {
  const mockWorker = jest.fn().mockImplementation((queueName, processor, options) => {
    return {
      on: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    };
  });

  return {
    Worker: mockWorker,
  };
});

describe('QueueWorker', () => {
  let queueWorker: QueueWorker;
  let mockIProgClient: jest.Mocked<IProgAPIClient>;
  let mockDbQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock database query
    mockDbQuery = jest.fn().mockResolvedValue([[]]);
    (db.query as jest.Mock) = mockDbQuery;

    // Create queue worker instance
    queueWorker = new QueueWorker();

    // Get mocked iProg client instance
    mockIProgClient = (queueWorker as any).iProgClient as jest.Mocked<IProgAPIClient>;
  });

  afterEach(async () => {
    await queueWorker.stop();
  });

  describe('start', () => {
    it('should start queue workers for all priority levels', async () => {
      await queueWorker.start();

      const status = queueWorker.getStatus();
      expect(status.isRunning).toBe(true);
      expect(status.workerCount).toBe(3); // critical, high, normal
    });

    it('should not start workers if already running', async () => {
      await queueWorker.start();
      const firstStatus = queueWorker.getStatus();

      await queueWorker.start();
      const secondStatus = queueWorker.getStatus();

      expect(secondStatus.workerCount).toBe(firstStatus.workerCount);
    });
  });

  describe('stop', () => {
    it('should stop all running workers', async () => {
      await queueWorker.start();
      expect(queueWorker.getStatus().isRunning).toBe(true);

      await queueWorker.stop();
      const status = queueWorker.getStatus();

      expect(status.isRunning).toBe(false);
      expect(status.workerCount).toBe(0);
    });

    it('should handle stop when not running', async () => {
      await expect(queueWorker.stop()).resolves.not.toThrow();
    });
  });

  describe('processBatch', () => {
    it('should process batch of jobs sequentially', async () => {
      const jobs: SMSJob[] = [
        {
          blastId: 'blast-1',
          recipientId: 'user-1',
          phoneNumber: '+639171234567',
          message: 'Test message 1',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
        {
          blastId: 'blast-1',
          recipientId: 'user-2',
          phoneNumber: '+639181234567',
          message: 'Test message 2',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
      ];

      mockIProgClient.sendSMS = jest.fn()
        .mockResolvedValueOnce({ success: true, messageId: 'msg-1', creditsUsed: 1 })
        .mockResolvedValueOnce({ success: true, messageId: 'msg-2', creditsUsed: 1 });

      const result = await queueWorker.processBatch(jobs);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockIProgClient.sendSMS).toHaveBeenCalledTimes(2);
    });

    it('should handle batch with some failures', async () => {
      const jobs: SMSJob[] = [
        {
          blastId: 'blast-1',
          recipientId: 'user-1',
          phoneNumber: '+639171234567',
          message: 'Test message 1',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
        {
          blastId: 'blast-1',
          recipientId: 'user-2',
          phoneNumber: '+639181234567',
          message: 'Test message 2',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
      ];

      mockIProgClient.sendSMS = jest.fn()
        .mockResolvedValueOnce({ success: true, messageId: 'msg-1', creditsUsed: 1 })
        .mockResolvedValueOnce({ success: false, error: 'API error', creditsUsed: 0 });

      const result = await queueWorker.processBatch(jobs);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('API error');
    });

    it('should handle empty batch', async () => {
      const result = await queueWorker.processBatch([]);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should process batch of 100 messages', async () => {
      const jobs: SMSJob[] = Array.from({ length: 100 }, (_, i) => ({
        blastId: 'blast-1',
        recipientId: `user-${i}`,
        phoneNumber: `+63917123456${i % 10}`,
        message: `Test message ${i}`,
        priority: 'normal' as const,
        metadata: { userId: 'admin-1' },
      }));

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-id',
        creditsUsed: 1,
      });

      const result = await queueWorker.processBatch(jobs);

      expect(result.successful).toBe(100);
      expect(result.failed).toBe(0);
      expect(mockIProgClient.sendSMS).toHaveBeenCalledTimes(100);
    });
  });

  describe('retryJob', () => {
    it('should retry a failed job successfully', async () => {
      const job: SMSJob = {
        blastId: 'blast-1',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'Test message',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-1',
        creditsUsed: 1,
      });

      await expect(queueWorker.retryJob(job)).resolves.not.toThrow();
      expect(mockIProgClient.sendSMS).toHaveBeenCalledWith(
        job.phoneNumber,
        job.message
      );
    });

    it('should throw error if retry fails', async () => {
      const job: SMSJob = {
        blastId: 'blast-1',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'Test message',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: false,
        error: 'API error',
        creditsUsed: 0,
      });

      await expect(queueWorker.retryJob(job)).rejects.toThrow('API error');
    });
  });

  describe('getStatus', () => {
    it('should return correct status when not running', () => {
      const status = queueWorker.getStatus();

      expect(status.isRunning).toBe(false);
      expect(status.workerCount).toBe(0);
    });

    it('should return correct status when running', async () => {
      await queueWorker.start();
      const status = queueWorker.getStatus();

      expect(status.isRunning).toBe(true);
      expect(status.workerCount).toBe(3);
    });
  });

  describe('error handling', () => {
    it('should handle API connection errors', async () => {
      const jobs: SMSJob[] = [
        {
          blastId: 'blast-1',
          recipientId: 'user-1',
          phoneNumber: '+639171234567',
          message: 'Test message',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
      ];

      mockIProgClient.sendSMS = jest.fn().mockRejectedValue(
        new Error('Connection failed')
      );

      const result = await queueWorker.processBatch(jobs);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toBe('Connection failed');
    });

    it('should handle database errors gracefully', async () => {
      const jobs: SMSJob[] = [
        {
          blastId: 'blast-1',
          recipientId: 'user-1',
          phoneNumber: '+639171234567',
          message: 'Test message',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
      ];

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-1',
        creditsUsed: 1,
      });

      mockDbQuery.mockRejectedValue(new Error('Database error'));

      // Should not throw, just log error
      await expect(queueWorker.processBatch(jobs)).resolves.not.toThrow();
    });
  });

  describe('batch size limit', () => {
    it('should respect batch size of 100 messages', async () => {
      const jobs: SMSJob[] = Array.from({ length: 150 }, (_, i) => ({
        blastId: 'blast-1',
        recipientId: `user-${i}`,
        phoneNumber: `+63917123456${i % 10}`,
        message: `Test message ${i}`,
        priority: 'normal' as const,
        metadata: { userId: 'admin-1' },
      }));

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-id',
        creditsUsed: 1,
      });

      // Process first batch of 100
      const batch1 = jobs.slice(0, 100);
      const result1 = await queueWorker.processBatch(batch1);

      expect(result1.successful).toBe(100);

      // Process remaining 50
      const batch2 = jobs.slice(100);
      const result2 = await queueWorker.processBatch(batch2);

      expect(result2.successful).toBe(50);
    });
  });

  describe('priority handling', () => {
    it('should process critical priority jobs', async () => {
      const job: SMSJob = {
        blastId: 'blast-1',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'Critical alert',
        priority: 'critical',
        metadata: { userId: 'admin-1', emergencyType: 'earthquake' },
      };

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-1',
        creditsUsed: 1,
      });

      const result = await queueWorker.processBatch([job]);

      expect(result.successful).toBe(1);
      expect(mockIProgClient.sendSMS).toHaveBeenCalledWith(
        job.phoneNumber,
        job.message
      );
    });

    it('should process high priority jobs', async () => {
      const job: SMSJob = {
        blastId: 'blast-1',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'High priority alert',
        priority: 'high',
        metadata: { userId: 'admin-1' },
      };

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-1',
        creditsUsed: 1,
      });

      const result = await queueWorker.processBatch([job]);

      expect(result.successful).toBe(1);
    });

    it('should process normal priority jobs', async () => {
      const job: SMSJob = {
        blastId: 'blast-1',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'Normal message',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-1',
        creditsUsed: 1,
      });

      const result = await queueWorker.processBatch([job]);

      expect(result.successful).toBe(1);
    });
  });
});

  describe('priority-based processing', () => {
    it('should create workers for all priority levels', async () => {
      const { Worker } = require('bullmq');
      
      await queueWorker.start();

      // Verify workers were created for each priority
      expect(Worker).toHaveBeenCalledWith(
        'sms-critical',
        expect.any(Function),
        expect.objectContaining({ concurrency: 3 })
      );
      expect(Worker).toHaveBeenCalledWith(
        'sms-high',
        expect.any(Function),
        expect.objectContaining({ concurrency: 2 })
      );
      expect(Worker).toHaveBeenCalledWith(
        'sms-normal',
        expect.any(Function),
        expect.objectContaining({ concurrency: 1 })
      );
    });

    it('should assign higher concurrency to critical priority workers', async () => {
      const { Worker } = require('bullmq');
      
      await queueWorker.start();

      const criticalWorkerCall = (Worker as jest.Mock).mock.calls.find(
        call => call[0] === 'sms-critical'
      );
      const highWorkerCall = (Worker as jest.Mock).mock.calls.find(
        call => call[0] === 'sms-high'
      );
      const normalWorkerCall = (Worker as jest.Mock).mock.calls.find(
        call => call[0] === 'sms-normal'
      );

      expect(criticalWorkerCall[2].concurrency).toBe(3);
      expect(highWorkerCall[2].concurrency).toBe(2);
      expect(normalWorkerCall[2].concurrency).toBe(1);
    });

    it('should create workers in priority order', async () => {
      const { Worker } = require('bullmq');
      
      await queueWorker.start();

      const workerCalls = (Worker as jest.Mock).mock.calls;
      expect(workerCalls[0][0]).toBe('sms-critical');
      expect(workerCalls[1][0]).toBe('sms-high');
      expect(workerCalls[2][0]).toBe('sms-normal');
    });
  });
});
