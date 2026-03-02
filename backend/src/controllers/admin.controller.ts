// Admin Controller - Dashboard statistics and analytics

import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth';
import { permissionService } from '../services/permission.service';
import { auditLogger } from '../services/auditLogger.service';

type Role = 
  | 'super_admin'
  | 'admin'
  | 'pnp'
  | 'bfp'
  | 'mdrrmo'
  | 'lgu_officer'
  | 'citizen';

type Action = 'create' | 'read' | 'update' | 'delete' | 'execute';

export const adminController = {
  // Get dashboard statistics
  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getDashboardStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard statistics'
      });
    }
  },

  // Get analytics data
  async getAnalytics(req: Request, res: Response) {
    try {
      const { days = 30 } = req.query;
      const analytics = await adminService.getAnalytics(Number(days));
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get analytics data'
      });
    }
  },

  // Get recent activity
  async getActivity(req: Request, res: Response) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const activity = await adminService.getRecentActivity(
        Number(limit),
        Number(offset)
      );
      
      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('Error getting activity:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get activity data'
      });
    }
  },

  // Get system health
  async getHealth(req: Request, res: Response) {
    try {
      const health = await adminService.getSystemHealth();
      
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      console.error('Error getting system health:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get system health'
      });
    }
  },

  // Get reports with role-based filtering
  // Requirements: 2.4, 6.5
  async getReports(req: AuthRequest, res: Response) {
    try {
      const { type, startDate, endDate, format = 'json' } = req.query;
      const userRole = req.user?.role;
      const userJurisdiction = req.user?.jurisdiction;

      const reports = await adminService.getReports({
        type: type as string,
        startDate: startDate as string,
        endDate: endDate as string,
        format: format as string,
        userRole,
        userJurisdiction
      });
      
      res.json({
        success: true,
        data: reports
      });
    } catch (error) {
      console.error('Error getting reports:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get reports'
      });
    }
  },

  // ===== Permission Management Endpoints =====
  // Requirements: 15.3, 15.4, 15.5

  /**
   * Get all role permissions
   * GET /admin/permissions
   * Requirements: 15.3
   */
  async getAllPermissions(req: AuthRequest, res: Response) {
    try {
      const { role } = req.query;

      // If role filter is provided, get permissions for that role
      if (role) {
        const permissions = await permissionService.getPermissions(role as Role);
        return res.json({
          success: true,
          data: {
            role,
            permissions
          }
        });
      }

      // Otherwise, get all permissions from database
      const db = require('../config/database').default;
      const [rows] = await db.query(
        `SELECT id, role, resource, action, created_at 
         FROM role_permissions 
         ORDER BY role, resource, action`
      );

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Error getting permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get permissions'
      });
    }
  },

  /**
   * Add a new permission
   * POST /admin/permissions
   * Requirements: 15.3, 15.4, 15.5
   */
  async addPermission(req: AuthRequest, res: Response) {
    try {
      const { role, resource, action } = req.body;

      // Validate required fields
      if (!role || !resource || !action) {
        return res.status(400).json({
          success: false,
          message: 'Role, resource, and action are required'
        });
      }

      // Validate role
      const validRoles: Role[] = ['super_admin', 'admin', 'pnp', 'bfp', 'mdrrmo', 'lgu_officer', 'citizen'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role value'
        });
      }

      // Validate action
      const validActions: Action[] = ['create', 'read', 'update', 'delete', 'execute'];
      if (!validActions.includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid action value'
        });
      }

      // Prevent modifying super_admin permissions
      if (role === 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify super_admin permissions'
        });
      }

      // Add permission
      await permissionService.addPermission(role, resource, action);

      // Log permission change
      await auditLogger.logPermissionChange(
        req.user!.id,
        req.user!.role as Role,
        role,
        resource,
        action,
        'add',
        req.ip,
        req.get('user-agent')
      );

      res.status(201).json({
        success: true,
        message: 'Permission added successfully',
        data: { role, resource, action }
      });
    } catch (error: any) {
      console.error('Error adding permission:', error);
      
      // Handle duplicate permission error
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Permission already exists'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to add permission'
      });
    }
  },

  /**
   * Remove a permission
   * DELETE /admin/permissions/:id
   * Requirements: 15.3, 15.4, 15.5
   */
  async removePermission(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Get permission details before deleting
      const db = require('../config/database').default;
      const [rows] = await db.query(
        'SELECT role, resource, action FROM role_permissions WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Permission not found'
        });
      }

      const permission = rows[0];

      // Prevent removing super_admin permissions
      if (permission.role === 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot remove super_admin permissions'
        });
      }

      // Remove permission
      await permissionService.removePermission(
        permission.role,
        permission.resource,
        permission.action
      );

      // Log permission change
      await auditLogger.logPermissionChange(
        req.user!.id,
        req.user!.role as Role,
        permission.role,
        permission.resource,
        permission.action,
        'remove',
        req.ip,
        req.get('user-agent')
      );

      res.json({
        success: true,
        message: 'Permission removed successfully'
      });
    } catch (error) {
      console.error('Error removing permission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove permission'
      });
    }
  },

  /**
   * Get permission change history from audit logs
   * GET /admin/permissions/history
   * Requirements: 15.5
   */
  async getPermissionHistory(req: AuthRequest, res: Response) {
    try {
      const { limit = 50, offset = 0 } = req.query;

      const logs = await auditLogger.queryLogs({
        action: 'permission_add,permission_remove',
        limit: Number(limit),
        offset: Number(offset)
      });

      // Filter logs for permission changes
      const permissionLogs = logs.filter(log => 
        log.action === 'permission_add' || log.action === 'permission_remove'
      );

      res.json({
        success: true,
        data: permissionLogs
      });
    } catch (error) {
      console.error('Error getting permission history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get permission history'
      });
    }
  },

  // ===== Audit Log Viewer Endpoints =====
  // Requirements: 2.4, 12.1, 12.2

  /**
   * Get audit logs with filtering and pagination
   * GET /admin/audit-logs
   * Requirements: 2.4, 12.1, 12.2
   */
  async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const {
        userId,
        role,
        action,
        status,
        startDate,
        endDate,
        limit = 50,
        offset = 0
      } = req.query;

      // Build filters
      const filters: any = {
        limit: Number(limit),
        offset: Number(offset)
      };

      if (userId) {
        filters.userId = Number(userId);
      }

      if (role) {
        filters.role = role as Role;
      }

      if (action) {
        filters.action = action as string;
      }

      if (status) {
        filters.status = status as 'success' | 'denied' | 'error';
      }

      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }

      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }

      // Query logs
      const logs = await auditLogger.queryLogs(filters);

      // Get total count for pagination
      const db = require('../config/database').default;
      const conditions: string[] = [];
      const params: any[] = [];

      if (userId) {
        conditions.push('user_id = ?');
        params.push(Number(userId));
      }

      if (role) {
        conditions.push('role = ?');
        params.push(role);
      }

      if (action) {
        conditions.push('action = ?');
        params.push(action);
      }

      if (status) {
        conditions.push('status = ?');
        params.push(status);
      }

      if (startDate) {
        conditions.push('created_at >= ?');
        params.push(new Date(startDate as string));
      }

      if (endDate) {
        conditions.push('created_at <= ?');
        params.push(new Date(endDate as string));
      }

      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}` 
        : '';

      const [countRows] = await db.query(
        `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
        params
      );

      const total = countRows[0].total;

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: Number(offset) + logs.length < total
          }
        }
      });
    } catch (error) {
      console.error('Error getting audit logs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get audit logs'
      });
    }
  },

  /**
   * Get audit log statistics
   * GET /admin/audit-logs/stats
   * Requirements: 2.4
   */
  async getAuditLogStats(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const filters: any = {};

      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }

      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }

      const stats = await auditLogger.getStatistics(filters);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting audit log statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get audit log statistics'
      });
    }
  }
};
