/**
 * Credit Monitor Service
 * 
 * Monitors SMS credit balance and sends alerts when thresholds are reached.
 * Implements background job to check balance periodically.
 * Prevents sending when balance reaches zero.
 * 
 * Requirements: 11.2, 11.3, 11.4
 */

import pool from '../config/database';
import { IProgAPIClient } from './iProgAPIClient.service';
import nodemailer from 'nodemailer';

export interface CreditAlert {
  threshold: number;
  message: string;
  severity: 'warning' | 'critical';
}

export interface CreditStatus {
  balance: number;
  lastChecked: Date;
  alerts: CreditAlert[];
  canSend: boolean;
}

export class CreditMonitor {
  private iProgClient: IProgAPIClient;
  private emailTransporter: nodemailer.Transporter | null;
  private monitoringInterval: NodeJS.Timeout | null;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly THRESHOLD_WARNING = 1000;
  private readonly THRESHOLD_CRITICAL = 500;
  private readonly THRESHOLD_ZERO = 0;
  private lastAlertSent: Map<number, number>; // threshold -> timestamp
  private readonly ALERT_COOLDOWN = 60 * 60 * 1000; // 1 hour between same alerts

  /**
   * Initialize Credit Monitor
   * Requirement 11.2: Check credit balance periodically
   */
  constructor() {
    this.iProgClient = new IProgAPIClient();
    this.monitoringInterval = null;
    this.lastAlertSent = new Map();

    // Initialize email transporter if configured
    this.emailTransporter = this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter for sending alerts
   * 
   * @returns Nodemailer transporter or null if not configured
   */
  private initializeEmailTransporter(): nodemailer.Transporter | null {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.warn('Email configuration not found. Credit alerts will be logged only.');
      return null;
    }

    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587', 10),
      secure: false, // Use TLS
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });
  }

  /**
   * Start background monitoring job
   * Requirement 11.2: Create background job to check credit balance
   * 
   * @param immediate - If true, check immediately before starting interval
   */
  async startMonitoring(immediate: boolean = true): Promise<void> {
    // Stop existing monitoring if running
    this.stopMonitoring();

    console.log('Starting credit monitoring service...');

    // Check immediately if requested
    if (immediate) {
      await this.checkAndAlert();
    }

    // Set up periodic checking
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkAndAlert();
      } catch (error) {
        console.error('Error in credit monitoring:', error);
      }
    }, this.CHECK_INTERVAL);

    console.log(`Credit monitoring started. Checking every ${this.CHECK_INTERVAL / 1000} seconds.`);
  }

  /**
   * Stop background monitoring job
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Credit monitoring stopped.');
    }
  }

  /**
   * Check credit balance and send alerts if thresholds are crossed
   * Requirement 11.2: Send email alerts when balance falls below thresholds
   * Requirement 11.3: Display warning banners when balance is low
   * 
   * @returns CreditStatus with current balance and alerts
   */
  async checkAndAlert(): Promise<CreditStatus> {
    try {
      // Fetch current balance from iProg API
      const balance = await this.iProgClient.getBalance();
      const now = new Date();

      // Update balance in database
      await this.updateBalanceInDatabase(balance, now);

      // Determine alerts based on thresholds
      const alerts: CreditAlert[] = [];
      let canSend = true;

      // Requirement 11.4: Prevent sending when balance reaches zero
      if (balance <= this.THRESHOLD_ZERO) {
        alerts.push({
          threshold: this.THRESHOLD_ZERO,
          message: 'SMS credit balance is zero. Cannot send messages.',
          severity: 'critical'
        });
        canSend = false;
        await this.sendAlert(this.THRESHOLD_ZERO, balance, 'critical');
      }
      // Requirement 11.2: Alert when balance falls below 500 (critical)
      else if (balance <= this.THRESHOLD_CRITICAL) {
        alerts.push({
          threshold: this.THRESHOLD_CRITICAL,
          message: `SMS credit balance is critically low (${balance} credits remaining). Please recharge immediately.`,
          severity: 'critical'
        });
        await this.sendAlert(this.THRESHOLD_CRITICAL, balance, 'critical');
      }
      // Requirement 11.2: Alert when balance falls below 1000 (warning)
      else if (balance <= this.THRESHOLD_WARNING) {
        alerts.push({
          threshold: this.THRESHOLD_WARNING,
          message: `SMS credit balance is low (${balance} credits remaining). Consider recharging soon.`,
          severity: 'warning'
        });
        await this.sendAlert(this.THRESHOLD_WARNING, balance, 'warning');
      }

      return {
        balance,
        lastChecked: now,
        alerts,
        canSend
      };
    } catch (error) {
      console.error('Failed to check credit balance:', error);
      throw error;
    }
  }

  /**
   * Update balance in database
   * 
   * @param balance - Current balance
   * @param timestamp - Timestamp of check
   */
  private async updateBalanceInDatabase(balance: number, timestamp: Date): Promise<void> {
    try {
      // Check if a record exists
      const [rows] = await pool.query<any[]>(
        'SELECT id FROM sms_credits ORDER BY created_at DESC LIMIT 1'
      );

      if (rows.length > 0) {
        // Update existing record
        await pool.query(
          'UPDATE sms_credits SET balance = ?, last_checked = ?, updated_at = ? WHERE id = ?',
          [balance, timestamp, timestamp, rows[0].id]
        );
      } else {
        // Create new record
        const id = this.generateId();
        await pool.query(
          'INSERT INTO sms_credits (id, balance, last_checked, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [id, balance, timestamp, timestamp, timestamp]
        );
      }
    } catch (error) {
      console.error('Failed to update balance in database:', error);
      // Don't throw - balance check should continue even if DB update fails
    }
  }

  /**
   * Send alert email to Superadmins
   * Requirement 11.2: Send email alerts to all Superadmins
   * 
   * @param threshold - Threshold that was crossed
   * @param currentBalance - Current credit balance
   * @param severity - Alert severity
   */
  private async sendAlert(
    threshold: number,
    currentBalance: number,
    severity: 'warning' | 'critical'
  ): Promise<void> {
    // Check cooldown to avoid spamming
    const lastAlert = this.lastAlertSent.get(threshold);
    const now = Date.now();
    
    if (lastAlert && (now - lastAlert) < this.ALERT_COOLDOWN) {
      console.log(`Skipping alert for threshold ${threshold} - cooldown active`);
      return;
    }

    // Update last alert timestamp
    this.lastAlertSent.set(threshold, now);

    // Get Superadmin email addresses
    const superadminEmails = await this.getSuperadminEmails();

    if (superadminEmails.length === 0) {
      console.warn('No Superadmin emails found for credit alerts');
      return;
    }

    // Prepare email content
    const subject = severity === 'critical'
      ? '🚨 CRITICAL: SMS Credit Balance Alert'
      : '⚠️ WARNING: SMS Credit Balance Alert';

    const message = this.formatAlertEmail(threshold, currentBalance, severity);

    // Log alert
    console.log(`Sending ${severity} credit alert: Balance ${currentBalance}, Threshold ${threshold}`);

    // Send email if transporter is configured
    if (this.emailTransporter) {
      try {
        await this.emailTransporter.sendMail({
          from: process.env.SMTP_USER,
          to: superadminEmails.join(', '),
          subject,
          html: message
        });
        console.log(`Credit alert email sent to ${superadminEmails.length} Superadmins`);
      } catch (error) {
        console.error('Failed to send credit alert email:', error);
      }
    } else {
      console.log('Email not configured. Alert logged only.');
    }

    // Log alert to audit logs
    await this.logAlertToAudit(threshold, currentBalance, severity);
  }

  /**
   * Format alert email content
   * 
   * @param threshold - Threshold that was crossed
   * @param currentBalance - Current balance
   * @param severity - Alert severity
   * @returns HTML email content
   */
  private formatAlertEmail(
    threshold: number,
    currentBalance: number,
    severity: 'warning' | 'critical'
  ): string {
    const color = severity === 'critical' ? '#dc3545' : '#ffc107';
    const icon = severity === 'critical' ? '🚨' : '⚠️';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${color}; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
          .alert-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid ${color}; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${icon} SMS Credit Balance Alert</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2>Alert Details</h2>
              <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
              <p><strong>Current Balance:</strong> ${currentBalance} credits</p>
              <p><strong>Threshold:</strong> ${threshold} credits</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            ${threshold === 0 ? `
              <p><strong style="color: #dc3545;">⛔ SMS sending is now DISABLED due to zero balance.</strong></p>
              <p>Please recharge your SMS credits immediately to resume emergency alert services.</p>
            ` : threshold === 500 ? `
              <p><strong style="color: #dc3545;">Your SMS credit balance is critically low.</strong></p>
              <p>Please recharge soon to ensure uninterrupted emergency alert services.</p>
            ` : `
              <p><strong style="color: #ffc107;">Your SMS credit balance is running low.</strong></p>
              <p>Consider recharging to maintain adequate capacity for emergency alerts.</p>
            `}
            
            <h3>Recommended Actions:</h3>
            <ul>
              <li>Log in to your iProg SMS account to recharge credits</li>
              <li>Review recent SMS usage in the SafeHaven dashboard</li>
              <li>Adjust daily spending limits if needed</li>
              ${threshold === 0 ? '<li><strong>URGENT:</strong> Recharge immediately to restore SMS functionality</li>' : ''}
            </ul>
          </div>
          <div class="footer">
            <p>This is an automated alert from SafeHaven SMS Blast System.</p>
            <p>Do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get email addresses of all Superadmins
   * 
   * @returns Array of Superadmin email addresses
   */
  private async getSuperadminEmails(): Promise<string[]> {
    try {
      // Check if ALERT_EMAIL_RECIPIENTS is configured
      const configuredEmails = process.env.ALERT_EMAIL_RECIPIENTS;
      if (configuredEmails) {
        return configuredEmails.split(',').map(email => email.trim()).filter(email => email);
      }

      // Otherwise, query database for Superadmin users
      const [rows] = await pool.query<any[]>(
        'SELECT email FROM users WHERE role = ? AND email IS NOT NULL',
        ['superadmin']
      );

      return rows.map(row => row.email).filter(email => email);
    } catch (error) {
      console.error('Failed to get Superadmin emails:', error);
      return [];
    }
  }

  /**
   * Log alert to audit logs
   * 
   * @param threshold - Threshold that was crossed
   * @param currentBalance - Current balance
   * @param severity - Alert severity
   */
  private async logAlertToAudit(
    threshold: number,
    currentBalance: number,
    severity: 'warning' | 'critical'
  ): Promise<void> {
    try {
      const id = this.generateId();
      const details = JSON.stringify({
        threshold,
        currentBalance,
        severity,
        message: `Credit balance alert: ${currentBalance} credits (threshold: ${threshold})`
      });

      await pool.query(
        `INSERT INTO sms_audit_logs (id, event_type, details, created_at) 
         VALUES (?, ?, ?, ?)`,
        [id, 'credit_alert', details, new Date()]
      );
    } catch (error) {
      console.error('Failed to log credit alert to audit:', error);
    }
  }

  /**
   * Get current credit status
   * Requirement 11.3: Display warning banners in UI when balance is low
   * 
   * @returns CreditStatus with current balance and alerts
   */
  async getCreditStatus(): Promise<CreditStatus> {
    try {
      // Try to get balance from database first (cached)
      const [rows] = await pool.query<any[]>(
        'SELECT balance, last_checked FROM sms_credits ORDER BY created_at DESC LIMIT 1'
      );

      let balance: number;
      let lastChecked: Date;

      if (rows.length > 0 && rows[0].balance !== null) {
        balance = parseFloat(rows[0].balance);
        lastChecked = new Date(rows[0].last_checked);

        // If cache is older than 5 minutes, refresh from API
        const cacheAge = Date.now() - lastChecked.getTime();
        if (cacheAge > this.CHECK_INTERVAL) {
          balance = await this.iProgClient.getBalance();
          lastChecked = new Date();
          await this.updateBalanceInDatabase(balance, lastChecked);
        }
      } else {
        // No cached balance, fetch from API
        balance = await this.iProgClient.getBalance();
        lastChecked = new Date();
        await this.updateBalanceInDatabase(balance, lastChecked);
      }

      // Determine alerts and canSend status
      const alerts: CreditAlert[] = [];
      let canSend = true;

      if (balance <= this.THRESHOLD_ZERO) {
        alerts.push({
          threshold: this.THRESHOLD_ZERO,
          message: 'SMS credit balance is zero. Cannot send messages.',
          severity: 'critical'
        });
        canSend = false;
      } else if (balance <= this.THRESHOLD_CRITICAL) {
        alerts.push({
          threshold: this.THRESHOLD_CRITICAL,
          message: `SMS credit balance is critically low (${balance} credits remaining). Please recharge immediately.`,
          severity: 'critical'
        });
      } else if (balance <= this.THRESHOLD_WARNING) {
        alerts.push({
          threshold: this.THRESHOLD_WARNING,
          message: `SMS credit balance is low (${balance} credits remaining). Consider recharging soon.`,
          severity: 'warning'
        });
      }

      return {
        balance,
        lastChecked,
        alerts,
        canSend
      };
    } catch (error) {
      console.error('Failed to get credit status:', error);
      throw error;
    }
  }

  /**
   * Check if sending is allowed based on credit balance
   * Requirement 11.4: Prevent sending when balance reaches zero
   * 
   * @returns true if sending is allowed, false otherwise
   */
  async canSendSMS(): Promise<boolean> {
    try {
      const status = await this.getCreditStatus();
      return status.canSend;
    } catch (error) {
      console.error('Failed to check if SMS sending is allowed:', error);
      // On error, allow sending to not block emergency alerts
      return true;
    }
  }

  /**
   * Generate a unique ID for database records
   * 
   * @returns UUID string
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get monitoring status
   * 
   * @returns true if monitoring is active, false otherwise
   */
  isMonitoring(): boolean {
    return this.monitoringInterval !== null;
  }
}

