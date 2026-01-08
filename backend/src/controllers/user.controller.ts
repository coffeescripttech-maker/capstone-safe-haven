import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/user.service';
import { AppError } from '../middleware/errorHandler';

const userService = new UserService();

export class UserController {
  /**
   * Get all users with filtering
   */
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        role: req.query.role as string,
        is_active: req.query.is_active === 'false' ? false : req.query.is_active === 'true' ? true : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
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
   */
  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const user = await userService.updateUser(id, req.body);
      
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
   */
  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      await userService.deleteUser(id);
      
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
}
