import express, { Router, Request } from 'express';
import cvController from '../controllers/cvController';
import verifyToken from '../middlewares/authMiddleware';
import multer, { FileFilterCallback } from 'multer';
import { uploadLimiter } from '../middlewares/rateLimiter';

const router: Router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Sadece PDF ve DOCX dosyaları yüklenebilir.'));
    }
  }
});

router.get('/all-active-cvs', verifyToken, cvController.getAllActiveCVs);
router.get('/:id/cvs', verifyToken, cvController.getUserCVs);
router.put('/cvs/:cvId/activate', verifyToken, cvController.activateCV);
router.delete('/cvs/:cvId', verifyToken, cvController.deleteCV);
router.get('/cvs/:cvId/download-pdf', verifyToken, cvController.downloadCvPdf);

router.get('/cv-download/:fileId', verifyToken, cvController.downloadCV);
router.post('/upload-cv', verifyToken, uploadLimiter, upload.single('cvFile'), cvController.uploadCV);
router.get('/:cvId/pdf', cvController.downloadCvPdf);

export default router;
