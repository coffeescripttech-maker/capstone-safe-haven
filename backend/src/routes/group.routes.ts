import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, (req, res) => res.json({ message: 'Create group' }));
router.get('/my-groups', authenticate, (req, res) => res.json({ message: 'Get my groups' }));

export default router;
