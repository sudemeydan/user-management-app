import express, { Router, Request } from 'express';
import userController from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import multer, { FileFilterCallback } from 'multer';

const router: Router = express.Router();

const upload = multer({ dest: 'uploads/' });

const cvUpload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Sadece PDF ve DOCX formatlarÄ± kabul edilmektedir."));
    }
  }
});

router.get('/', authMiddleware, userController.getUsers);
router.post('/request-upgrade', authMiddleware, userController.requestUpgrade);
router.patch('/:id/privacy', authMiddleware, userController.togglePrivacy);
router.post('/:id/block', authMiddleware, userController.blockUser);
router.delete('/:id/block', authMiddleware, userController.unblockUser);

router.put('/:id', authMiddleware, roleMiddleware(['PRO_USER', 'SUPERADMIN']), userController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['SUPERADMIN']), userController.deleteUser);
router.post('/handle-upgrade', authMiddleware, roleMiddleware(['SUPERADMIN']), userController.handleUpgradeRequest);

router.post('/upload-avatar', authMiddleware, upload.single('image'), userController.uploadAvatar);

export default router;
