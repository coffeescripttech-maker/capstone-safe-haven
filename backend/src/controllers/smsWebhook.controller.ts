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
   * SMS Mobile API sends this format:
   * {
   *   "date": "2026-03-27",
   *   "hour": "09:23:02",
   *   "time_received": "20260327172254316",
   *   "message": "SOS|ALL|13.174030,123.732330|6|Citizen Citizen|Not provided",
   *   "number": "639923150633",
   *   "guid": "5C9D42DF-105D-4126-8F26-60D6C1E32BB3"
   * }
   */
  async receiveSMS(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Log raw request for debugging

      console.log("Dex");
      logger.info('🔔 SMS Webhook received - RAW BODY:', {
        body: req.body,
        headers: {
          'content-type': req.headers['content-type'],
          'user-agent': req.headers['user-agent']
        },
        timestamp: new Date().toISOString()
      });

      // SMS Mobile API format
      const { date, hour, time_received, message, number, guid } = req.body;

      // Validate webhook payload
      if (!message || !number) {
        logger.error('❌ Invalid webhook payload - missing required fields:', {
          hasMessage: !!message,
          hasNumber: !!number,
          receivedKeys: Object.keys(req.body)
        });
        
        res.status(400).json({
          status: 'error',
          message: 'Invalid webhook payload: missing message or number',
          received: Object.keys(req.body)
        });
        return;
      }

      logger.info('📱 SMS Details:', {
        from: number,
        message: message,
        date: date,
        hour: hour,
        guid: guid,
        time_received: time_received
      });

      // Parse SMS message format: "SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE"
      const parts = message.trim().split('|');
      
      logger.info('🔍 Parsing SMS message:', {
        rawMessage: message,
        parts: parts,
        partCount: parts.length
      });
      
      if (parts.length < 6 || parts[0].toUpperCase() !== 'SOS') {
        logger.warn('❌ Invalid SMS format:', {
          message: message,
          parts: parts,
          expectedFormat: 'SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE'
        });
        
        res.status(400).json({
          status: 'error',
          message: 'Invalid SMS format. Expected: SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE',
          received: message
        });
        return;
      }

      const [_, targetAgency, coordinates, userIdStr, userName, userPhone] = parts;
      const [latStr, lngStr] = coordinates.split(',');
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lngStr);
      const userId = parseInt(userIdStr);

      logger.info('📊 Parsed SOS data:', {
        targetAgency,
        coordinates: { latitude, longitude },
        userId,
        userName,
        userPhone
      });

      // Validate target agency
      const validAgencies = ['barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all'];
      const agency = targetAgency.toLowerCase();
      
      if (!validAgencies.includes(agency)) {
        logger.warn(`❌ Invalid agency in SMS: ${targetAgency}`, {
          received: targetAgency,
          validOptions: validAgencies
        });
        
        res.status(400).json({
          status: 'error',
          message: `Invalid agency: ${targetAgency}. Valid options: ${validAgencies.join(', ')}`
        });
        return;
      }

      // Verify user exists (use userId from SMS for faster lookup)
      let user = null;
      
      logger.info('🔍 Looking up user:', { userId, userPhone });
      
      if (userId && !isNaN(userId)) {
        // Try by user ID first (most reliable)
        user = await this.findUserById(userId);
      }
      
      if (!user) {
        // Fallback to phone number lookup
        logger.info('User not found by ID, trying phone lookup...');
        user = await this.findUserByPhone(userPhone);
      }
      
      if (!user) {
        logger.warn(`❌ User not found - ID: ${userId}, Phone: ${userPhone}`);
        res.status(404).json({
          status: 'error',
          message: 'User not found. Please register first.',
          searchedUserId: userId,
          searchedPhone: userPhone
        });
        return;
      }

      logger.info('✅ User found:', {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        phone: user.phone
      });

      // Create SOS alert (same as regular SOS)
      logger.info('🚨 Creating SOS alert...');
      
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
          smsFrom: number,
          smsMessageId: guid,
          smsDate: date,
          smsHour: hour,
          smsTimeReceived: time_received
        },
        targetAgency: agency as any
      });

      const processingTime = Date.now() - startTime;
      
      logger.info(`✅ SOS alert created successfully from SMS:`, {
        sosId: sosAlert.id,
        userId: user.id,
        agency: agency,
        location: { latitude, longitude },
        processingTimeMs: processingTime,
        smsGuid: guid
      });

      // Respond to webhook (200 OK tells SMSMobileAPI we processed it)
      res.status(200).json({
        status: 'success',
        message: 'SOS alert processed successfully',
        sosId: sosAlert.id,
        processingTimeMs: processingTime
      });

    } catch (error: any) {
      const processingTime = Date.now() - startTime;
      
      logger.error('❌ Error processing SMS webhook:', {
        error: error.message,
        stack: error.stack,
        body: req.body,
        processingTimeMs: processingTime
      });
      
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to process SMS',
        errorType: error.name
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
  async healthCheck(_req: Request, res: Response): Promise<void> {
    logger.info('🏥 Webhook health check requested');
    
    res.json({
      status: 'success',
      message: 'SMS webhook endpoint is active',
      timestamp: new Date().toISOString(),
      expectedFormat: {
        date: 'YYYY-MM-DD',
        hour: 'HH:MM:SS',
        time_received: 'timestamp',
        message: 'SOS|AGENCY|LAT,LNG|USERID|NAME|PHONE',
        number: '639XXXXXXXXX',
        guid: 'unique-id'
      }
    });
  }
}

export const smsWebhookController = new SMSWebhookController();
