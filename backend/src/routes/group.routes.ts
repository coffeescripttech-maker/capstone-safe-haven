import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import groupController from '../controllers/group.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Group management
router.post('/', groupController.createGroup);
router.post('/join', groupController.joinGroup);
router.get('/my', groupController.getUserGroups);
router.get('/:id', groupController.getGroupById);
router.get('/:id/members', groupController.getGroupMembers);

// Location sharing
router.post('/location', groupController.shareLocation);

// Alerts
router.post('/alerts', groupController.sendGroupAlert);
router.get('/:id/alerts', groupController.getGroupAlerts);

// Member management
router.patch('/:id/member', groupController.updateMember);
router.delete('/:id/leave', groupController.leaveGroup);
router.delete('/:id/members/:userId', groupController.removeMember);

export default router;
