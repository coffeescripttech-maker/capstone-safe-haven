// Admin Routes - Dashboard and analytics endpoints

import express from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, requirePermission, authorize } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);

// Dashboard statistics - requires 'read' permission on 'analytics' resource
// Requirements: 2.4, 6.5
router.get('/stats', requirePermission('analytics', 'read'), adminController.getStats);

// Analytics data - requires 'read' permission on 'analytics' resource
// Requirements: 2.4, 6.5
router.get('/analytics', requirePermission('analytics', 'read'), adminController.getAnalytics);

// Recent activity - requires 'read' permission on 'analytics' resource
router.get('/activity', requirePermission('analytics', 'read'), adminController.getActivity);

// System health - requires 'read' permission on 'analytics' resource
router.get('/health', requirePermission('analytics', 'read'), adminController.getHealth);

// Reports endpoint - requires 'read' permission on 'reports' resource
// Requirements: 2.4, 6.5
router.get('/reports', requirePermission('reports', 'read'), adminController.getReports);

// ===== Permission Management Routes =====
// Requirements: 15.3, 15.4, 15.5
// All permission management routes require super_admin role

// Get all permissions or permissions for a specific role
router.get('/permissions', authorize('super_admin'), adminController.getAllPermissions);

// Get permission change history
router.get('/permissions/history', authorize('super_admin'), adminController.getPermissionHistory);

// Add a new permission
router.post('/permissions', authorize('super_admin'), adminController.addPermission);

// Remove a permission
router.delete('/permissions/:id', authorize('super_admin'), adminController.removePermission);

// ===== Audit Log Viewer Routes =====
// Requirements: 2.4, 12.1, 12.2
// Audit log routes require admin or super_admin role

// Get audit logs with filtering and pagination
router.get('/audit-logs', authorize('admin', 'super_admin'), adminController.getAuditLogs);

// Get audit log statistics
router.get('/audit-logs/stats', authorize('admin', 'super_admin'), adminController.getAuditLogStats);

export default router;
