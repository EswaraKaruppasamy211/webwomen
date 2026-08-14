import { Router } from 'express';
import { checkinController } from '../controllers/checkinController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/active', checkinController.getActiveCheckin);
router.post('/start', checkinController.startCheckin);
router.post('/:id/confirm-safe', checkinController.confirmSafe);
router.post('/:id/cancel', checkinController.cancelCheckin);

export default router;
