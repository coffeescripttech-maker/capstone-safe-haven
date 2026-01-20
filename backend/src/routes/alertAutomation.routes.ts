// Alert Automation Routes - Admin-only access

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as alertAutomationController from '../controllers/alertAutomation.controller';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Alert management
router.get('/pending', alertAutomationController.getPendingAlerts);
router.post('/alerts/:id/approve', alertAutomationController.approveAlert);
router.post('/alerts/:id/reject', alertAutomationController.rejectAlert);

// Logs
router.get('/logs', alertAutomationController.getAutomationLogs);

// Manual trigger (for testing)
router.post('/trigger', alertAutomationController.triggerMonitoring);

// Rules management
router.get('/rules', alertAutomationController.getRules);
router.get('/rules/:id', alertAutomationController.getRuleById);
router.post('/rules', alertAutomationController.createRule);
router.put('/rules/:id', alertAutomationController.updateRule);
router.patch('/rules/:id/toggle', alertAutomationController.toggleRule);
router.delete('/rules/:id', alertAutomationController.deleteRule);

export default router;
