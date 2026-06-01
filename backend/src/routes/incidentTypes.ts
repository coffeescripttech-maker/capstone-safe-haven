import express from 'express';
import { authenticate } from '../middleware/auth';
import * as incidentTypesController from '../controllers/incidentTypesController';

const router = express.Router();

// Get all incident types with their responders
router.get('/', incidentTypesController.getAllIncidentTypes);

// Get a specific incident type by ID
router.get('/:id', incidentTypesController.getIncidentTypeById);

// Get incident types by priority
router.get('/priority/:priority', incidentTypesController.getIncidentTypesByPriority);

export default router;
