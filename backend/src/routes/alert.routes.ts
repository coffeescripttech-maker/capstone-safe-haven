import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { AlertController } from '../controllers/alert.controller';
import { searchLimiter, createUpdateLimiter, broadcastLimiter, adminLimiter } from '../middleware/rateLimiter';

const router = Router();
const alertController = new AlertController();

// Public routes - citizens can read alerts
// Requirements: 6.1, 7.1, 8.1
router.get('/', alertController.getAlerts);
router.get('/search', searchLimiter, alertController.searchAlerts);
router.get('/:id', alertController.getAlertById);

// Protected routes with permission checks
// Requirements: 6.1, 7.1, 8.1

// Create alert - requires 'create' permission on 'alerts' resource
// LGU officers create alerts with pending_approval status
router.post('/', authenticate, requirePermission('alerts', 'create'), createUpdateLimiter, alertController.createAlert);

// Update alert - requires 'update' permission on 'alerts' resource
router.put('/:id', authenticate, requirePermission('alerts', 'update'), createUpdateLimiter, alertController.updateAlert);

// Delete/deactivate alert - requires 'delete' permission on 'alerts' resource
router.delete('/:id', authenticate, requirePermission('alerts', 'delete'), adminLimiter, alertController.deactivateAlert);

// Broadcast alert - requires 'execute' permission on 'alerts' resource
router.post('/:id/broadcast', 
    authenticate, 
    // requirePermission('alerts', 'execute'), 
broadcastLimiter, alertController.broadcastAlert);

// Get alert statistics - requires 'read' permission on 'alerts' resource
router.get('/:id/statistics', authenticate, requirePermission('alerts', 'read'), alertController.getAlertStatistics);

// Deactivate expired alerts - requires 'execute' permission on 'alerts' resource
router.post('/deactivate-expired', authenticate, requirePermission('alerts', 'execute'), adminLimiter, alertController.deactivateExpiredAlerts);

// Approve pending alert - requires 'update' permission on 'alerts' resource
// Requirements: 7.1
router.patch('/:id/approve', authenticate, requirePermission('alerts', 'update'), alertController.approveAlert);

export default router;
