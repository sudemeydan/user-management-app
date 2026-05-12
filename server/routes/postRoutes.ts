import express, { Router } from 'express';
import postController from '../controllers/postController';
import authMiddleware from '../middlewares/authMiddleware';
import multer from 'multer';

const router: Router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', authMiddleware, upload.array('images', 10), postController.createPost);
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Tüm gönderileri getirir
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gönderiler başarıyla getirildi.
 *       401:
 *         description: Yetkisiz erişim.
 */
router.get('/', authMiddleware, postController.getAllPosts);
router.get('/image/:fileId', postController.getImage);
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Belirli bir gönderiyi siler
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek gönderinin ID'si
 *     responses:
 *       200:
 *         description: Gönderi başarıyla silindi.
 *       401:
 *         description: Yetkisiz erişim.
 *       404:
 *         description: Gönderi bulunamadı.
 */
router.delete('/:id', authMiddleware, postController.deletePost);

export default router;
