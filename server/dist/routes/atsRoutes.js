"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const atsController_1 = __importDefault(require("../controllers/atsController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = express_1.default.Router();
// Geleneksel atsController fonksiyonlarÄ±nÄ± Express Request, Response, NextFunction tipleriyle sarÄ±yoruz
router.post('/cvs/:cvId/optimize', authMiddleware_1.default, (req, res, next) => {
    atsController_1.default.optimizeCVFormat(req, res, next);
});
router.get('/cvs/:cvId/ats-status', authMiddleware_1.default, (req, res, next) => {
    atsController_1.default.getATSStatus(req, res, next);
});
exports.default = router;
