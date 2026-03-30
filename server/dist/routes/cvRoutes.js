"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cvController_1 = __importDefault(require("../controllers/cvController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const multer_1 = __importDefault(require("multer"));
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        }
        else {
            cb(new Error('Sadece PDF ve DOCX dosyaları yüklenebilir.'));
        }
    }
});
router.get('/all-active-cvs', authMiddleware_1.default, cvController_1.default.getAllActiveCVs);
router.get('/:id/cvs', authMiddleware_1.default, cvController_1.default.getUserCVs);
router.put('/cvs/:cvId/activate', authMiddleware_1.default, cvController_1.default.activateCV);
router.delete('/cvs/:cvId', authMiddleware_1.default, cvController_1.default.deleteCV);
router.get('/cvs/:cvId/download-pdf', authMiddleware_1.default, cvController_1.default.downloadCvPdf);
router.get('/cv-download/:fileId', authMiddleware_1.default, cvController_1.default.downloadCV);
router.post('/upload-cv', authMiddleware_1.default, rateLimiter_1.uploadLimiter, upload.single('cvFile'), cvController_1.default.uploadCV);
router.get('/:cvId/pdf', cvController_1.default.downloadCvPdf);
exports.default = router;
