import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/public', reportController.getApprovedReports);
router.get('/', requireAuth, reportController.getReports);
router.post('/', requireAuth, reportController.createReport);
router.patch('/:id/moderate', requireAdmin, reportController.moderateReport);
router.delete('/:id', requireAdmin, reportController.deleteReport);

export default router;
