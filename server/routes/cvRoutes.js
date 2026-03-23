const express = require('express');
const router = express.Router();
const cvController = require('../controllers/cvController');
const verifyToken = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // Yükleme limiti 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/msword' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Sadece PDF ve DOCX dosyaları yüklenebilir.'));
    }
  }
});

// CV Yönetim Rotaları
router.get('/all-active-cvs', verifyToken, cvController.getAllActiveCVs);
router.get('/:id/cvs', verifyToken, cvController.getUserCVs);
router.put('/cvs/:cvId/activate', verifyToken, cvController.activateCV);
router.delete('/cvs/:cvId', verifyToken, cvController.deleteCV);
router.get('/cvs/:cvId/download-pdf', verifyToken, cvController.downloadCvPdf);

// İndirme rotası
router.get('/cv-download/:fileId', verifyToken, cvController.downloadCV);

// POST /api/users/upload-cv
router.post('/upload-cv', verifyToken, upload.single('cvFile'), cvController.uploadCV);

// GET /api/cvs/:cvId/pdf (ATS/Classic formats download buffer)
router.get('/:cvId/pdf', cvController.downloadCvPdf);

module.exports = router;
