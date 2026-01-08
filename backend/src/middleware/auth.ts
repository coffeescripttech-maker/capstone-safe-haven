import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔍 Auth header:', req.headers.authorization?.substring(0, 50) + '...');
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('❌ No token found');
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key') as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    console.log('✅ Token decoded:', { id: decoded.id, email: decoded.email, role: decoded.role });
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error instanceof Error ? error.message : error);
    next(new AppError('Invalid or expired token', 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    console.log('🔐 Authorization check:', {
      path: req.path,
      method: req.method,
      userRole: req.user.role,
      userRoleType: typeof req.user.role,
      allowedRoles: roles,
      hasPermission: roles.includes(req.user.role)
    });

    if (!roles.includes(req.user.role)) {
      console.log('❌ Authorization FAILED - role mismatch');
      return next(new AppError('Insufficient permissions', 403));
    }

    console.log('✅ Authorization SUCCESS');
    next();
  };
};
