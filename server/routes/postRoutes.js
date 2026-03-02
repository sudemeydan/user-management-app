const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post('/', authMiddleware, upload.array('images', 10), postController.createPost);

router.get('/', authMiddleware, postController.getAllPosts);

router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;