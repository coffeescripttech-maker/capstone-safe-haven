// SOS Controller - Handles SOS alert requests

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sosService } from '../services/sos.service';
import { logger } from '../utils/logger';

export class SOSController {
  // Create new SOS alert
  async createSOS(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
        return;
      }

      const { latitude, longitude, message, userInfo, targetAgency } = req.body;

      // Validation
      if (!message) {
        res.status(400).json({
          status: 'error',
          message: 'Message is required'
        });
        return;
      }

      if (!userInfo || !userInfo.name) {
        res.status(400).json({
          status: 'error',
          message: 'User name is required'
        });
        return;
      }

      // Validate target agency
      const validAgencies = ['barangay', 'lgu', 'bfp', 'pnp', 'mdrrmo', 'all'];
      if (targetAgency && !validAgencies.includes(targetAgency)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid target agency'
        });
        return;
      }

      // Create SOS alert
      const sosAlert = await sosService.createSOSAlert({
        userId,
        latitude,
        longitude,
        message,
        userInfo,
        targetAgency: targetAgency || 'all'
      });

      logger.info(`SOS alert created by user ${userId}: ${sosAlert.id}, target: ${targetAgency || 'all'}`);

      res.status(201).json({
        status: 'success',
        message: 'SOS alert sent successfully',
        data: {
          id: sosAlert.id,
          status: sosAlert.status,
          targetAgency: sosAlert.targetAgency,
          createdAt: sosAlert.createdAt
        }
      });
    } catch (error) {
      logger.error('Error creating SOS alert:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send SOS alert'
      });
    }
  }

  // Get user's SOS alerts
  async getMySOS(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;

      const result = await sosService.getSOSAlerts({
        userId,
        status,
        page,
        limit
      });

      res.json({
        status: 'success',
        data: {
          alerts: result.alerts,
          total: result.total,
          page,
          limit
        }
      });
    } catch (error) {
      logger.error('Error getting user SOS alerts:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve SOS alerts'
      });
    }
  }

  // Get all SOS alerts (Admin only)
  async getAllSOS(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const priority = req.query.priority as string;

      const result = await sosService.getSOSAlerts({
        status,
        priority,
        page,
        limit,
        userRole: req.user?.role,
        userJurisdiction: req.user?.jurisdiction
      });

      res.json({
        status: 'success',
        data: {
          alerts: result.alerts,
          total: result.total,
          page,
          limit
        }
      });
    } catch (error) {
      logger.error('Error getting all SOS alerts:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve SOS alerts'
      });
    }
  }

  // Get SOS alert by ID
  async getSOSById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const userRole = req.user?.role;

      const sosAlert = await sosService.getSOSAlertById(id);

      if (!sosAlert) {
        res.status(404).json({
          status: 'error',
          message: 'SOS alert not found'
        });
        return;
      }

      // Check authorization
      // 1. User can see their own alerts
      // 2. Super admin and admin can see all alerts
      // 3. Responders can see alerts targeted to them or 'all'
      const isOwner = sosAlert.userId === userId;
      const isAdmin = userRole === 'super_admin' || userRole === 'admin';
      
      // Check if responder can see this alert based on target_agency
      let canViewAsResponder = false;
      if (userRole && ['pnp', 'bfp', 'mdrrmo', 'lgu_officer'].includes(userRole)) {
        const targetAgency = (sosAlert as any).target_agency || 'all';
        
        if (targetAgency === 'all') {
          canViewAsResponder = true;
        } else if (userRole === 'lgu_officer' && (targetAgency === 'barangay' || targetAgency === 'lgu')) {
          canViewAsResponder = true;
        } else if (userRole === targetAgency) {
          canViewAsResponder = true;
        }
      }

      if (!isOwner && !isAdmin && !canViewAsResponder) {
        res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
        return;
      }

      res.json({
        status: 'success',
        data: sosAlert
      });
    } catch (error) {
      logger.error('Error getting SOS alert:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve SOS alert'
      });
    }
  }

  // Update SOS status (Admin/Responder only)
  async updateSOSStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id;
      const { status, notes } = req.body;

      if (!status) {
        res.status(400).json({
          status: 'error',
          message: 'Status is required'
        });
        return;
      }

      const validStatuses = ['acknowledged', 'responding', 'resolved', 'cancelled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid status'
        });
        return;
      }

      await sosService.updateSOSStatus(id, status, userId, notes);

      res.json({
        status: 'success',
        message: 'SOS alert status updated'
      });
    } catch (error) {
      logger.error('Error updating SOS status:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update SOS alert'
      });
    }
  }

  // Get SOS statistics
  async getSOSStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      // Regular users can only see their own stats
      // Role-based users see stats for their agency scope
      const filters: any = {};
      
      if (userRole === 'citizen') {
        // Citizens only see their own stats
        filters.userId = userId;
      } else if (userRole && userRole !== 'admin' && userRole !== 'super_admin') {
        // Agency-specific roles see stats for their scope
        filters.userRole = userRole;
      }
      // Admin and super_admin see all stats (no filters)

      const stats = await sosService.getSOSStatistics(filters);

      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      logger.error('Error getting SOS statistics:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve statistics'
      });
    }
  }
}

export const sosController = new SOSController();
