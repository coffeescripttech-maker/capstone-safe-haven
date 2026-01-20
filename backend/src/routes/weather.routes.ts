// Weather Routes - Admin-only access to weather data

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as weatherController from '../controllers/weather.controller';

const router = Router();

// All weather routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// GET /api/v1/admin/weather/philippines - Get weather for major PH cities
router.get('/philippines', weatherController.getPhilippinesWeather);

// GET /api/v1/admin/weather/location?lat=14.5995&lon=120.9842 - Get weather for specific location
router.get('/location', weatherController.getLocationWeather);

export default router;
