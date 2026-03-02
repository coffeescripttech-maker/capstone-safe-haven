import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requirePermission } from '../middleware/auth';
import { requireActiveEmergency } from '../middleware/emergencyAccess';

const router = Router();
const userController = new UserController();

// All routes require authentication and specific permissions
// Requirements: 2.2, 3.3, 11.4

// Get all users - requires 'read' permission on 'users' resource
router.get('/', authenticate, requirePermission('users', 'read'), userController.getUsers.bind(userController));

// Get user statistics - requires 'read' permission on 'users' resource
router.get('/statistics', authenticate, requirePermission('users', 'read'), userController.getStatistics.bind(userController));

// Get citizen locations - requires active emergency for PNP
// Requirements: 4.4
router.get('/locations', authenticate, requireActiveEmergency, userController.getCitizenLocations.bind(userController));

// Get user by ID - requires 'read' permission on 'users' resource
router.get('/:id', authenticate, requirePermission('users', 'read'), userController.getUserById.bind(userController));

// Update user - requires 'update' permission on 'users' resource with hierarchy check
router.put('/:id', authenticate, requirePermission('users', 'update'), userController.updateUser.bind(userController));

// Delete user - requires 'delete' permission on 'users' resource with hierarchy check
router.delete('/:id', authenticate, requirePermission('users', 'delete'), userController.deleteUser.bind(userController));

// Reset user password - requires 'update' permission on 'users' resource
router.post('/:id/reset-password', authenticate, requirePermission('users', 'update'), userController.resetPassword.bind(userController));

export default router;
