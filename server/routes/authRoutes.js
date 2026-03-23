const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registerUser);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Email Verification (Using GET typically, but keeping original POST from existing router logic)
// Based on typical implementation, it might have been expected as a GET from an email link.
router.post('/verify-email/:token', authController.verifyEmail);

module.exports = router;
