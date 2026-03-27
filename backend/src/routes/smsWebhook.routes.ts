// SMS Webhook Routes

import { Router } from 'express';
import { smsWebhookController } from '../controllers/smsWebhook.controller';
import { validateWebhookSecret } from '../middleware/webhookAuth';

const router = Router();

// Health check (no auth required)
router.get('/health', smsWebhookController.healthCheck.bind(smsWebhookController));

// Webhook endpoint (no auth for testing - TODO: add back validateWebhookSecret for production)
router.post('/sms-sos', smsWebhookController.receiveSMS.bind(smsWebhookController));

export default router;
