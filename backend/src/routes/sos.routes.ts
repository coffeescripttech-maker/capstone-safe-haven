// SOS Routes

import { Router } from 'express';
import { sosController } from '../controllers/sos.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create new SOS alert (any authenticated user)
router.post('/', sosController.createSOS.bind(sosController));

// Get my SOS alerts (any authenticated user)
router.get('/my-alerts', sosController.getMySOS.bind(sosController));

// Get SOS statistics (any authenticated user - filtered by role)
router.get('/statistics', sosController.getSOSStatistics.bind(sosController));

// Get all SOS alerts (admin/LGU only)
router.get('/', authorize('admin', 'lgu_officer'), sosController.getAllSOS.bind(sosController));

// Get SOS alert by ID (owner, admin, or LGU)
router.get('/:id', sosController.getSOSById.bind(sosController));

// Update SOS status (admin/LGU only)
router.patch('/:id/status', authorize('admin', 'lgu_officer'), sosController.updateSOSStatus.bind(sosController));

export default router;
