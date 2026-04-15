import express, { Router, Request } from 'express';
import employerController from '../controllers/employerController';
import verifyToken from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import multer, { FileFilterCallback } from 'multer';

const router: Router = express.Router();

// Multer: CV dosyası yükleme (PDF & DOCX)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Sadece PDF ve DOCX dosyaları yüklenebilir.'));
    }
  }
});

// İş İlanı CRUD
router.post('/job-postings', verifyToken, roleMiddleware(['SUPERADMIN', 'ADMIN', 'EMPLOYER']), employerController.createJobPosting);
router.get('/job-postings', verifyToken, roleMiddleware(['SUPERADMIN', 'ADMIN', 'EMPLOYER']), employerController.getMyJobPostings);
router.get('/job-postings/:id', verifyToken, roleMiddleware(['SUPERADMIN', 'ADMIN', 'EMPLOYER']), employerController.getJobPostingDetail);
router.delete('/job-postings/:id', verifyToken, roleMiddleware(['SUPERADMIN', 'ADMIN', 'EMPLOYER']), employerController.deleteJobPosting);

// Başvuru İşlemleri
router.post('/job-postings/:id/applications', verifyToken, roleMiddleware(['SUPERADMIN', 'ADMIN', 'EMPLOYER']), upload.single('cvFile'), employerController.uploadApplication);
router.delete('/applications/:appId', verifyToken, roleMiddleware(['SUPERADMIN', 'ADMIN', 'EMPLOYER']), employerController.deleteApplication);

// AI Analiz
router.post('/job-postings/:id/analyze-all', verifyToken, roleMiddleware(['SUPERADMIN', 'ADMIN', 'EMPLOYER']), employerController.analyzeAllApplications);

export default router;
