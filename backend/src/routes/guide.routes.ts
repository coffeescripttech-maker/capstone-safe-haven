import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => res.json({ message: 'Get preparedness guides' }));
router.get('/:id', (req, res) => res.json({ message: 'Get guide by ID' }));

export default router;
