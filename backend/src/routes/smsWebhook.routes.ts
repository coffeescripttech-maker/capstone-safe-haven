// SMS Webhook Routes

import { Router, Request, Response, NextFunction } from 'express';
import { smsWebhookController } from '../controllers/smsWebhook.controller';
import { logger } from '../utils/logger';

const router = Router();

// Logging middleware for all webhook requests
router.use((req: Request, _res: Response, next: NextFunction) => {

    console.log("hey");
  logger.info('🌐 Webhook request received:', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type'],
    bodyKeys: req.body ? Object.keys(req.body) : [],
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check (no auth required)
router.get('/health', smsWebhookController.healthCheck.bind(smsWebhookController));

// Webhook endpoint (no auth for testing - TODO: add back validateWebhookSecret for production)
router.post('/sms-sos', smsWebhookController.receiveSMS.bind(smsWebhookController));

export default router;
