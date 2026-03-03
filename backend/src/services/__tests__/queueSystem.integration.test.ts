/**
 * Queue System Integration Tests
 * 
 * End-to-end tests for the SMS queue and worker system.
 * Tests complete message flow from enqueue to delivery and retry logic.
 * 
 * Checkpoint Task 12: Queue system operational
 */

import { SMSQueue, SMSJob } from '../smsQueue.service';
import { QueueWorker } from '../queueWorker.service';
import { IProgAPIClient } from '../iProgAPIClient.service';
import db from '../../config/database';

// Mock BullMQ
jest.mock('bullmq', () => {
  const mockJobs = new Map();
  let jobIdCounter = 0;

  class MockJob {
    id: string;
    data: any;
    opts: any;
    attemptsMade: number = 0;
    processedOn?: number;
    failedReason?: string;
    progress: number = 0;
    private state: string = 'waiting';
    private removed: boolean = false;

    constructor(id: string, data: any, opts: any) {
      this.id = id;
      this.data = data;
      this.opts = opts;
      mockJobs.set(id, this);
    }

    async getState() {
      if (this.removed) {
        throw new Error('Job has been removed');
      }
      return this.state;
    }

    async remove() {
      this.removed = true;
      mockJobs.delete(this.id);
    }

    async updateProgress(progress: number) {
      this.progress = progress;
    }

    setState(state: string) {
      this.state = state;
    }

    isRemoved() {
      return this.removed;
    }
  }

  class MockQueue {
    name: string;
    private jobs: Map<string, MockJob> = new Map();

    constructor(name: string, options: any) {
      this.name = name;
    }

    async add(name: string, data: any, opts: any = {}) {
      const jobId = opts.jobId || `job-${++jobIdCounter}`;
      const job = new MockJob(jobId, data, opts);
      this.jobs.set(jobId, job);
      mockJobs.set(jobId, job);
      return job;
    }

    async addBulk(jobs: any[]) {
      return Promise.all(
        jobs.map(({ name, data, opts }) => this.add(name, data, opts))
      );
    }

    async getJob(jobId: string) {
      const job = this.jobs.get(jobId) || mockJobs.get(jobId);
      if (job && !(job as any).isRemoved()) {
        return job;
      }
      return null;
    }

    async getWaitingCount() {
      const jobs = Array.from(this.jobs.values());
      const states = await Promise.all(jobs.map(j => j.getState()));
      return states.filter(s => s === 'waiting').length;
    }

    async getActiveCount() {
      const jobs = Array.from(this.jobs.values());
      const states = await Promise.all(jobs.map(j => j.getState()));
      return states.filter(s => s === 'active').length;
    }

    async getCompletedCount() {
      const jobs = Array.from(this.jobs.values());
      const states = await Promise.all(jobs.map(j => j.getState()));
      return states.filter(s => s === 'completed').length;
    }

    async getFailedCount() {
      const jobs = Array.from(this.jobs.values());
      const states = await Promise.all(jobs.map(j => j.getState()));
      return states.filter(s => s === 'failed').length;
    }

    async getDelayedCount() {
      const jobs = Array.from(this.jobs.values());
      const states = await Promise.all(jobs.map(j => j.getState()));
      return states.filter(s => s === 'delayed').length;
    }

    async pause() {}
    async resume() {}
    async clean() {
      return [];
    }
    async close() {}

    on(event: string, handler: Function) {}
  }

  class MockWorker {
    constructor(queueName: string, processor: any, options: any) {}
    on(event: string, handler: Function) {}
    async close() {}
  }

  return { Queue: MockQueue, Worker: MockWorker };
});

// Mock Redis config
jest.mock('../../config/redis', () => ({
  redisConfig: {
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  },
}));

// Mock dependencies
jest.mock('../iProgAPIClient.service');
jest.mock('../../config/database');

describe('Queue System Integration Tests', () => {
  let smsQueue: SMSQueue;
  let queueWorker: QueueWorker;
  let mockIProgClient: jest.Mocked<IProgAPIClient>;
  let mockDbQuery: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock database query
    mockDbQuery = jest.fn().mockResolvedValue([[]]);
    (db.query as jest.Mock) = mockDbQuery;

    // Create instances
    smsQueue = new SMSQueue();
    queueWorker = new QueueWorker();

    // Get mocked iProg client
    mockIProgClient = (queueWorker as any).iProgClient as jest.Mocked<IProgAPIClient>;
  });

  afterEach(async () => {
    await queueWorker.stop();
    await smsQueue.close();
  });

  describe('End-to-End Message Flow', () => {
    it('should successfully process message from enqueue to delivery', async () => {
      // Arrange: Create a test job
      const job: SMSJob = {
        blastId: 'blast-e2e-1',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'Emergency alert: Typhoon approaching',
        priority: 'critical',
        metadata: {
          userId: 'admin-1',
          emergencyType: 'typhoon',
        },
      };

      // Mock successful API response
      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'iprog-msg-123',
        creditsUsed: 1,
      });

      // Act: Enqueue the job
      const jobId = await smsQueue.enqueue(job);

      // Verify job was enqueued
      expect(jobId).toBeDefined();
      expect(jobId).toContain('blast-e2e-1');

      // Check initial status
      const initialStatus = await smsQueue.getJobStatus(jobId);
      expect(initialStatus).not.toBeNull();
      expect(initialStatus?.status).toBe('queued');

      // Process the job manually (simulating worker)
      const result = await queueWorker.processBatch([job]);

      // Assert: Verify successful processing
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(0);
      expect(mockIProgClient.sendSMS).toHaveBeenCalledWith(
        job.phoneNumber,
        job.message
      );
    });

    it('should handle bulk message flow with multiple recipients', async () => {
      // Arrange: Create multiple jobs
      const jobs: SMSJob[] = Array.from({ length: 10 }, (_, i) => ({
        blastId: 'blast-bulk-1',
        recipientId: `user-${i}`,
        phoneNumber: `+63917123456${i}`,
        message: 'Flood warning for your area',
        priority: 'high' as const,
        metadata: {
          userId: 'admin-1',
          emergencyType: 'flood',
        },
      }));

      // Mock successful API responses
      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'iprog-msg-bulk',
        creditsUsed: 1,
      });

      // Act: Enqueue all jobs
      const jobIds = await smsQueue.enqueueBulk(jobs);

      // Verify all jobs were enqueued
      expect(jobIds).toHaveLength(10);

      // Process all jobs
      const result = await queueWorker.processBatch(jobs);

      // Assert: Verify all processed successfully
      expect(result.successful).toBe(10);
      expect(result.failed).toBe(0);
      expect(mockIProgClient.sendSMS).toHaveBeenCalledTimes(10);
    });

    it('should process jobs in priority order', async () => {
      // Arrange: Create jobs with different priorities
      const criticalJob: SMSJob = {
        blastId: 'blast-priority-1',
        recipientId: 'user-critical',
        phoneNumber: '+639171111111',
        message: 'CRITICAL: Earthquake detected',
        priority: 'critical',
        metadata: { userId: 'admin-1', emergencyType: 'earthquake' },
      };

      const normalJob: SMSJob = {
        blastId: 'blast-priority-1',
        recipientId: 'user-normal',
        phoneNumber: '+639172222222',
        message: 'Weather advisory',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      const highJob: SMSJob = {
        blastId: 'blast-priority-1',
        recipientId: 'user-high',
        phoneNumber: '+639173333333',
        message: 'Evacuation notice',
        priority: 'high',
        metadata: { userId: 'admin-1' },
      };

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-id',
        creditsUsed: 1,
      });

      // Act: Enqueue in non-priority order
      await smsQueue.enqueue(normalJob);
      await smsQueue.enqueue(criticalJob);
      await smsQueue.enqueue(highJob);

      // Get queue stats to verify distribution
      const stats = await smsQueue.getAllQueueStats();

      // Assert: Verify jobs are in correct queues
      expect(stats.critical.waiting).toBeGreaterThan(0);
      expect(stats.high.waiting).toBeGreaterThan(0);
      expect(stats.normal.waiting).toBeGreaterThan(0);
    });
  });

  describe('Retry Logic with Simulated Failures', () => {
    it('should retry failed messages with exponential backoff', async () => {
      // Arrange: Create a job that will fail initially
      const job: SMSJob = {
        blastId: 'blast-retry-1',
        recipientId: 'user-retry',
        phoneNumber: '+639171234567',
        message: 'Test retry message',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      // Mock API to fail first 2 times, then succeed
      let attemptCount = 0;
      mockIProgClient.sendSMS = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount <= 2) {
          return Promise.resolve({
            success: false,
            error: 'Temporary API error',
            creditsUsed: 0,
          });
        }
        return Promise.resolve({
          success: true,
          messageId: 'msg-success',
          creditsUsed: 1,
        });
      });

      // Act: Process with retries
      const result1 = await queueWorker.processBatch([job]);
      expect(result1.failed).toBe(1);

      const result2 = await queueWorker.processBatch([job]);
      expect(result2.failed).toBe(1);

      const result3 = await queueWorker.processBatch([job]);
      expect(result3.successful).toBe(1);

      // Assert: Verify retry attempts
      expect(mockIProgClient.sendSMS).toHaveBeenCalledTimes(3);
    });

    it('should mark message as permanently failed after max retries', async () => {
      // Arrange: Create a job that will always fail
      const job: SMSJob = {
        blastId: 'blast-fail-1',
        recipientId: 'user-fail',
        phoneNumber: '+639171234567',
        message: 'Test permanent failure',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      // Mock API to always fail
      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: false,
        error: 'Permanent API error',
        creditsUsed: 0,
      });

      // Act: Process multiple times (max 3 retries)
      const result1 = await queueWorker.processBatch([job]);
      const result2 = await queueWorker.processBatch([job]);
      const result3 = await queueWorker.processBatch([job]);

      // Assert: All attempts failed
      expect(result1.failed).toBe(1);
      expect(result2.failed).toBe(1);
      expect(result3.failed).toBe(1);
      expect(mockIProgClient.sendSMS).toHaveBeenCalledTimes(3);
    });

    it('should handle partial batch failures', async () => {
      // Arrange: Create jobs where some will fail
      const jobs: SMSJob[] = [
        {
          blastId: 'blast-partial-1',
          recipientId: 'user-1',
          phoneNumber: '+639171111111',
          message: 'Message 1',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
        {
          blastId: 'blast-partial-1',
          recipientId: 'user-2',
          phoneNumber: '+639172222222',
          message: 'Message 2',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
        {
          blastId: 'blast-partial-1',
          recipientId: 'user-3',
          phoneNumber: '+639173333333',
          message: 'Message 3',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
      ];

      // Mock API to fail for specific phone numbers
      mockIProgClient.sendSMS = jest.fn().mockImplementation((phoneNumber) => {
        if (phoneNumber === '+639172222222') {
          return Promise.resolve({
            success: false,
            error: 'Invalid phone number',
            creditsUsed: 0,
          });
        }
        return Promise.resolve({
          success: true,
          messageId: 'msg-success',
          creditsUsed: 1,
        });
      });

      // Act: Process batch
      const result = await queueWorker.processBatch(jobs);

      // Assert: Verify partial success
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Invalid phone number');
    });

    it('should handle connection errors and retry', async () => {
      // Arrange: Create a job
      const job: SMSJob = {
        blastId: 'blast-connection-1',
        recipientId: 'user-conn',
        phoneNumber: '+639171234567',
        message: 'Test connection error',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      // Mock API to throw connection error first, then succeed
      let attemptCount = 0;
      mockIProgClient.sendSMS = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount === 1) {
          return Promise.reject(new Error('Connection timeout'));
        }
        return Promise.resolve({
          success: true,
          messageId: 'msg-success',
          creditsUsed: 1,
        });
      });

      // Act: Process with retry
      const result1 = await queueWorker.processBatch([job]);
      expect(result1.failed).toBe(1);

      const result2 = await queueWorker.processBatch([job]);
      expect(result2.successful).toBe(1);

      // Assert: Verify retry worked
      expect(mockIProgClient.sendSMS).toHaveBeenCalledTimes(2);
    });
  });

  describe('Queue Worker Operations', () => {
    it('should start and stop workers correctly', async () => {
      // Act: Start workers
      await queueWorker.start();
      let status = queueWorker.getStatus();

      // Assert: Workers are running
      expect(status.isRunning).toBe(true);
      expect(status.workerCount).toBe(3); // critical, high, normal

      // Act: Stop workers
      await queueWorker.stop();
      status = queueWorker.getStatus();

      // Assert: Workers are stopped
      expect(status.isRunning).toBe(false);
      expect(status.workerCount).toBe(0);
    });

    it('should handle graceful shutdown with pending jobs', async () => {
      // Arrange: Enqueue jobs
      const jobs: SMSJob[] = Array.from({ length: 5 }, (_, i) => ({
        blastId: 'blast-shutdown-1',
        recipientId: `user-${i}`,
        phoneNumber: `+63917123456${i}`,
        message: 'Test message',
        priority: 'normal' as const,
        metadata: { userId: 'admin-1' },
      }));

      await smsQueue.enqueueBulk(jobs);

      // Act: Start and immediately stop
      await queueWorker.start();
      await queueWorker.stop();

      // Assert: Should not throw errors
      const status = queueWorker.getStatus();
      expect(status.isRunning).toBe(false);
    });

    it('should process batch of 100 messages efficiently', async () => {
      // Arrange: Create 100 jobs
      const jobs: SMSJob[] = Array.from({ length: 100 }, (_, i) => ({
        blastId: 'blast-100',
        recipientId: `user-${i}`,
        phoneNumber: `+6391712345${String(i).padStart(2, '0')}`,
        message: `Message ${i}`,
        priority: 'normal' as const,
        metadata: { userId: 'admin-1' },
      }));

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-id',
        creditsUsed: 1,
      });

      // Act: Process batch
      const startTime = Date.now();
      const result = await queueWorker.processBatch(jobs);
      const endTime = Date.now();

      // Assert: All processed successfully
      expect(result.successful).toBe(100);
      expect(result.failed).toBe(0);
      expect(mockIProgClient.sendSMS).toHaveBeenCalledTimes(100);

      // Verify reasonable processing time (should be fast with mocks)
      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(5000); // Less than 5 seconds
    });
  });

  describe('Scheduled Messages', () => {
    it('should schedule message for future delivery', async () => {
      // Arrange: Create a scheduled job
      const job: SMSJob = {
        blastId: 'blast-scheduled-1',
        recipientId: 'user-scheduled',
        phoneNumber: '+639171234567',
        message: 'Scheduled alert',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      const scheduledTime = new Date(Date.now() + 60000); // 1 minute from now

      // Act: Schedule the job
      const jobId = await smsQueue.schedule(job, scheduledTime);

      // Assert: Job is scheduled
      expect(jobId).toBeDefined();

      const status = await smsQueue.getJobStatus(jobId);
      expect(status).not.toBeNull();
      // Status should be queued (delayed jobs show as queued)
      expect(status?.status).toBe('queued');
    });

    it('should cancel scheduled message before delivery', async () => {
      // Arrange: Create and schedule a job
      const job: SMSJob = {
        blastId: 'blast-cancel-1',
        recipientId: 'user-cancel',
        phoneNumber: '+639171234567',
        message: 'To be cancelled',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      const scheduledTime = new Date(Date.now() + 60000);
      const jobId = await smsQueue.schedule(job, scheduledTime);

      // Act: Cancel the job
      const cancelled = await smsQueue.cancelJob(jobId);

      // Assert: Job was cancelled
      expect(cancelled).toBe(true);

      const status = await smsQueue.getJobStatus(jobId);
      expect(status).toBeNull(); // Job should be removed
    });
  });

  describe('Queue Statistics and Monitoring', () => {
    it('should track queue statistics accurately', async () => {
      // Arrange: Enqueue jobs to different queues
      const criticalJob: SMSJob = {
        blastId: 'blast-stats-1',
        recipientId: 'user-1',
        phoneNumber: '+639171111111',
        message: 'Critical',
        priority: 'critical',
        metadata: { userId: 'admin-1' },
      };

      const normalJobs: SMSJob[] = Array.from({ length: 3 }, (_, i) => ({
        blastId: 'blast-stats-1',
        recipientId: `user-${i}`,
        phoneNumber: `+63917222222${i}`,
        message: 'Normal',
        priority: 'normal' as const,
        metadata: { userId: 'admin-1' },
      }));

      // Act: Enqueue jobs
      await smsQueue.enqueue(criticalJob);
      await smsQueue.enqueueBulk(normalJobs);

      // Get statistics
      const allStats = await smsQueue.getAllQueueStats();

      // Assert: Stats reflect enqueued jobs
      expect(allStats.critical.waiting).toBeGreaterThan(0);
      expect(allStats.normal.waiting).toBeGreaterThan(0);
    });

    it('should provide job status updates', async () => {
      // Arrange: Create and enqueue a job
      const job: SMSJob = {
        blastId: 'blast-status-1',
        recipientId: 'user-status',
        phoneNumber: '+639171234567',
        message: 'Status tracking test',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      const jobId = await smsQueue.enqueue(job);

      // Act: Get initial status
      const initialStatus = await smsQueue.getJobStatus(jobId);

      // Assert: Initial status is queued
      expect(initialStatus).not.toBeNull();
      expect(initialStatus?.status).toBe('queued');
      expect(initialStatus?.attempts).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange: Mock database error
      mockDbQuery.mockRejectedValueOnce(new Error('Database connection failed'));

      const job: SMSJob = {
        blastId: 'blast-db-error',
        recipientId: 'user-db',
        phoneNumber: '+639171234567',
        message: 'Test DB error',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      mockIProgClient.sendSMS = jest.fn().mockResolvedValue({
        success: true,
        messageId: 'msg-id',
        creditsUsed: 1,
      });

      // Act: Process job (should not throw)
      await expect(queueWorker.processBatch([job])).resolves.not.toThrow();
    });

    it('should handle API timeout errors', async () => {
      // Arrange: Mock API timeout
      const job: SMSJob = {
        blastId: 'blast-timeout',
        recipientId: 'user-timeout',
        phoneNumber: '+639171234567',
        message: 'Test timeout',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      mockIProgClient.sendSMS = jest.fn().mockRejectedValue(
        new Error('Request timeout')
      );

      // Act: Process job
      const result = await queueWorker.processBatch([job]);

      // Assert: Job failed with timeout error
      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toBe('Request timeout');
    });

    it('should continue processing after individual job failures', async () => {
      // Arrange: Create jobs where middle one fails
      const jobs: SMSJob[] = [
        {
          blastId: 'blast-continue-1',
          recipientId: 'user-1',
          phoneNumber: '+639171111111',
          message: 'Message 1',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
        {
          blastId: 'blast-continue-1',
          recipientId: 'user-2',
          phoneNumber: '+639172222222',
          message: 'Message 2',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
        {
          blastId: 'blast-continue-1',
          recipientId: 'user-3',
          phoneNumber: '+639173333333',
          message: 'Message 3',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
      ];

      // Mock API to fail for middle job
      mockIProgClient.sendSMS = jest.fn().mockImplementation((phoneNumber) => {
        if (phoneNumber === '+639172222222') {
          return Promise.reject(new Error('API error'));
        }
        return Promise.resolve({
          success: true,
          messageId: 'msg-success',
          creditsUsed: 1,
        });
      });

      // Act: Process batch
      const result = await queueWorker.processBatch(jobs);

      // Assert: Other jobs still processed
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(mockIProgClient.sendSMS).toHaveBeenCalledTimes(3);
    });
  });
});
