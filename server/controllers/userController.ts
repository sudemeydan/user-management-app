import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import logger from '../utils/logger';

const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUserId = req.user?.id as string | number | undefined;
    const users = await userService.getAllUsers(currentUserId);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(id, req.body);
    
    // Log if updated by an admin (or user themselves, but we focus on admins)
    if (req.user?.role === 'SUPERADMIN' || req.user?.role === 'ADMIN') {
        logger.info('Admin updated user', { action: 'ADMIN_UPDATE_USER', adminId: req.user?.id, targetUserId: id, updates: req.body });
    }
    
    res.json({ success: true, message: "Güncellendi", data: updatedUser });
  } catch (error: any) {
    logger.error('Failed to update user', { action: 'UPDATE_USER_FAILED', error: error.message, targetUserId: req.params.id });
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    
    if (req.user?.role === 'SUPERADMIN' || req.user?.role === 'ADMIN') {
        logger.info('Admin deleted user', { action: 'ADMIN_DELETE_USER', adminId: req.user?.id, targetUserId: id });
    }

    res.json({ success: true, message: "Silindi" });
  } catch (error: any) {
    logger.error('Failed to delete user', { action: 'DELETE_USER_FAILED', error: error.message, targetUserId: req.params.id });
    next(error);
  }
};

const requestUpgrade = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id as string | number;
    await userService.requestUpgrade(userId);
    res.json({ success: true, message: "Talebini aldık! Yönetici onayladığında PRO olacaksın." });
  } catch (error) {
    next(error);
  }
};

const handleUpgradeRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, action } = req.body;
    await userService.handleUpgrade(userId, action);
    
    logger.info('Admin handled upgrade request', { action: 'ADMIN_HANDLE_UPGRADE', adminId: req.user?.id, targetUserId: userId, decision: action });
    
    res.json({ success: true, message: `İşlem Başarılı: ${action}` });
  } catch (error: any) {
    logger.error('Failed to handle upgrade request', { action: 'HANDLE_UPGRADE_FAILED', error: error.message });
    next(error);
  }
};

const uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "Dosya yok" });
      return;
    }
    const userId = req.user?.id as string | number;
    const savedImage = await userService.uploadProfileImage(userId, req.file);
    res.json({ success: true, message: "Resim yüklendi!", data: savedImage });
  } catch (error) {
    next(error);
  }
};

const togglePrivacy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.id as string);
    const { isPrivate } = req.body;
    if (req.user?.id !== userId && req.user?.role !== 'SUPERADMIN') {
      res.status(403).json({ success: false, message: "Başkasının gizlilik ayarını değiştiremezsiniz!" });
      return;
    }
    const updatedUser = await userService.updateUser(userId, { isPrivate });
    
    if (req.user?.id !== userId && req.user?.role === 'SUPERADMIN') {
        logger.info('Admin toggled user privacy', { action: 'ADMIN_TOGGLE_PRIVACY', adminId: req.user?.id, targetUserId: userId, isPrivate });
    }
    
    res.json({ success: true, message: `Hesap artık ${isPrivate ? 'Gizli' : 'Herkese Açık'}.`, data: updatedUser });
  } catch (error: any) {
    logger.error('Failed to toggle privacy', { action: 'TOGGLE_PRIVACY_FAILED', error: error.message });
    next(error);
  }
};

const blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blockerId = req.user?.id as string | number;
    const blockedId = req.params.id;
    await userService.blockUser(blockerId, blockedId);
    
    if (req.user?.role === 'SUPERADMIN' || req.user?.role === 'ADMIN') {
       logger.info('Admin blocked user', { action: 'ADMIN_BLOCK_USER', adminId: blockerId, targetUserId: blockedId });
    }

    res.json({ success: true, message: "Kullanıcı engellendi." });
  } catch (error: any) {
    logger.error('Failed to block user', { action: 'BLOCK_USER_FAILED', error: error.message });
    next(error);
  }
};

const unblockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blockerId = req.user?.id as string | number;
    const blockedId = req.params.id;
    await userService.unblockUser(blockerId, blockedId);
    
    if (req.user?.role === 'SUPERADMIN' || req.user?.role === 'ADMIN') {
       logger.info('Admin unblocked user', { action: 'ADMIN_UNBLOCK_USER', adminId: blockerId, targetUserId: blockedId });
    }

    res.json({ success: true, message: "Kullanıcının engeli kaldırıldı." });
  } catch (error: any) {
    logger.error('Failed to unblock user', { action: 'UNBLOCK_USER_FAILED', error: error.message });
    next(error);
  }
};

export default {
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
