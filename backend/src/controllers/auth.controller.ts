import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';

const authService = new AuthService();

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      const result = await authService.login(email, password);
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new AppError('Refresh token is required', 400);
      }

      const result = await authService.refreshToken(refreshToken);
      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await authService.getProfile(req.user!.id) as any;
      
      // Split into user and profile objects
      const user = {
        id: data.id,
        email: data.email,
        phone: data.phone,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role
      };
      
      const profile = {
        address: data.address,
        city: data.city,
        province: data.province,
        barangay: data.barangay,
        bloodType: data.blood_type,
        medicalConditions: data.medical_conditions,
        emergencyContactName: data.emergency_contact_name,
        emergencyContactPhone: data.emergency_contact_phone
      };
      
      res.json({
        status: 'success',
        data: { user, profile }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await authService.updateProfile(req.user!.id, req.body) as any;
      
      // Split into user and profile objects
      const user = {
        id: data.id,
        email: data.email,
        phone: data.phone,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role
      };
      
      const profile = {
        address: data.address,
        city: data.city,
        province: data.province,
        barangay: data.barangay,
        bloodType: data.blood_type,
        medicalConditions: data.medical_conditions,
        emergencyContactName: data.emergency_contact_name,
        emergencyContactPhone: data.emergency_contact_phone
      };
      
      res.json({
        status: 'success',
        data: { user, profile }
      });
    } catch (error) {
      next(error);
    }
  }

  async registerDeviceToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token, platform } = req.body;
      
      if (!token || !platform) {
        throw new AppError('Token and platform are required', 400);
      }

      await authService.registerDeviceToken(req.user!.id, token, platform);
      res.json({
        status: 'success',
        message: 'Device token registered successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
