/**
 * Notification Routes - Handle mobile app notification registration and management
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const notificationController = new NotificationController();

// Register device token for push notifications
router.post('/register-device', authenticate, notificationController.registerDevice);

// Get unread notifications for user
router.get('/unread', authenticate, notificationController.getUnreadNotifications);

// Mark notifications as read
router.post('/mark-read', authenticate, notificationController.markNotificationsAsRead);

// Send test notification
router.post('/test', authenticate, notificationController.sendTestNotification);

// Get notification settings
router.get('/settings', authenticate, notificationController.getNotificationSettings);

// Update notification settings
router.put('/settings', authenticate, notificationController.updateNotificationSettings);

export default router;