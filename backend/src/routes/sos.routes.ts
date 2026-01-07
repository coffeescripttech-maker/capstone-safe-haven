import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, (req, res) => res.json({ message: 'Create SOS alert' }));
router.get('/my-alerts', authenticate, (req, res) => res.json({ message: 'Get my SOS alerts' }));

export default router;
