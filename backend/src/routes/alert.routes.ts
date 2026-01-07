import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { AlertController } from '../controllers/alert.controller';
import { searchLimiter, createUpdateLimiter, broadcastLimiter, adminLimiter } from '../middleware/rateLimiter';

const router = Router();
const alertController = new AlertController();

// Public routes
router.get('/', alertController.getAlerts);
router.get('/search', searchLimiter, alertController.searchAlerts);
router.get('/:id', alertController.getAlertById);

// Admin routes with rate limiting
router.post('/', authenticate, authorize('admin', 'lgu_officer'), createUpdateLimiter, alertController.createAlert);
router.put('/:id', authenticate, authorize('admin', 'lgu_officer'), createUpdateLimiter, alertController.updateAlert);
router.delete('/:id', authenticate, authorize('admin', 'lgu_officer'), adminLimiter, alertController.deactivateAlert);
router.post('/:id/broadcast', authenticate, authorize('admin', 'lgu_officer'), broadcastLimiter, alertController.broadcastAlert);
router.get('/:id/statistics', authenticate, authorize('admin', 'lgu_officer'), alertController.getAlertStatistics);
router.post('/deactivate-expired', authenticate, authorize('admin', 'lgu_officer'), adminLimiter, alertController.deactivateExpiredAlerts);

export default router;
