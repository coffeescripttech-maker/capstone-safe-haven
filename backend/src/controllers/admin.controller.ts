// Admin Controller - Dashboard statistics and analytics

import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';

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
  }
};
