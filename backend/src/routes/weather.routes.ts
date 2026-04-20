import { Router } from 'express';
import { WeatherController } from '../controllers/weather.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const weatherController = new WeatherController();

// All weather routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/weather/forecasts
 * @desc    Get weather forecasts with advance notice
 * @access  Admin, MDRRMO, LGU Officer
 */
router.get(
  '/forecasts',
  authorize('super_admin', 'admin', 'mdrrmo', 'lgu_officer'),
  weatherController.getForecasts.bind(weatherController)
);

/**
 * @route   GET /api/weather/forecast-alerts
 * @desc    Get forecast-triggered alerts
 * @access  Admin, MDRRMO, LGU Officer
 */
router.get(
  '/forecast-alerts',
  authorize('super_admin', 'admin', 'mdrrmo', 'lgu_officer'),
  weatherController.getForecastAlerts.bind(weatherController)
);

/**
 * @route   GET /api/weather/current
 * @desc    Get current weather for all monitored cities (Mobile)
 * @access  Authenticated users
 */
router.get(
  '/current',
  weatherController.getCurrentWeather.bind(weatherController)
);

/**
 * @route   GET /api/weather/forecast
 * @desc    Get hourly forecast for specific location (Mobile)
 * @access  Authenticated users
 * @query   lat, lon, hours (optional, default 24)
 */
router.get(
  '/forecast',
  weatherController.getHourlyForecast.bind(weatherController)
);

export default router;
