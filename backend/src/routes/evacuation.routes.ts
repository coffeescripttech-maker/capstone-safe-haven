import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { EvacuationCenterController } from '../controllers/evacuationCenter.controller';
import { searchLimiter, createUpdateLimiter, adminLimiter } from '../middleware/rateLimiter';

const router = Router();
const centerController = new EvacuationCenterController();

// Public routes
router.get('/', centerController.getCenters);
router.get('/nearby', centerController.findNearby);
router.get('/search', searchLimiter, centerController.searchCenters);
router.get('/:id', centerController.getCenterById);

// Admin routes with rate limiting
router.post('/', authenticate, authorize('admin', 'lgu_officer'), createUpdateLimiter, centerController.createCenter);
router.put('/:id', authenticate, authorize('admin', 'lgu_officer'), createUpdateLimiter, centerController.updateCenter);
router.patch('/:id/occupancy', authenticate, authorize('admin', 'lgu_officer'), createUpdateLimiter, centerController.updateOccupancy);
router.delete('/:id', authenticate, authorize('admin', 'lgu_officer'), adminLimiter, centerController.deactivateCenter);
router.get('/admin/statistics', authenticate, authorize('admin', 'lgu_officer'), centerController.getStatistics);

export default router;
