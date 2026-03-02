import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { AuthService } from '../services/auth.service';
import { auditLogger } from '../services/auditLogger.service';
import { permissionService } from '../services/permission.service';

const authService = new AuthService();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    jurisdiction?: string | null;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔍 Auth header:', req.headers.authorization?.substring(0, 50) + '...');
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('❌ No token found');
      
      // Log authentication failure
      // Requirement: 9.4, 13.4
      await auditLogger.logAccess(
        0, // No user ID for missing token
        'unknown' as any,
        'authenticate',
        'api',
        null,
        'denied',
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      );
      
      throw new AppError('Authentication required', 401);
    }

    // Verify and decode token
    // Requirement: 9.1
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key') as any;
    
    // Check if token is blacklisted (logged out)
    // Requirement: 14.5
    if (decoded.jti) {
      const isBlacklisted = await authService.isTokenBlacklisted(decoded.jti);
      if (isBlacklisted) {
        console.log('❌ Token is blacklisted (logged out)');
        
        // Log blacklisted token attempt
        await auditLogger.logAccess(
          decoded.id || 0,
          decoded.role || 'unknown',
          'authenticate_blacklisted',
          'api',
          null,
          'denied',
          {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          }
        );
        
        throw new AppError('Token has been invalidated', 401);
      }
    }
    
    // Extract role and jurisdiction from JWT and attach to request
    // Requirements: 9.1, 13.4
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      jurisdiction: decoded.jurisdiction || null
    };

    console.log('✅ Token decoded:', { 
      id: decoded.id, 
      email: decoded.email, 
      role: decoded.role,
      jurisdiction: decoded.jurisdiction 
    });
    next();
  } catch (error) {
    console.log('❌ Token verification failed:', error instanceof Error ? error.message : error);
    
    // Log authentication failure
    // Requirement: 9.4
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      await auditLogger.logAccess(
        0,
        'unknown' as any,
        'authenticate_failed',
        'api',
        null,
        'denied',
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      );
    }
    
    next(new AppError('Invalid or expired token', 401));
  }
};

/**
 * Middleware to check if user has one of the specified roles
 * Super admin bypasses role checks (universal access)
 * Supports all 7 roles: super_admin, admin, pnp, bfp, mdrrmo, lgu_officer, citizen
 * Requirements: 2.1, 2.3, 9.2, 9.3, 9.5
 */
export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return next(new AppError('Authentication required', 401));
      }

      const { id: userId, role, email } = req.user;

      console.log('🔐 Authorization check:', {
        path: req.path,
        method: req.method,
        userId,
        userRole: role,
        userRoleType: typeof role,
        allowedRoles: roles,
        hasPermission: roles.includes(role)
      });

      // Super admin has universal access - bypass role checks
      // Requirements: 2.1, 2.3
      if (role === 'super_admin') {
        console.log('✅ Super admin - universal access granted');
        
        // Log successful authorization
        await auditLogger.logAccess(
          userId,
          role as any,
          `access_${req.method}_${req.path}`,
          req.path,
          null,
          'success',
          {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            superAdminBypass: true
          }
        );

        return next();
      }

      // Check if user's role is in the allowed roles list
      // Requirement: 9.2
      if (!roles.includes(role)) {
        console.log('❌ Authorization FAILED - role mismatch');
        
        // Log authorization failure to audit logs
        // Requirement: 9.3
        await auditLogger.logAccess(
          userId,
          role as any,
          `access_${req.method}_${req.path}`,
          req.path,
          null,
          'denied',
          {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          }
        );

        return next(new AppError('Insufficient permissions', 403));
      }

      console.log('✅ Authorization SUCCESS');
      
      // Log successful authorization
      await auditLogger.logAccess(
        userId,
        role as any,
        `access_${req.method}_${req.path}`,
        req.path,
        null,
        'success',
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      );

      // Authorization successful, proceed to business logic
      // Requirement: 9.5
      next();
    } catch (error) {
      console.log('❌ Authorization error:', error);
      next(new AppError('Authorization check failed', 500));
    }
  };
};

/**
 * Middleware to check if user's role has specific permission for a resource and action
 * Super admin bypasses all permission checks (universal access)
 * Requirements: 2.1, 2.3, 9.2, 9.3, 9.5
 */
export const requirePermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete' | 'execute') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      // Requirement: 9.2
      if (!req.user) {
        console.log('❌ Permission check failed - not authenticated');
        return next(new AppError('Authentication required', 401));
      }

      const { id: userId, role, email } = req.user;

      console.log('🔐 Permission check:', {
        path: req.path,
        method: req.method,
        userId,
        role,
        resource,
        action
      });

      // Super admin has universal access - bypass permission checks
      // Requirements: 2.1, 2.3
      if (role === 'super_admin') {
        console.log('✅ Super admin - universal access granted');
        
        // Log successful authorization
        await auditLogger.logAccess(
          userId,
          role as any,
          `${action}_${resource}`,
          resource,
          null,
          'success',
          {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            superAdminBypass: true
          }
        );

        return next();
      }

      // Query permission service to check if role has permission
      // Requirement: 9.2, 9.3
      const hasPermission = await permissionService.hasPermission(
        role as any,
        resource,
        action
      );

      if (!hasPermission) {
        console.log('❌ Permission DENIED');
        
        // Log authorization failure to audit logs
        // Requirement: 9.3
        await auditLogger.logAccess(
          userId,
          role as any,
          `${action}_${resource}`,
          resource,
          null,
          'denied',
          {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          }
        );

        return next(new AppError('Insufficient permissions', 403));
      }

      console.log('✅ Permission GRANTED');
      
      // Log successful authorization
      await auditLogger.logAccess(
        userId,
        role as any,
        `${action}_${resource}`,
        resource,
        null,
        'success',
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }
      );

      // Authorization successful, proceed to business logic
      // Requirement: 9.5
      next();
    } catch (error) {
      console.log('❌ Permission check error:', error);
      next(new AppError('Authorization check failed', 500));
    }
  };
};
