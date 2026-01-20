import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { generalLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { alertAutomationService } from './services/alertAutomation.service';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting to all routes
app.use('/api/', generalLimiter);

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`SafeHaven API Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  
  // Start Alert Automation Monitoring
  // Runs every 5 minutes to check weather and earthquake data
  logger.info('Starting Alert Automation monitoring...');
  
  cron.schedule('*/5 * * * *', async () => {
    logger.info('[Alert Automation] Running scheduled monitoring cycle');
    try {
      const result = await alertAutomationService.monitorAndCreateAlerts();
      logger.info(`[Alert Automation] Cycle complete. Weather: ${result.weatherAlerts}, Earthquakes: ${result.earthquakeAlerts}`);
    } catch (error) {
      logger.error('[Alert Automation] Error in scheduled monitoring:', error);
    }
  });
  
  logger.info('Alert Automation monitoring scheduled (every 5 minutes)');
});

export default app;
