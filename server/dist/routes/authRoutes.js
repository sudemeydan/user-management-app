"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = express_1.default.Router();
router.post('/register', rateLimiter_1.authLimiter, authController_1.default.registerUser);
router.post('/login', rateLimiter_1.authLimiter, authController_1.default.login);
router.post('/refresh', authController_1.default.refresh);
router.post('/forgot-password', rateLimiter_1.authLimiter, authController_1.default.forgotPassword);
router.post('/reset-password/:token', authController_1.default.resetPassword);
// Email Verification
router.post('/verify-email/:token', authController_1.default.verifyEmail);
exports.default = router;
