import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import incidentController from '../controllers/incident.controller';

const router = Router();

// Public routes
router.get('/', incidentController.getIncidents);

// Protected routes (must come before /:id to avoid route conflicts)
router.post('/', authenticate, incidentController.createIncident);
router.get('/my', authenticate, incidentController.getMyIncidents);
router.patch('/:id/status', authenticate, incidentController.updateIncidentStatus);
router.delete('/:id', authenticate, incidentController.deleteIncident);

// Public route with ID parameter (must come last)
router.get('/:id', incidentController.getIncidentById);

export default router;
