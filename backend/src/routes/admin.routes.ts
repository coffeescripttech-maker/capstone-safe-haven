// Admin Routes - Dashboard and analytics endpoints

import express from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Dashboard statistics
router.get('/stats', adminController.getStats);

// Analytics data
router.get('/analytics', adminController.getAnalytics);

// Recent activity
router.get('/activity', adminController.getActivity);

// System health
router.get('/health', adminController.getHealth);

export default router;
