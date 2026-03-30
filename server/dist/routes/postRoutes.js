"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController_1 = __importDefault(require("../controllers/postController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/', authMiddleware_1.default, upload.array('images', 10), postController_1.default.createPost);
router.get('/', authMiddleware_1.default, postController_1.default.getAllPosts);
router.get('/image/:fileId', postController_1.default.getImage);
router.delete('/:id', authMiddleware_1.default, postController_1.default.deletePost);
exports.default = router;
