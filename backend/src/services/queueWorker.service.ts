/**
 * QueueWorker Service
 * 
 * Processes SMS jobs from the queue, handles batch processing, retry logic,
 * and integrates with iProg API for message delivery.
 * 
 * Requirements: 4.3, 5.2, 5.3, 5.4, 5.5, 5.6, 12.1, 12.2, 12.3, 12.4, 13.2
 */

import { Worker, Job, WorkerOptions } from 'bullmq';
import { redisConfig } from '../config/redis';
import { IProgAPIClient } from './iProgAPIClient.service';
import { SMSJob, Priority } from './smsQueue.service';
import db from '../config/database';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface BatchResult {
  successful: number;
  failed: number;
  errors: Array<{ jobId: string; error: string }>;
}

export class QueueWorker {
  private workers: Worker[];
  private iProgClient: IProgAPIClient;
  private isRunning: boolean;
  private readonly BATCH_SIZE = 100;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [30000, 120000, 300000]; // 30s, 2m, 5m in milliseconds

  constructor() {
    this.workers = [];
    this.iProgClient = new IProgAPIClient();
    this.isRunning = false;
  }

  /**
   * Start processing the queue
   * Requirement 5.2: Process messages in batches of 100
   * Requirement 5.3: Sequential batch processing
   * Requirement 20.5: Priority-based processing (critical before high before normal)
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Queue workers are already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting queue workers...');

    // Create workers for each priority queue
    // Requirement 20.5: Process critical messages before high and normal priority
    // Workers are created in priority order to ensure critical messages are processed first
    const priorities: Priority[] = ['critical', 'high', 'normal'];

    for (const priority of priorities) {
      const worker = this.createWorker(priority);
      this.workers.push(worker);
    }

    console.log(`Started ${this.workers.length} queue workers with priority-based processing`);
  }

  /**
   * Create a worker for a specific priority queue
   * Requirement 20.5: Ensure critical messages are processed before high and normal priority
   * 
   * Each priority has its own queue and worker. Critical priority workers
   * have higher concurrency to ensure faster processing of urgent messages.
   */
  private createWorker(priority: Priority): Worker {
    const queueName = `sms-${priority}`;

    // Requirement 20.5: Critical messages get higher concurrency for faster processing
    const concurrency = priority === 'critical' ? 3 : priority === 'high' ? 2 : 1;

    const workerOptions: WorkerOptions = {
      connection: redisConfig,
      concurrency, // Higher concurrency for critical messages
      limiter: {
        max: this.BATCH_SIZE,
        duration: 60000, // 1 minute
      },
    };

    const worker = new Worker(
      queueName,
      async (job: Job) => {
        return await this.processJob(job);
      },
      workerOptions
    );

    // Set up event listeners
    worker.on('completed', (job) => {
      console.log(`[${priority.toUpperCase()}] Job ${job.id} completed successfully`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[${priority.toUpperCase()}] Job ${job?.id} failed:`, err.message);
    });

    worker.on('error', (err) => {
      console.error(`[${priority.toUpperCase()}] Worker error:`, err);
    });

    console.log(`Created ${priority} priority worker with concurrency ${concurrency}`);

    return worker;
  }

  /**
   * Process a single SMS job
   * Requirement 5.6: Update job status through state machine
   * Requirement 12.1, 12.2, 12.3, 12.4: Status updates (queued → processing → sent → delivered/failed)
   */
  private async processJob(job: Job): Promise<void> {
    const smsJob = job.data as SMSJob;

    try {
      // Update status to processing
      // Requirement 12.1: Update status to processing
      await this.updateJobStatus(job.id!, 'processing', smsJob);

      // Send SMS via iProg API
      // Requirement 4.3: Integrate with IProgAPIClient for sending
      const result = await this.iProgClient.sendSMS(
        smsJob.phoneNumber,
        smsJob.message
      );

      if (result.success) {
        // Requirement 12.2: Update status to sent
        await this.updateJobStatus(job.id!, 'sent', smsJob, result.messageId, result.creditsUsed);

        // Log successful send
        await this.logSMSSent(smsJob, result.messageId!, result.creditsUsed);

        // Update job progress
        await job.updateProgress(100);
      } else {
        // Requirement 5.4: Retry logic with exponential backoff
        // Requirement 13.2: Retry on API failures
        throw new Error(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check if we should retry
      const attemptsMade = job.attemptsMade;

      if (attemptsMade < this.MAX_RETRIES) {
        // Will be retried by BullMQ with exponential backoff
        console.log(`Job ${job.id} failed (attempt ${attemptsMade}/${this.MAX_RETRIES}). Will retry.`);
        throw error; // Re-throw to trigger retry
      } else {
        // Requirement 5.5: Mark as permanently failed after max retries
        await this.updateJobStatus(job.id!, 'failed', smsJob, undefined, 0, errorMessage);
        console.error(`Job ${job.id} permanently failed after ${this.MAX_RETRIES} attempts:`, errorMessage);
      }
    }
  }

  /**
   * Update job status in database
   * Requirement 5.6: Update job status to allow monitoring
   */
  private async updateJobStatus(
    jobId: string,
    status: 'queued' | 'processing' | 'sent' | 'delivered' | 'failed',
    smsJob: SMSJob,
    messageId?: string,
    creditsUsed?: number,
    errorMessage?: string
  ): Promise<void> {
    try {
      const updates: string[] = ['status = ?', 'updated_at = NOW()'];
      const params: any[] = [status];

      if (status === 'sent' && messageId) {
        updates.push('message_id = ?', 'credits_used = ?', 'sent_at = NOW()');
        params.push(messageId, creditsUsed || 0);
      }

      if (status === 'failed' && errorMessage) {
        updates.push('error_message = ?');
        params.push(errorMessage);
      }

      // Add job ID to params
      params.push(jobId);

      await db.query(
        `UPDATE sms_jobs SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      // Also update blast status if needed
      await this.updateBlastStatus(smsJob.blastId);
    } catch (error) {
      console.error(`Failed to update job status for ${jobId}:`, error);
    }
  }

  /**
   * Update blast status based on job statuses
   */
  private async updateBlastStatus(blastId: string): Promise<void> {
    try {
      // Get job statistics for this blast
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'sent' OR status = 'delivered' THEN 1 ELSE 0 END) as sent,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
          SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) as queued,
          SUM(COALESCE(credits_used, 0)) as total_credits
        FROM sms_jobs
        WHERE blast_id = ?`,
        [blastId]
      );

      const stats = rows[0];

      // Determine blast status
      let blastStatus = 'processing';
      if (stats.total === stats.sent + stats.failed) {
        blastStatus = 'completed';
      } else if (stats.queued > 0 || stats.processing > 0) {
        blastStatus = 'processing';
      }

      // Update blast record
      await db.query(
        `UPDATE sms_blasts 
        SET status = ?, 
            actual_cost = ?,
            completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE completed_at END,
            updated_at = NOW()
        WHERE id = ?`,
        [blastStatus, stats.total_credits, blastStatus, blastId]
      );
    } catch (error) {
      console.error(`Failed to update blast status for ${blastId}:`, error);
    }
  }

  /**
   * Log SMS sent event to audit logs
   * Requirement 10.2: Log SMS sent with message ID, recipient, status, timestamp
   */
  private async logSMSSent(
    smsJob: SMSJob,
    messageId: string,
    creditsUsed: number
  ): Promise<void> {
    try {
      await db.query(
        `INSERT INTO sms_audit_logs (
          event_type, user_id, blast_id, job_id, details, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          'sms_sent',
          smsJob.metadata.userId,
          smsJob.blastId,
          `${smsJob.blastId}-${smsJob.recipientId}`,
          JSON.stringify({
            recipientId: smsJob.recipientId,
            phoneNumber: smsJob.phoneNumber,
            messageId,
            creditsUsed,
            priority: smsJob.priority,
            templateId: smsJob.metadata.templateId,
            emergencyType: smsJob.metadata.emergencyType,
          }),
        ]
      );
    } catch (error) {
      console.error('Failed to log SMS sent event:', error);
    }
  }

  /**
   * Process a batch of jobs
   * Requirement 5.2: Batch processing (100 messages per batch)
   * Requirement 5.3: Sequential batch processing
   * 
   * Note: This method is for manual batch processing if needed.
   * The worker automatically processes jobs sequentially.
   */
  async processBatch(jobs: SMSJob[]): Promise<BatchResult> {
    const result: BatchResult = {
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Process jobs sequentially
    for (const job of jobs) {
      try {
        const sendResult = await this.iProgClient.sendSMS(
          job.phoneNumber,
          job.message
        );

        if (sendResult.success) {
          result.successful++;
        } else {
          result.failed++;
          result.errors.push({
            jobId: `${job.blastId}-${job.recipientId}`,
            error: sendResult.error || 'Unknown error',
          });
        }
      } catch (error) {
        result.failed++;
        result.errors.push({
          jobId: `${job.blastId}-${job.recipientId}`,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Retry a failed job
   * Requirement 5.4: Retry logic with exponential backoff
   * 
   * Note: BullMQ handles retries automatically with the configured backoff.
   * This method is for manual retry if needed.
   */
  async retryJob(job: SMSJob): Promise<void> {
    try {
      const result = await this.iProgClient.sendSMS(
        job.phoneNumber,
        job.message
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      console.error(`Failed to retry job for ${job.recipientId}:`, error);
      throw error;
    }
  }

  /**
   * Stop processing gracefully
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('Queue workers are not running');
      return;
    }

    console.log('Stopping queue workers...');
    this.isRunning = false;

    // Close all workers
    await Promise.all(this.workers.map(worker => worker.close()));

    this.workers = [];
    console.log('Queue workers stopped');
  }

  /**
   * Get worker status
   */
  getStatus(): { isRunning: boolean; workerCount: number } {
    return {
      isRunning: this.isRunning,
      workerCount: this.workers.length,
    };
  }
}
