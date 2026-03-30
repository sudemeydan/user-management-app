"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = __importDefault(require("../controllers/userController"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const roleMiddleware_1 = __importDefault(require("../middlewares/roleMiddleware"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
const cvUpload = (0, multer_1.default)({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Sadece PDF ve DOCX formatları kabul edilmektedir."));
        }
    }
});
router.get('/', authMiddleware_1.default, userController_1.default.getUsers);
router.post('/request-upgrade', authMiddleware_1.default, userController_1.default.requestUpgrade);
router.patch('/:id/privacy', authMiddleware_1.default, userController_1.default.togglePrivacy);
router.post('/:id/block', authMiddleware_1.default, userController_1.default.blockUser);
router.delete('/:id/block', authMiddleware_1.default, userController_1.default.unblockUser);
router.put('/:id', authMiddleware_1.default, (0, roleMiddleware_1.default)(['PRO_USER', 'SUPERADMIN']), userController_1.default.updateUser);
router.delete('/:id', authMiddleware_1.default, (0, roleMiddleware_1.default)(['SUPERADMIN']), userController_1.default.deleteUser);
router.post('/handle-upgrade', authMiddleware_1.default, (0, roleMiddleware_1.default)(['SUPERADMIN']), userController_1.default.handleUpgradeRequest);
router.post('/upload-avatar', authMiddleware_1.default, upload.single('image'), userController_1.default.uploadAvatar);
exports.default = router;
