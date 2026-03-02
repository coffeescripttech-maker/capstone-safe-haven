import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AlertService } from '../services/alert.service';
import { AppError } from '../middleware/errorHandler';

const alertService = new AlertService();

export class AlertController {
  /**
   * Create new alert
   * LGU officers create alerts with pending_approval status
   * Requirements: 6.1, 7.1
   */
  async createAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const alert = await alertService.createAlert(req.body, req.user!.id, req.user!.role);
      
      res.status(201).json({
        status: 'success',
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all alerts with filtering
   * Apply visibility filtering for citizens
   * Requirements: 6.1, 7.1, 8.1
   */
  async getAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        alert_type: req.query.type as string,
        severity: req.query.severity as string,
        is_active: req.query.is_active === 'false' ? false : true,
        latitude: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        longitude: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        userRole: req.user?.role
      };

      const result = await alertService.getAlerts(filters);
      
      // Add cache-control headers for offline support
      res.set({
        'Cache-Control': 'public, max-age=300', // 5 minutes
        'Last-Modified': new Date().toUTCString()
      });
      
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search alerts by keyword
   */
  async searchAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const startDate = req.query.start_date as string;
      const endDate = req.query.end_date as string;

      if (!query) {
        throw new AppError('Search query is required', 400);
      }

      const alerts = await alertService.searchAlerts(query, startDate, endDate);
      
      res.json({
        status: 'success',
        data: alerts
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single alert by ID
   */
  async getAlertById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const alert = await alertService.getAlertById(id);
      
      // Add cache-control headers for offline support
      res.set({
        'Cache-Control': 'public, max-age=300',
        'Last-Modified': alert.updated_at.toUTCString()
      });
      
      res.json({
        status: 'success',
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update alert (Admin only)
   */
  async updateAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const alert = await alertService.updateAlert(id, req.body);
      
      res.json({
        status: 'success',
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate alert (Admin only)
   */
  async deactivateAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await alertService.deactivateAlert(id);
      
      res.json({
        status: 'success',
        message: 'Alert deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Broadcast alert to targeted users (Admin only)
   */
  async broadcastAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const result = await alertService.broadcastAlert(id);
      
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get alert statistics (Admin only)
   */
  async getAlertStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const stats = await alertService.getAlertStatistics(id);
      
      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate expired alerts (Admin only)
   */
  async deactivateExpiredAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await alertService.deactivateExpiredAlerts();
      
      res.json({
        status: 'success',
        message: `${count} expired alerts deactivated`,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve pending alert
   * Requirements: 7.1
   */
  async approveAlert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const alert = await alertService.approveAlert(id, req.user!.id);
      
      res.json({
        status: 'success',
        message: 'Alert approved and broadcasted successfully',
        data: alert
      });
    } catch (error) {
      next(error);
    }
  }
}
