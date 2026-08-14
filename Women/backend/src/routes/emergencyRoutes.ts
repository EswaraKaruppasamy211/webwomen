import { Router } from 'express';
import { emergencyController } from '../controllers/emergencyController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.post('/', emergencyController.createIncident);
router.get('/active', emergencyController.getActiveIncident);
router.get('/all', emergencyController.getAllIncidents);
router.get('/:id', emergencyController.getIncident);
router.patch('/:id/status', emergencyController.updateStatus);
router.post('/:id/location', emergencyController.addLocationUpdate);

export default router;
