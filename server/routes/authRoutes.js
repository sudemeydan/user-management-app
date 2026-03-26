const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');

router.post('/register', authLimiter, authController.registerUser);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Email Verification (Using GET typically, but keeping original POST from existing router logic)
// Based on typical implementation, it might have been expected as a GET from an email link.
router.post('/verify-email/:token', authController.verifyEmail);

module.exports = router;
