/**
 * SMSQueue Service
 * 
 * Manages SMS message queue using BullMQ for reliable bulk message delivery.
 * Implements queue operations, job scheduling, and status tracking.
 * 
 * Requirements: 5.1, 5.6, 7.3, 7.5, 7.6
 */

import { Queue, QueueOptions, Job, JobsOptions } from 'bullmq';
import { redisConfig } from '../config/redis';

export type Priority = 'critical' | 'high' | 'normal';
export type JobStatus = 'queued' | 'processing' | 'sent' | 'delivered' | 'failed';

export interface SMSJob {
  blastId: string;
  recipientId: string;
  phoneNumber: string;
  message: string;
  priority: Priority;
  metadata: {
    userId: string;
    templateId?: string;
    emergencyType?: string;
  };
}

export interface JobStatusResult {
  jobId: string;
  status: JobStatus;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
  progress?: number;
}

export class SMSQueue {
  private criticalQueue: Queue;
  private highQueue: Queue;
  private normalQueue: Queue;

  constructor() {
    const queueOptions: QueueOptions = {
      connection: redisConfig,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: parseInt(process.env.SMS_QUEUE_RETRY_DELAY_BASE || '30', 10) * 1000, // 30 seconds base
        },
        removeOnComplete: {
          age: parseInt(process.env.SMS_QUEUE_COMPLETED_RETENTION || '604800', 10), // 7 days in seconds
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: parseInt(process.env.SMS_QUEUE_FAILED_RETENTION || '2592000', 10), // 30 days in seconds
        },
      },
    };

    // Create separate queues for each priority level
    // Requirement 5.1: Set up separate queues for critical, high, and normal priorities
    this.criticalQueue = new Queue('sms-critical', queueOptions);
    this.highQueue = new Queue('sms-high', queueOptions);
    this.normalQueue = new Queue('sms-normal', queueOptions);

    this.setupEventListeners();
  }

  /**
   * Set up event listeners for queue monitoring
   */
  private setupEventListeners(): void {
    const queues = [
      { name: 'critical', queue: this.criticalQueue },
      { name: 'high', queue: this.highQueue },
      { name: 'normal', queue: this.normalQueue },
    ];

    queues.forEach(({ name, queue }) => {
      queue.on('error', (error) => {
        console.error(`[${name} queue] Error:`, error);
      });

      // Note: BullMQ v5 uses QueueEvents for job lifecycle events
      // These basic error handlers are sufficient for queue management
    });
  }

  /**
   * Get the appropriate queue based on priority
   */
  private getQueueByPriority(priority: Priority): Queue {
    switch (priority) {
      case 'critical':
        return this.criticalQueue;
      case 'high':
        return this.highQueue;
      case 'normal':
        return this.normalQueue;
      default:
        return this.normalQueue;
    }
  }

  /**
   * Add a single SMS message to the queue
   * Requirement 5.1: Create SMS_Queue jobs for all valid recipients
   * 
   * @param job - SMS job data
   * @returns Job ID
   */
  async enqueue(job: SMSJob): Promise<string> {
    const queue = this.getQueueByPriority(job.priority);

    const bullJob = await queue.add(
      'send-sms',
      job,
      {
        jobId: `${job.blastId}-${job.recipientId}`,
        priority: this.getPriorityValue(job.priority),
      }
    );

    return bullJob.id || '';
  }

  /**
   * Add multiple SMS messages to the queue in bulk
   * Requirement 5.1: Create SMS_Queue jobs for all valid recipients
   * 
   * @param jobs - Array of SMS job data
   * @returns Array of job IDs
   */
  async enqueueBulk(jobs: SMSJob[]): Promise<string[]> {
    if (jobs.length === 0) {
      return [];
    }

    // Group jobs by priority
    const jobsByPriority: Record<Priority, SMSJob[]> = {
      critical: [],
      high: [],
      normal: [],
    };

    jobs.forEach(job => {
      jobsByPriority[job.priority].push(job);
    });

    const jobIds: string[] = [];

    // Add jobs to respective queues
    for (const [priority, priorityJobs] of Object.entries(jobsByPriority)) {
      if (priorityJobs.length === 0) continue;

      const queue = this.getQueueByPriority(priority as Priority);
      const bullJobs = priorityJobs.map(job => ({
        name: 'send-sms',
        data: job,
        opts: {
          jobId: `${job.blastId}-${job.recipientId}`,
          priority: this.getPriorityValue(job.priority),
        },
      }));

      const addedJobs = await queue.addBulk(bullJobs);
      jobIds.push(...addedJobs.map(j => j.id || ''));
    }

    return jobIds;
  }

  /**
   * Schedule an SMS message for future delivery
   * Requirement 7.3: Store message with scheduled_time and process at specified time
   * 
   * @param job - SMS job data
   * @param scheduledTime - Time to send the message
   * @returns Job ID
   */
  async schedule(job: SMSJob, scheduledTime: Date): Promise<string> {
    const queue = this.getQueueByPriority(job.priority);
    const delay = scheduledTime.getTime() - Date.now();

    if (delay < 0) {
      throw new Error('Scheduled time must be in the future');
    }

    const bullJob = await queue.add(
      'send-sms',
      job,
      {
        jobId: `${job.blastId}-${job.recipientId}`,
        priority: this.getPriorityValue(job.priority),
        delay, // Delay in milliseconds
      }
    );

    return bullJob.id || '';
  }

  /**
   * Get the status of a job
   * Requirement 5.6: Update job status to allow administrators to monitor progress
   * 
   * @param jobId - Job ID
   * @returns Job status information
   */
  async getJobStatus(jobId: string): Promise<JobStatusResult | null> {
    // Search in all queues
    const queues = [this.criticalQueue, this.highQueue, this.normalQueue];

    for (const queue of queues) {
      const job = await queue.getJob(jobId);

      if (job) {
        const state = await job.getState();
        const failedReason = job.failedReason;
        const progress = job.progress;

        // Map BullMQ states to our JobStatus
        let status: JobStatus;
        switch (state) {
          case 'waiting':
          case 'delayed':
            status = 'queued';
            break;
          case 'active':
            status = 'processing';
            break;
          case 'completed':
            // Check if it's delivered or just sent (would need to check job data)
            status = 'sent';
            break;
          case 'failed':
            status = 'failed';
            break;
          default:
            status = 'queued';
        }

        return {
          jobId: job.id || '',
          status,
          attempts: job.attemptsMade,
          lastAttempt: job.processedOn ? new Date(job.processedOn) : undefined,
          error: failedReason,
          progress: typeof progress === 'number' ? progress : undefined,
        };
      }
    }

    return null;
  }

  /**
   * Cancel a scheduled job
   * Requirement 7.5: Allow user to edit or cancel scheduled message
   * Requirement 7.6: Remove from schedule and log cancellation
   * 
   * @param jobId - Job ID to cancel
   * @returns true if cancelled, false if not found
   */
  async cancelJob(jobId: string): Promise<boolean> {
    const queues = [this.criticalQueue, this.highQueue, this.normalQueue];

    for (const queue of queues) {
      const job = await queue.getJob(jobId);

      if (job) {
        const state = await job.getState();

        // Only allow cancellation of waiting or delayed jobs
        if (state === 'waiting' || state === 'delayed') {
          await job.remove();
          return true;
        } else {
          throw new Error(`Cannot cancel job in state: ${state}`);
        }
      }
    }

    return false;
  }

  /**
   * Get priority value for BullMQ (lower number = higher priority)
   */
  private getPriorityValue(priority: Priority): number {
    switch (priority) {
      case 'critical':
        return 1;
      case 'high':
        return 5;
      case 'normal':
        return 10;
      default:
        return 10;
    }
  }

  /**
   * Get queue statistics
   * 
   * @param priority - Queue priority
   * @returns Queue statistics
   */
  async getQueueStats(priority: Priority): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.getQueueByPriority(priority);

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Get all queue statistics
   * 
   * @returns Statistics for all queues
   */
  async getAllQueueStats(): Promise<Record<Priority, {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }>> {
    const [critical, high, normal] = await Promise.all([
      this.getQueueStats('critical'),
      this.getQueueStats('high'),
      this.getQueueStats('normal'),
    ]);

    return { critical, high, normal };
  }

  /**
   * Pause a queue
   * 
   * @param priority - Queue priority to pause
   */
  async pauseQueue(priority: Priority): Promise<void> {
    const queue = this.getQueueByPriority(priority);
    await queue.pause();
  }

  /**
   * Resume a paused queue
   * 
   * @param priority - Queue priority to resume
   */
  async resumeQueue(priority: Priority): Promise<void> {
    const queue = this.getQueueByPriority(priority);
    await queue.resume();
  }

  /**
   * Clean completed jobs older than specified age
   * 
   * @param priority - Queue priority
   * @param ageInSeconds - Age in seconds
   * @returns Number of jobs cleaned
   */
  async cleanCompletedJobs(priority: Priority, ageInSeconds: number): Promise<number> {
    const queue = this.getQueueByPriority(priority);
    const jobs = await queue.clean(ageInSeconds * 1000, 1000, 'completed');
    return jobs.length;
  }

  /**
   * Clean failed jobs older than specified age
   * 
   * @param priority - Queue priority
   * @param ageInSeconds - Age in seconds
   * @returns Number of jobs cleaned
   */
  async cleanFailedJobs(priority: Priority, ageInSeconds: number): Promise<number> {
    const queue = this.getQueueByPriority(priority);
    const jobs = await queue.clean(ageInSeconds * 1000, 1000, 'failed');
    return jobs.length;
  }

  /**
   * Close all queue connections
   */
  async close(): Promise<void> {
    await Promise.all([
      this.criticalQueue.close(),
      this.highQueue.close(),
      this.normalQueue.close(),
    ]);
  }
}
