// SMS Webhook Controller - Receives SMS from SMSMobileAPI gateway

import { Request, Response } from 'express';
import { sosService } from '../services/sos.service';
import { logger } from '../utils/logger';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

export class SMSWebhookController {
  /**
   * Receive SMS webhook from SMSMobileAPI
   * 
   * Expected payload format:
   * {
   *   from: "+639171234567",
   *   to: "+639923150633",
   *   message: "SOS|PNP|14.5995,120.9842|Juan Dela Cruz|09171234567",
   *   timestamp: "2026-03-25T10:30:00Z",
   *   messageId: "sms-12345"
   * }
   */
  async receiveSMS(req: Request, res: Response): Promise<void> {
    try {
      const { from, to, message, timestamp, messageId } = req.body;

      logger.info('📱 SMS Webhook received:', { from, to, message, timestamp, messageId });

      // Validate webhook payload
      if (!from || !message) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid webhook payload: missing from or message'
        });
        return;
      }

      // Verify this is sent to our gateway number
      const gatewayNumber = process.env.SMS_GATEWAY_NUMBER || '09923150633';
      if (to && !to.includes(gatewayNumber.replace(/^\+?63/, ''))) {
        logger.warn(`SMS sent to wrong number: ${to}, expected: ${gatewayNumber}`);
      }

      // Parse SMS message format: "SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE"
      const parts = message.trim().split('|');
      
      if (parts.length < 6 || parts[0].toUpperCase() !== 'SOS') {
        logger.warn('Invalid SMS format:', message);
        res.status(400).json({
          status: 'error',
          message: 'Invalid SMS format. Expected: SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE'
        });
        return;
      }

      const [_, targetAgency, coordinates, userIdStr, userName, userPhone] = parts;
      const [latStr, lngStr] = coordinates.split(',');
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lngStr);
      const userId = parseInt(userIdStr);

      // Validate target agency
      const validAgencies = ['barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all'];
      const agency = targetAgency.toLowerCase();
      
      if (!validAgencies.includes(agency)) {
        logger.warn(`Invalid agency in SMS: ${targetAgency}`);
        res.status(400).json({
          status: 'error',
          message: `Invalid agency: ${targetAgency}`
        });
        return;
      }

      // Verify user exists (use userId from SMS for faster lookup)
      let user = null;
      
      if (userId && !isNaN(userId)) {
        // Try by user ID first (most reliable)
        user = await this.findUserById(userId);
      }
      
      if (!user) {
        // Fallback to phone number lookup
        user = await this.findUserByPhone(userPhone);
      }
      
      if (!user) {
        logger.warn(`User not found - ID: ${userId}, Phone: ${userPhone}`);
        res.status(404).json({
          status: 'error',
          message: 'User not found. Please register first.'
        });
        return;
      }

      // Create SOS alert (same as regular SOS)
      const sosAlert = await sosService.createSOSAlert({
        userId: user.id,
        latitude: isNaN(latitude) ? undefined : latitude,
        longitude: isNaN(longitude) ? undefined : longitude,
        message: 'Emergency! I need help! (Sent via SMS)',
        source: 'sms', // Mark as SMS-originated
        userInfo: {
          userId: user.id,
          name: userName,
          phone: userPhone,
          smsFrom: from,
          smsMessageId: messageId
        },
        targetAgency: agency as any
      });

      logger.info(`✅ SOS alert created from SMS: ${sosAlert.id}, user: ${user.id}, agency: ${agency}`);

      // Respond to webhook (200 OK tells SMSMobileAPI we processed it)
      res.status(200).json({
        status: 'success',
        message: 'SOS alert processed successfully',
        sosId: sosAlert.id
      });

    } catch (error: any) {
      logger.error('Error processing SMS webhook:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to process SMS'
      });
    }
  }

  /**
   * Find user by ID (fastest and most reliable)
   */
  private async findUserById(userId: number): Promise<any> {
    try {
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT id, first_name, last_name, phone, email FROM users WHERE id = ?',
        [userId]
      );

      if (users.length > 0) {
        logger.info(`✅ User found by ID: ${users[0].id}`);
        return users[0];
      }

      return null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Find user by phone number (handles different formats)
   */
  private async findUserByPhone(phone: string): Promise<any> {
    try {
      // Clean phone number
      const cleanPhone = phone.trim();
      
      // Try exact match first
      let [users] = await pool.query<RowDataPacket[]>(
        'SELECT id, first_name, last_name, phone, email FROM users WHERE phone = ?',
        [cleanPhone]
      );

      if (users.length > 0) {
        logger.info(`User found by exact match: ${users[0].id}`);
        return users[0];
      }

      // Try with +63 prefix
      const phoneWith63 = cleanPhone.startsWith('+63') ? cleanPhone : `+63${cleanPhone.replace(/^0/, '')}`;
      [users] = await pool.query<RowDataPacket[]>(
        'SELECT id, first_name, last_name, phone, email FROM users WHERE phone = ?',
        [phoneWith63]
      );

      if (users.length > 0) {
        logger.info(`User found with +63 prefix: ${users[0].id}`);
        return users[0];
      }

      // Try without prefix (09XX format)
      const phoneWithout63 = cleanPhone.replace(/^\+?63/, '0');
      [users] = await pool.query<RowDataPacket[]>(
        'SELECT id, first_name, last_name, phone, email FROM users WHERE phone = ?',
        [phoneWithout63]
      );

      if (users.length > 0) {
        logger.info(`User found with 09 format: ${users[0].id}`);
        return users[0];
      }

      // Try all variations at once
      [users] = await pool.query<RowDataPacket[]>(
        'SELECT id, first_name, last_name, phone, email FROM users WHERE phone IN (?, ?, ?)',
        [cleanPhone, phoneWith63, phoneWithout63]
      );

      if (users.length > 0) {
        logger.info(`User found by variation match: ${users[0].id}`);
        return users[0];
      }

      logger.warn(`No user found for phone: ${cleanPhone}`);
      return null;

    } catch (error) {
      logger.error('Error finding user by phone:', error);
      return null;
    }
  }

  /**
   * Health check endpoint for webhook
   */
  async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'success',
      message: 'SMS webhook endpoint is active',
      timestamp: new Date().toISOString()
    });
  }
}

export const smsWebhookController = new SMSWebhookController();
