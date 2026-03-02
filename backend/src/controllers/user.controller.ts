import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/user.service';
import { AppError } from '../middleware/errorHandler';

const userService = new UserService();

export class UserController {
  /**
   * Get all users with filtering
   * Apply role hierarchy filtering
   * Requirements: 2.2, 3.3, 11.4
   */
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        role: req.query.role as string,
        is_active: req.query.is_active === 'false' ? false : req.query.is_active === 'true' ? true : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        actorRole: req.user?.role,
        actorId: req.user?.id
      };

      const result = await userService.getUsers(filters);
      
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single user by ID
   */
  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.getUserById(id);
      
      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   * Validates role modification permissions
   * Requirements: 1.5, 12.4
   */
  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const actorRole = req.user?.role;
      const actorId = req.user?.id;

      // Prevent users from modifying their own role (except super_admin)
      // Requirement: 1.5, 12.4
      if (req.body.role && actorId === id && actorRole !== 'super_admin') {
        throw new AppError('Cannot modify your own role', 403);
      }

      const user = await userService.updateUser(id, req.body, actorRole);
      
      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (soft delete)
   * Validates role hierarchy permissions
   * Requirements: 2.2, 3.3, 11.4
   */
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const actorRole = req.user?.role;
      const actorId = req.user?.id;

      // Prevent users from deleting themselves
      if (actorId === id) {
        throw new AppError('Cannot delete your own account', 403);
      }

      await userService.deleteUser(id, actorRole);
      
      res.json({
        status: 'success',
        message: 'User deactivated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics
   */
  async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getStatistics();
      
      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const { password } = req.body;

      if (!password) {
        throw new AppError('Password is required', 400);
      }

      await userService.resetPassword(id, password);
      
      res.json({
        status: 'success',
        message: 'Password reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get citizen location data
   * PNP can only access during active emergencies
   * Requirements: 4.4
   */
  async getCitizenLocations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        latitude: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
        longitude: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50
      };

      const result = await userService.getCitizenLocations(filters);
      
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
