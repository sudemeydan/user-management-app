const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware'); 

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/register', userController.createUser);
router.post('/login', userController.login);
router.post('/refresh', userController.refresh);
router.post('/request-upgrade', authMiddleware, userController.requestUpgrade);
router.patch('/:id/privacy', authMiddleware, userController.togglePrivacy);
router.get('/', authMiddleware, userController.getUsers);

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

router.post(
  '/upload-avatar', 
  authMiddleware, 
  upload.single('image'), 
  userController.uploadAvatar 
);

module.exports = router;