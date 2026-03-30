import express, { Router } from 'express';
import authController from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimiter';

const router: Router = express.Router();

router.post('/register', authLimiter, authController.registerUser);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Email Verification
router.post('/verify-email/:token', authController.verifyEmail);

export default router;
