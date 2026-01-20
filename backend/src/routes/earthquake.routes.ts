// Earthquake Routes - Admin-only access to earthquake data

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as earthquakeController from '../controllers/earthquake.controller';

const router = Router();

// All earthquake routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/v1/admin/earthquakes/recent?days=7&minMagnitude=4 - Get recent earthquakes
router.get('/recent', earthquakeController.getRecentEarthquakes);

// GET /api/v1/admin/earthquakes/stats?days=30 - Get earthquake statistics
router.get('/stats', earthquakeController.getEarthquakeStats);

export default router;
