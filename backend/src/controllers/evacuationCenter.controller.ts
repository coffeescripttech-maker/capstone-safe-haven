import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { EvacuationCenterService } from '../services/evacuationCenter.service';
import { AppError } from '../middleware/errorHandler';

const centerService = new EvacuationCenterService();

export class EvacuationCenterController {
  /**
   * Create new evacuation center (Admin only)
   */
  async createCenter(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const center = await centerService.createCenter(req.body);
      
      res.status(201).json({
        status: 'success',
        data: center
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all centers with filtering
   */
  async getCenters(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        city: req.query.city as string,
        province: req.query.province as string,
        barangay: req.query.barangay as string,
        is_active: req.query.is_active === 'false' ? false : true,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
      };

      const result = await centerService.getCenters(filters);
      
      // Add cache-control headers for offline support
      res.set({
        'Cache-Control': 'public, max-age=600', // 10 minutes
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
   * Find nearby evacuation centers
   */
  async findNearby(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const radius = req.query.radius ? parseFloat(req.query.radius as string) : 50;

      if (isNaN(lat) || isNaN(lng)) {
        throw new AppError('Valid latitude and longitude are required', 400);
      }

      const centers = await centerService.findNearby(lat, lng, radius);
      
      res.json({
        status: 'success',
        data: centers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search centers by name
   */
  async searchCenters(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;

      if (!query) {
        throw new AppError('Search query is required', 400);
      }

      const filters = {
        city: req.query.city as string,
        province: req.query.province as string
      };

      const centers = await centerService.searchCenters(query, filters);
      
      res.json({
        status: 'success',
        data: centers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single center by ID
   */
  async getCenterById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const center = await centerService.getCenterById(id);
      
      // Add cache-control headers
      res.set({
        'Cache-Control': 'public, max-age=600',
        'Last-Modified': center.updated_at.toUTCString()
      });
      
      res.json({
        status: 'success',
        data: center
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update evacuation center (Admin only)
   */
  async updateCenter(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const center = await centerService.updateCenter(id, req.body);
      
      res.json({
        status: 'success',
        data: center
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update center occupancy (Admin only)
   */
  async updateOccupancy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { occupancy } = req.body;

      if (occupancy === undefined) {
        throw new AppError('Occupancy is required', 400);
      }

      const center = await centerService.updateOccupancy(id, occupancy);
      
      res.json({
        status: 'success',
        data: center
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate center (Admin only)
   */
  async deactivateCenter(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await centerService.deactivateCenter(id);
      
      res.json({
        status: 'success',
        message: 'Evacuation center deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statistics (Admin only)
   */
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const province = req.query.province as string;
      const stats = await centerService.getStatistics(province);
      
      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}
