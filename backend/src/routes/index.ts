import { Router } from 'express';
import authRoutes from './auth.routes';
import alertRoutes from './alert.routes';
import evacuationRoutes from './evacuation.routes';
import emergencyContactRoutes from './emergencyContact.routes';
import sosRoutes from './sos.routes';
import incidentRoutes from './incident.routes';
import groupRoutes from './group.routes';
import bulletinRoutes from './bulletin.routes';
import guideRoutes from './guide.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/alerts', alertRoutes);
router.use('/evacuation-centers', evacuationRoutes);
router.use('/emergency-contacts', emergencyContactRoutes);
router.use('/sos', sosRoutes);
router.use('/incidents', incidentRoutes);
router.use('/groups', groupRoutes);
router.use('/bulletin', bulletinRoutes);
router.use('/guides', guideRoutes);
router.use('/users', userRoutes);

export default router;
