import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { EvacuationCenterController } from '../controllers/evacuationCenter.controller';
import { searchLimiter, createUpdateLimiter, adminLimiter } from '../middleware/rateLimiter';

const router = Router();
const centerController = new EvacuationCenterController();

// Protected routes with permission checks
// Requirements: 6.2, 7.3, 8.4, 11.3

// Get all centers - requires 'read' permission on 'evacuation_centers' resource
router.get('/', authenticate, requirePermission('evacuation_centers', 'read'), centerController.getCenters);

// Find nearby centers - requires 'read' permission on 'evacuation_centers' resource
router.get('/nearby', authenticate, requirePermission('evacuation_centers', 'read'), centerController.findNearby);

// Search centers - requires 'read' permission on 'evacuation_centers' resource
router.get('/search', authenticate, requirePermission('evacuation_centers', 'read'), searchLimiter, centerController.searchCenters);

// Get center by ID - requires 'read' permission on 'evacuation_centers' resource
router.get('/:id', authenticate, requirePermission('evacuation_centers', 'read'), centerController.getCenterById);

// Create center - requires 'create' permission on 'evacuation_centers' resource
router.post('/', authenticate, requirePermission('evacuation_centers', 'create'), createUpdateLimiter, centerController.createCenter);

// Update center - requires 'update' permission on 'evacuation_centers' resource
router.put('/:id', authenticate, requirePermission('evacuation_centers', 'update'), createUpdateLimiter, centerController.updateCenter);

// Update occupancy - requires 'update' permission on 'evacuation_centers' resource
router.patch('/:id/occupancy', authenticate, requirePermission('evacuation_centers', 'update'), createUpdateLimiter, centerController.updateOccupancy);

// Delete/deactivate center - requires 'delete' permission on 'evacuation_centers' resource
router.delete('/:id', authenticate, requirePermission('evacuation_centers', 'delete'), adminLimiter, centerController.deactivateCenter);

// Get statistics - requires 'read' permission on 'evacuation_centers' resource
router.get('/admin/statistics', authenticate, requirePermission('evacuation_centers', 'read'), centerController.getStatistics);

export default router;
