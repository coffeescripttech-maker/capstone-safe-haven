// SOS Routes

import { Router } from 'express';
import { sosController } from '../controllers/sos.controller';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create new SOS alert - requires 'create' permission on 'sos_alerts' resource
// Requirements: 4.1, 8.2
router.post('/', requirePermission('sos_alerts', 'create'), sosController.createSOS.bind(sosController));

// Get my SOS alerts (any authenticated user)
router.get('/my-alerts', sosController.getMySOS.bind(sosController));

// Get SOS statistics (any authenticated user - filtered by role)
router.get('/statistics', sosController.getSOSStatistics.bind(sosController));

// Get all SOS alerts - requires 'read' permission on 'sos_alerts' resource
// Apply DataFilterService for geographic filtering (lgu_officer) and system-wide access (pnp, bfp, mdrrmo)
// Requirements: 4.1, 7.4, 11.2
router.get('/', requirePermission('sos_alerts', 'read'), sosController.getAllSOS.bind(sosController));

// Get SOS alert by ID - requires 'read' permission on 'sos_alerts' resource
router.get('/:id', requirePermission('sos_alerts', 'read'), sosController.getSOSById.bind(sosController));

// Update SOS status - requires 'update' permission on 'sos_alerts' resource
router.patch('/:id/status', requirePermission('sos_alerts', 'update'), sosController.updateSOSStatus.bind(sosController));

export default router;
