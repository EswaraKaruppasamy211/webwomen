import { Router } from 'express';
import { navigationController } from '../controllers/navigationController';

const router = Router();

router.post('/route', navigationController.calculateRoutes);
router.get('/safe-places', navigationController.getSafePlaces);
router.get('/hazards', navigationController.getHazardHeatmap);

export default router;
