// Webhook Authentication Middleware

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Validate webhook secret from SMSMobileAPI
 * 
 * Checks for secret in:
 * 1. X-Webhook-Secret header
 * 2. Query parameter ?secret=xxx
 * 3. Body field webhook_secret
 */
export const validateWebhookSecret = (req: Request, res: Response, next: NextFunction) => {
  const expectedSecret = process.env.SMS_WEBHOOK_SECRET;

  // If no secret configured, allow (for development)
  if (!expectedSecret) {
    logger.warn('⚠️ SMS_WEBHOOK_SECRET not configured - webhook is unprotected!');
    return next();
  }

  // Check multiple locations for secret
  const secret = 
    req.headers['x-webhook-secret'] || 
    req.query.secret || 
    req.body?.webhook_secret;

  if (!secret) {
    logger.warn('❌ Webhook secret missing');
    return res.status(401).json({
      status: 'error',
      message: 'Webhook secret required'
    });
  }

  if (secret !== expectedSecret) {
    logger.warn('❌ Invalid webhook secret received');
    return res.status(401).json({
      status: 'error',
      message: 'Invalid webhook secret'
    });
  }

  logger.info('✅ Webhook secret validated');
  next();
};
