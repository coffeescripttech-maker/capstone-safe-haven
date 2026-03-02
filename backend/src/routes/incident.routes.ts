import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import incidentController from '../controllers/incident.controller';

const router = Router();

// Protected routes with permission checks
// Requirements: 4.1, 5.1, 7.2, 11.1

// Get all incidents - requires 'read' permission on 'incidents' resource
router.get('/', authenticate, requirePermission('incidents', 'read'), incidentController.getIncidents);

// Create incident - requires 'create' permission on 'incidents' resource
router.post('/', authenticate, requirePermission('incidents', 'create'), incidentController.createIncident);

// Get my incidents - requires authentication
router.get('/my', authenticate, incidentController.getMyIncidents);

// Update incident status - requires 'update' permission on 'incidents' resource
router.patch('/:id/status', authenticate, requirePermission('incidents', 'update'), incidentController.updateIncidentStatus);

// Delete incident - requires 'delete' permission on 'incidents' resource
router.delete('/:id', authenticate, requirePermission('incidents', 'delete'), incidentController.deleteIncident);

// Get incident by ID - requires 'read' permission on 'incidents' resource
router.get('/:id', authenticate, requirePermission('incidents', 'read'), incidentController.getIncidentById);

export default router;
