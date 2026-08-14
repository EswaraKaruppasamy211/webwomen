import { Router } from 'express';
import authRoutes from './authRoutes';
import emergencyRoutes from './emergencyRoutes';
import contactRoutes from './contactRoutes';
import navigationRoutes from './navigationRoutes';
import aiRoutes from './aiRoutes';
import reportRoutes from './reportRoutes';
import checkinRoutes from './checkinRoutes';
import adminRoutes from './adminRoutes';
import demoRoutes from './demoRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/emergencies', emergencyRoutes);
router.use('/contacts', contactRoutes);
router.use('/navigation', navigationRoutes);
router.use('/ai', aiRoutes);
router.use('/reports', reportRoutes);
router.use('/checkins', checkinRoutes);
router.use('/admin', adminRoutes);
router.use('/demo', demoRoutes);

router.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'SafeHer AI Backend Services',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;
