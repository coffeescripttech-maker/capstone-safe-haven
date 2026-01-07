import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => res.json({ message: 'Get bulletin posts' }));
router.post('/', authenticate, (req, res) => res.json({ message: 'Create post' }));

export default router;
