import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { AuthService } from '../services/auth.service';
import { auditLogger } from '../services/auditLogger.service';

const authService = new AuthService();

/**
 * Extended Request interface with user information
 */
export interface SMSAuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'super_admin' | 'admin' | 'pnp' | 'bfp' | 'mdrrmo' | 'lgu_officer' | 'citizen';
    jurisdiction?: string | null;
  };
}

/**
 * Location filters for recipient selection
 */
export interface LocationFilters {
  provinces?: string[];
  cities?: string[];
  barangays?: string[];
}

/**
 * SMS Blast Authentication Middleware
 * Provides role-based access control and jurisdiction enforcement for SMS blast functionality
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.6
 */
export class SMSAuthMiddleware {
  /**
   * Authenticate user by verifying JWT token
   * Requirement: 9.1 - Verify user authentication tokens
   */
  async authenticate(
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        // Log authentication failure
        await this.logUnauthorizedAccess(
          0,
          'unknown',
          'authenticate',
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown',
          'No token provided'
        );
        
        throw new AppError('Authentication required', 401);
      }

      // Verify and decode token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'default-secret-key'
      ) as any;
      
      // Check if token is blacklisted (logged out)
      if (decoded.jti) {
        const isBlacklisted = await authService.isTokenBlacklisted(decoded.jti);
        if (isBlacklisted) {
          await this.logUnauthorizedAccess(
            decoded.id || 0,
            decoded.role || 'unknown',
            'authenticate_blacklisted',
            req.ip || 'unknown',
            req.headers['user-agent'] || 'unknown',
            'Token has been invalidated'
          );
          
          throw new AppError('Token has been invalidated', 401);
        }
      }
      
      // Attach user information to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        jurisdiction: decoded.jurisdiction || null
      };

      next();
    } catch (error) {
      // Log authentication failure
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        await this.logUnauthorizedAccess(
          0,
          'unknown',
          'authenticate_failed',
          req.ip || 'unknown',
          req.headers['user-agent'] || 'unknown',
          error.message
        );
      }
      
      next(new AppError('Invalid or expired token', 401));
    }
  }

  /**
   * Middleware factory to check if user has required role for SMS blast operations
   * Requirements: 9.1, 9.2, 9.3
   */
  requireRole(...allowedRoles: Array<'super_admin' | 'admin' | 'mdrrmo' | 'pnp' | 'bfp' | 'lgu_officer'>): (
    req: SMSAuthRequest,
    res: Response,
    next: NextFunction
  ) => Promise<void> {
    return async (req: SMSAuthRequest, res: Response, next: NextFunction) => {
      try {
        // Check if user is authenticated
        if (!req.user) {
          throw new AppError('Authentication required', 401);
        }

        const { id: userId, role, email } = req.user;

        // Requirement 9.1: Only citizens cannot access SMS blast functionality
        // All other roles (MDRRMO, Admin, Super Admin, PNP, BFP, LGU Officer) have access
        if (role === 'citizen') {
          await this.logUnauthorizedAccess(
            userId,
            role,
            `access_sms_blast_${req.method}_${req.path}`,
            req.ip || 'unknown',
            req.headers['user-agent'] || 'unknown',
            'Citizen role cannot access SMS blast functionality'
          );
          
          throw new AppError('Insufficient permissions - SMS blast access restricted to government agencies only', 403);
        }

        // Check if user's role is in the allowed roles list
        if (!allowedRoles.includes(role as 'super_admin' | 'admin' | 'mdrrmo' | 'pnp' | 'bfp' | 'lgu_officer')) {
          await this.logUnauthorizedAccess(
            userId,
            role,
            `access_sms_blast_${req.method}_${req.path}`,
            req.ip || 'unknown',
            req.headers['user-agent'] || 'unknown',
            `Role ${role} not in allowed roles: ${allowedRoles.join(', ')}`
          );
          
          throw new AppError('Insufficient permissions', 403);
        }

        // Log successful authorization
        await auditLogger.logAccess(
          userId,
          role as any,
          `access_sms_blast_${req.method}_${req.path}`,
          req.path,
          null,
          'success',
          {
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          }
        );

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Check if Admin user's jurisdiction allows access to specified locations
   * Requirements: 9.2, 9.4
   * 
   * @param user - User object with role and jurisdiction
   * @param locations - Location filters to check against
   * @returns true if access is allowed, false otherwise
   */
  checkJurisdiction(
    user: SMSAuthRequest['user'],
    locations: LocationFilters
  ): boolean {
    if (!user) {
      return false;
    }

    // Requirement 9.3: Superadmin has unrestricted access
    if (user.role === 'super_admin') {
      return true;
    }

    // Requirement 9.2: Admin, MDRRMO, PNP, BFP, and LGU Officer users are restricted to their jurisdiction
    if (user.role === 'admin' || user.role === 'mdrrmo' || user.role === 'pnp' || user.role === 'bfp' || user.role === 'lgu_officer') {
      // If no jurisdiction is set, deny access
      if (!user.jurisdiction) {
        return false;
      }

      // Parse jurisdiction (format: "Province:City:Barangay" or "Province:City" or "Province")
      const jurisdictionParts = user.jurisdiction.split(':');
      const userProvince = jurisdictionParts[0] || null;
      const userCity = jurisdictionParts[1] || null;
      const userBarangay = jurisdictionParts[2] || null;

      // Check if requested locations are within jurisdiction
      // Admin can only access locations within their assigned area

      // Check provinces
      if (locations.provinces && locations.provinces.length > 0) {
        const hasAccess = locations.provinces.every(province => 
          userProvince === province
        );
        if (!hasAccess) {
          return false;
        }
      }

      // Check cities (only if user has city-level jurisdiction)
      if (locations.cities && locations.cities.length > 0) {
        if (!userCity) {
          // User has province-level jurisdiction, can access any city in their province
          return true;
        }
        const hasAccess = locations.cities.every(city => 
          userCity === city
        );
        if (!hasAccess) {
          return false;
        }
      }

      // Check barangays (only if user has barangay-level jurisdiction)
      if (locations.barangays && locations.barangays.length > 0) {
        if (!userBarangay) {
          // User has city or province-level jurisdiction, can access any barangay
          return true;
        }
        const hasAccess = locations.barangays.every(barangay => 
          userBarangay === barangay
        );
        if (!hasAccess) {
          return false;
        }
      }

      return true;
    }

    // Other roles don't have SMS blast access
    return false;
  }

  /**
   * Log unauthorized access attempt to audit logs
   * Requirement: 9.6 - Log unauthorized access attempts
   * 
   * @param userId - User ID attempting access
   * @param role - User role
   * @param action - Action attempted
   * @param ipAddress - IP address of request
   * @param userAgent - User agent string
   * @param reason - Reason for denial
   */
  async logUnauthorizedAccess(
    userId: number,
    role: string,
    action: string,
    ipAddress: string,
    userAgent: string,
    reason: string
  ): Promise<void> {
    try {
      await auditLogger.logAccess(
        userId,
        role as any,
        action,
        'sms_blast',
        null,
        'denied',
        {
          ipAddress,
          userAgent,
          denialReason: reason
        }
      );
    } catch (error) {
      // Log error but don't throw - audit failures should not break requests
      console.error('Failed to log unauthorized access:', error);
    }
  }

  /**
   * Middleware to enforce jurisdiction restrictions on SMS blast operations
   * Requirements: 9.2, 9.4
   */
  enforceJurisdiction(
    getLocationsFromRequest: (req: SMSAuthRequest) => LocationFilters
  ): (req: SMSAuthRequest, res: Response, next: NextFunction) => Promise<void> {
    return async (req: SMSAuthRequest, res: Response, next: NextFunction) => {
      try {
        if (!req.user) {
          throw new AppError('Authentication required', 401);
        }

        const locations = getLocationsFromRequest(req);
        const hasAccess = this.checkJurisdiction(req.user, locations);

        if (!hasAccess) {
          await this.logUnauthorizedAccess(
            req.user.id,
            req.user.role,
            `jurisdiction_violation_${req.method}_${req.path}`,
            req.ip || 'unknown',
            req.headers['user-agent'] || 'unknown',
            `Admin attempted to access locations outside jurisdiction: ${JSON.stringify(locations)}`
          );
          
          throw new AppError('Access denied - locations outside your jurisdiction', 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

// Export singleton instance
export const smsAuthMiddleware = new SMSAuthMiddleware();

// Export convenience methods
export const authenticateSMS = (req: SMSAuthRequest, res: Response, next: NextFunction) =>
  smsAuthMiddleware.authenticate(req, res, next);

export const requireSMSRole = (...roles: Array<'super_admin' | 'admin' | 'mdrrmo' | 'pnp' | 'bfp' | 'lgu_officer'>) =>
  smsAuthMiddleware.requireRole(...roles);

export const enforceSMSJurisdiction = (
  getLocations: (req: SMSAuthRequest) => LocationFilters
) => smsAuthMiddleware.enforceJurisdiction(getLocations);
