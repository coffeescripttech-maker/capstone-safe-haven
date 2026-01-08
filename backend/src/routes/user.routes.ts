import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// All routes require authentication and admin/lgu_officer role
router.get('/', authenticate, authorize('admin', 'lgu_officer'), userController.getUsers.bind(userController));
router.get('/statistics', authenticate, authorize('admin', 'lgu_officer'), userController.getStatistics.bind(userController));
router.get('/:id', authenticate, authorize('admin', 'lgu_officer'), userController.getUserById.bind(userController));
router.put('/:id', authenticate, authorize('admin', 'lgu_officer'), userController.updateUser.bind(userController));
router.delete('/:id', authenticate, authorize('admin', 'lgu_officer'), userController.deleteUser.bind(userController));

// Reset user password (admin only)
router.post('/:id/reset-password', authenticate, authorize('admin'), userController.resetPassword.bind(userController));

export default router;
