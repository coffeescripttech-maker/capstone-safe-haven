/**
 * Location Routes
 * 
 * Provides endpoints for fetching location data from user_profiles
 */

import { Router } from 'express';
import { locationController } from '../controllers/location.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * GET /api/locations/provinces
 * Get all unique provinces
 */
router.get('/provinces', authenticate, (req, res, next) => 
  locationController.getProvinces(req, res, next)
);

/**
 * GET /api/locations/cities
 * Get all unique cities (optionally filtered by province)
 */
router.get('/cities', authenticate, (req, res, next) => 
  locationController.getCities(req, res, next)
);

/**
 * GET /api/locations/barangays
 * Get all unique barangays (optionally filtered by province and city)
 */
router.get('/barangays', authenticate, (req, res, next) => 
  locationController.getBarangays(req, res, next)
);

/**
 * GET /api/locations/all
 * Get all location data in one request
 */
router.get('/all', authenticate, (req, res, next) => 
  locationController.getAllLocations(req, res, next)
);

export default router;
