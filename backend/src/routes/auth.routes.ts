import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register/request-otp', AuthController.requestOtp);
router.post('/register/verify-otp', AuthController.verifyOtp);
router.post('/register/complete', AuthController.completeRegistration);
router.post('/login', AuthController.login);
router.post('/google', AuthController.googleLogin);
router.post('/logout', AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);

export default router;
