"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = __importDefault(require("../services/userService"));
const getUsers = async (req, res, next) => {
    try {
        const currentUserId = req.user?.id;
        const users = await userService_1.default.getAllUsers(currentUserId);
        res.json({ success: true, data: users });
    }
    catch (error) {
        next(error);
    }
};
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedUser = await userService_1.default.updateUser(id, req.body);
        res.json({ success: true, message: "Güncellendi", data: updatedUser });
    }
    catch (error) {
        next(error);
    }
};
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await userService_1.default.deleteUser(id);
        res.json({ success: true, message: "Silindi" });
    }
    catch (error) {
        next(error);
    }
};
const requestUpgrade = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        await userService_1.default.requestUpgrade(userId);
        res.json({ success: true, message: "Talebini aldık! Yönetici onayladığında PRO olacaksın." });
    }
    catch (error) {
        next(error);
    }
};
const handleUpgradeRequest = async (req, res, next) => {
    try {
        const { userId, action } = req.body;
        await userService_1.default.handleUpgrade(userId, action);
        res.json({ success: true, message: `İşlem Başarılı: ${action}` });
    }
    catch (error) {
        next(error);
    }
};
const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: "Dosya yok" });
            return;
        }
        const userId = req.user?.id;
        const savedImage = await userService_1.default.uploadProfileImage(userId, req.file);
        res.json({ success: true, message: "Resim yüklendi!", data: savedImage });
    }
    catch (error) {
        next(error);
    }
};
const togglePrivacy = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.id);
        const { isPrivate } = req.body;
        if (req.user?.id !== userId && req.user?.role !== 'SUPERADMIN') {
            res.status(403).json({ success: false, message: "Başkasının gizlilik ayarını değiştiremezsiniz!" });
            return;
        }
        const updatedUser = await userService_1.default.updateUser(userId, { isPrivate });
        res.json({ success: true, message: `Hesap artık ${isPrivate ? 'Gizli' : 'Herkese Açık'}.`, data: updatedUser });
    }
    catch (error) {
        next(error);
    }
};
const blockUser = async (req, res, next) => {
    try {
        const blockerId = req.user?.id;
        const blockedId = req.params.id;
        await userService_1.default.blockUser(blockerId, blockedId);
        res.json({ success: true, message: "Kullanıcı engellendi." });
    }
    catch (error) {
        next(error);
    }
};
const unblockUser = async (req, res, next) => {
    try {
        const blockerId = req.user?.id;
        const blockedId = req.params.id;
        await userService_1.default.unblockUser(blockerId, blockedId);
        res.json({ success: true, message: "Kullanıcının engeli kaldırıldı." });
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    getUsers,
    updateUser,
    deleteUser,
    requestUpgrade,
    handleUpgradeRequest,
    uploadAvatar,
    togglePrivacy,
    blockUser,
    unblockUser
};
