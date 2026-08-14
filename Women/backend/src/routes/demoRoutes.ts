import { Router } from 'express';
import { demoController } from '../controllers/demoController';

const router = Router();

router.post('/simulate-sos', demoController.simulateSOS);
router.post('/simulate-movement', demoController.simulateMovement);
router.post('/reset', demoController.resetDemo);

export default router;
