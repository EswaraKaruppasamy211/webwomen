import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

router.use(requireAdmin);

router.get('/overview', adminController.getOverview);
router.get('/analytics', adminController.getAnalytics);
router.get('/audit-logs', adminController.getAuditLogs);
router.post('/zones', adminController.createSafetyZone);

export default router;
