/**
 * SMSQueue Service Tests
 * 
 * Tests for SMS queue operations including enqueue, bulk enqueue,
 * scheduling, status tracking, and job cancellation.
 */

import { SMSQueue, SMSJob, Priority } from '../smsQueue.service';

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

  return { Queue: MockQueue };
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

describe('SMSQueue Service', () => {
  let smsQueue: SMSQueue;

  beforeEach(() => {
    smsQueue = new SMSQueue();
  });

  afterEach(async () => {
    await smsQueue.close();
  });

  describe('enqueue', () => {
    it('should enqueue a single SMS job', async () => {
      const job: SMSJob = {
        blastId: 'blast-1',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'Test message',
        priority: 'normal',
        metadata: {
          userId: 'admin-1',
          emergencyType: 'typhoon',
        },
      };

      const jobId = await smsQueue.enqueue(job);

      expect(jobId).toBeDefined();
      expect(jobId).toContain('blast-1');
    });

    it('should enqueue critical priority jobs to critical queue', async () => {
      const job: SMSJob = {
        blastId: 'blast-2',
        recipientId: 'user-2',
        phoneNumber: '+639181234567',
        message: 'Critical alert',
        priority: 'critical',
        metadata: {
          userId: 'admin-1',
        },
      };

      const jobId = await smsQueue.enqueue(job);

      expect(jobId).toBeDefined();
      
      const status = await smsQueue.getJobStatus(jobId);
      expect(status).not.toBeNull();
      expect(status?.status).toBe('queued');
    });
  });

  describe('enqueueBulk', () => {
    it('should enqueue multiple SMS jobs', async () => {
      const jobs: SMSJob[] = [
        {
          blastId: 'blast-3',
          recipientId: 'user-1',
          phoneNumber: '+639171234567',
          message: 'Bulk message 1',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
        {
          blastId: 'blast-3',
          recipientId: 'user-2',
          phoneNumber: '+639181234567',
          message: 'Bulk message 2',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
        {
          blastId: 'blast-3',
          recipientId: 'user-3',
          phoneNumber: '+639191234567',
          message: 'Bulk message 3',
          priority: 'high',
          metadata: { userId: 'admin-1' },
        },
      ];

      const jobIds = await smsQueue.enqueueBulk(jobs);

      expect(jobIds).toHaveLength(3);
      expect(jobIds.every(id => id !== '')).toBe(true);
    });

    it('should return empty array for empty job list', async () => {
      const jobIds = await smsQueue.enqueueBulk([]);

      expect(jobIds).toEqual([]);
    });

    it('should group jobs by priority', async () => {
      const jobs: SMSJob[] = [
        {
          blastId: 'blast-4',
          recipientId: 'user-1',
          phoneNumber: '+639171234567',
          message: 'Critical message',
          priority: 'critical',
          metadata: { userId: 'admin-1' },
        },
        {
          blastId: 'blast-4',
          recipientId: 'user-2',
          phoneNumber: '+639181234567',
          message: 'Normal message',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
      ];

      const jobIds = await smsQueue.enqueueBulk(jobs);

      expect(jobIds).toHaveLength(2);
    });
  });

  describe('schedule', () => {
    it('should schedule a job for future delivery', async () => {
      const job: SMSJob = {
        blastId: 'blast-5',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'Scheduled message',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      const scheduledTime = new Date(Date.now() + 60000); // 1 minute from now

      const jobId = await smsQueue.schedule(job, scheduledTime);

      expect(jobId).toBeDefined();
    });

    it('should throw error for past scheduled time', async () => {
      const job: SMSJob = {
        blastId: 'blast-6',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'Past message',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      const pastTime = new Date(Date.now() - 60000); // 1 minute ago

      await expect(smsQueue.schedule(job, pastTime)).rejects.toThrow(
        'Scheduled time must be in the future'
      );
    });
  });

  describe('getJobStatus', () => {
    it('should return job status for existing job', async () => {
      const job: SMSJob = {
        blastId: 'blast-7',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'Status test',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      const jobId = await smsQueue.enqueue(job);
      const status = await smsQueue.getJobStatus(jobId);

      expect(status).not.toBeNull();
      expect(status?.jobId).toBe(jobId);
      expect(status?.status).toBe('queued');
      expect(status?.attempts).toBe(0);
    });

    it('should return null for non-existent job', async () => {
      const status = await smsQueue.getJobStatus('non-existent-job');

      expect(status).toBeNull();
    });
  });

  describe('cancelJob', () => {
    it('should cancel a waiting job', async () => {
      const job: SMSJob = {
        blastId: 'blast-8',
        recipientId: 'user-1',
        phoneNumber: '+639171234567',
        message: 'Cancel test',
        priority: 'normal',
        metadata: { userId: 'admin-1' },
      };

      const jobId = await smsQueue.enqueue(job);
      const cancelled = await smsQueue.cancelJob(jobId);

      expect(cancelled).toBe(true);

      const status = await smsQueue.getJobStatus(jobId);
      expect(status).toBeNull();
    });

    it('should return false for non-existent job', async () => {
      const cancelled = await smsQueue.cancelJob('non-existent-job');

      expect(cancelled).toBe(false);
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      const jobs: SMSJob[] = [
        {
          blastId: 'blast-9',
          recipientId: 'user-1',
          phoneNumber: '+639171234567',
          message: 'Stats test 1',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
        {
          blastId: 'blast-9',
          recipientId: 'user-2',
          phoneNumber: '+639181234567',
          message: 'Stats test 2',
          priority: 'normal',
          metadata: { userId: 'admin-1' },
        },
      ];

      await smsQueue.enqueueBulk(jobs);

      const stats = await smsQueue.getQueueStats('normal');

      expect(stats).toHaveProperty('waiting');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('delayed');
    });
  });

  describe('getAllQueueStats', () => {
    it('should return statistics for all queues', async () => {
      const allStats = await smsQueue.getAllQueueStats();

      expect(allStats).toHaveProperty('critical');
      expect(allStats).toHaveProperty('high');
      expect(allStats).toHaveProperty('normal');
      expect(allStats.critical).toHaveProperty('waiting');
      expect(allStats.high).toHaveProperty('waiting');
      expect(allStats.normal).toHaveProperty('waiting');
    });
  });

  describe('pauseQueue and resumeQueue', () => {
    it('should pause and resume a queue', async () => {
      await expect(smsQueue.pauseQueue('normal')).resolves.not.toThrow();
      await expect(smsQueue.resumeQueue('normal')).resolves.not.toThrow();
    });
  });
});
