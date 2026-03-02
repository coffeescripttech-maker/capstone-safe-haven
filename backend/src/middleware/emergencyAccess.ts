import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';
import { auditLogger } from '../services/auditLogger.service';

/**
 * Middleware to check for active emergencies
 * Allows PNP access to citizen location data only during active emergencies
 * Requirements: 4.4
 */
export const requireActiveEmergency = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    const { id: userId, role } = req.user;

    console.log('🚨 Emergency access check:', {
      userId,
      role,
      path: req.path
    });

    // Only PNP role needs this check
    // Other roles (super_admin, admin, mdrrmo) have unrestricted access
    if (role !== 'pnp') {
      console.log('✅ Non-PNP role - emergency check bypassed');
      return next();
    }

    // Check for active emergencies (incidents or SOS alerts)
    const [emergencies] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM (
        SELECT id FROM incident_reports 
        WHERE status IN ('pending', 'verified', 'in_progress') 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        UNION ALL
        SELECT id FROM sos_alerts 
        WHERE status IN ('sent', 'acknowledged', 'responding')
        AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ) as active_emergencies`
    );

    const activeEmergencyCount = emergencies[0]?.count || 0;

    if (activeEmergencyCount === 0) {
      console.log('❌ No active emergencies - access denied');
      
      // Log denied access attempt
      await auditLogger.logAccess(
        userId,
        role as any,
        'access_citizen_location',
        'user_location',
        null,
        'denied',
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          reason: 'no_active_emergency'
        }
      );

      return next(new AppError('Access to citizen location data requires an active emergency', 403));
    }

    console.log(`✅ Active emergencies found: ${activeEmergencyCount} - access granted`);
    
    // Log successful access
    await auditLogger.logAccess(
      userId,
      role as any,
      'access_citizen_location',
      'user_location',
      null,
      'success',
      {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        activeEmergencies: activeEmergencyCount
      }
    );

    next();
  } catch (error) {
    console.log('❌ Emergency access check error:', error);
    next(new AppError('Emergency access check failed', 500));
  }
};

/**
 * Check if there are any active emergencies in the system
 * Used for conditional access control
 */
export const hasActiveEmergencies = async (): Promise<boolean> => {
  try {
    const [emergencies] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM (
        SELECT id FROM incident_reports 
        WHERE status IN ('pending', 'verified', 'in_progress') 
        AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        UNION ALL
        SELECT id FROM sos_alerts 
        WHERE status IN ('sent', 'acknowledged', 'responding')
        AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ) as active_emergencies`
    );

    return (emergencies[0]?.count || 0) > 0;
  } catch (error) {
    console.error('Error checking active emergencies:', error);
    return false;
  }
};
