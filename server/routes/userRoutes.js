const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// --- MULTER AYARLARI ---
const multer = require('multer');

// 1. Orijinal ayar (Profil resimleri vb. için mevcut olan)
const upload = multer({ dest: 'uploads/' });

// 2. YENİ EKLENEN: Sadece PDF ve DOCX (Word) kabul eden, 5MB limitli CV yükleme ayarı
const cvUpload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB sınır
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/msword' // doc
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Sadece PDF ve DOCX formatları kabul edilmektedir."));
    }
  }
});


// --- AUTH VE KAYIT ROTALARI ---
router.post('/register', userController.createUser);
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/login', userController.login);
router.post('/refresh', userController.refresh);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);

// --- KULLANICI İŞLEMLERİ ROTALARI ---
router.get('/', authMiddleware, userController.getUsers);
router.post('/request-upgrade', authMiddleware, userController.requestUpgrade);
router.patch('/:id/privacy', authMiddleware, userController.togglePrivacy);
router.post('/:id/block', authMiddleware, userController.blockUser);
router.delete('/:id/block', authMiddleware, userController.unblockUser);

router.put('/:id',
  authMiddleware,
  roleMiddleware(['PRO_USER', 'SUPERADMIN']),
  userController.updateUser
);

router.delete('/:id',
  authMiddleware,
  roleMiddleware(['SUPERADMIN']),
  userController.deleteUser
);

router.post('/handle-upgrade',
  authMiddleware,
  roleMiddleware(['SUPERADMIN']),
  userController.handleUpgradeRequest
);

// Mevcut profil resmi yükleme rotası
router.post(
  '/upload-avatar',
  authMiddleware,
  upload.single('image'),
  userController.uploadAvatar
);

router.post(
  '/upload-cv',
  authMiddleware,
  cvUpload.single('cvFile'), // Frontend'den dosyayı 'cvFile' adıyla bekliyoruz
  userController.uploadCV
);

// CV Yönetim Rotaları
router.get('/all-active-cvs', authMiddleware, userController.getAllActiveCVs);
router.get('/:id/cvs', authMiddleware, userController.getUserCVs);
router.put('/cvs/:cvId/activate', authMiddleware, userController.activateCV);
router.delete('/cvs/:cvId', authMiddleware, userController.deleteCV);

// İndirme rotasında token gönderilmesini istiyoruz ki gizli belge indirilmesin
router.get('/cv-download/:fileId', authMiddleware, userController.downloadCV);

module.exports = router;