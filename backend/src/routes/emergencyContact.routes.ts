import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { EmergencyContactController } from '../controllers/emergencyContact.controller';
import { searchLimiter, createUpdateLimiter, adminLimiter } from '../middleware/rateLimiter';

const router = Router();
const contactController = new EmergencyContactController();

// Public routes
router.get('/', contactController.getContacts);
router.get('/categories', contactController.getCategories);
router.get('/search', searchLimiter, contactController.searchContacts);
router.get('/category/:category', contactController.getByCategory);
router.get('/:id', contactController.getContactById);

// Admin routes with rate limiting
router.post('/', authenticate, authorize('admin', 'lgu_officer'), createUpdateLimiter, contactController.createContact);
router.put('/:id', authenticate, authorize('admin', 'lgu_officer'), createUpdateLimiter, contactController.updateContact);
router.delete('/:id', authenticate, authorize('admin', 'lgu_officer'), adminLimiter, contactController.deactivateContact);

export default router;
