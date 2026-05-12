import express, { Router } from 'express';
import authController from '../controllers/authController';
import { authLimiter, loginEmailLimiter } from '../middlewares/rateLimiter';
import authMiddleware from '../middlewares/authMiddleware';

const router: Router = express.Router();

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Yeni kullanıcı kaydı oluşturur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sude Meydan
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sude@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla kaydedildi.
 *       400:
 *         description: Geçersiz veri gönderimi.
 */
router.post('/register', authLimiter, authController.registerUser);
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Kullanıcı girişi yapar
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: sudis.meydan@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Başarılı giriş. JWT Token döner.
 *       401:
 *         description: Hatalı e-posta veya şifre.
 */
router.post('/login', authLimiter, loginEmailLimiter, authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Email Verification
router.post('/verify-email/:token', authController.verifyEmail);

export default router;
