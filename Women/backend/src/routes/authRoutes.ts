import { Router } from 'express';
import { authController } from '../controllers/authController';
import { requireAuth, authRateLimiter } from '../middleware/auth';

const router = Router();

router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.get('/verify-email', authController.verifyEmailAddress);
router.get('/me', requireAuth, authController.getProfile);

export default router;
