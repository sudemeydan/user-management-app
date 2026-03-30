import express, { Router } from 'express';
import postController from '../controllers/postController';
import authMiddleware from '../middlewares/authMiddleware';
import multer from 'multer';

const router: Router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', authMiddleware, upload.array('images', 10), postController.createPost);
router.get('/', authMiddleware, postController.getAllPosts);
router.get('/image/:fileId', postController.getImage);
router.delete('/:id', authMiddleware, postController.deletePost);

export default router;
