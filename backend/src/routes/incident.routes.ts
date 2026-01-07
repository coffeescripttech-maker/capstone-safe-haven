import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, (req, res) => res.json({ message: 'Report incident' }));
router.get('/', (req, res) => res.json({ message: 'Get incidents' }));

export default router;
