import { Router } from 'express';
import { contactController } from '../controllers/contactController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', contactController.getContacts);
router.post('/', contactController.addContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);
router.post('/:id/test-alert', contactController.testAlert);

export default router;
