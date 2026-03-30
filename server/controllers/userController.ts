import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';

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
    res.json({ success: true, message: "Güncellendi", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.json({ success: true, message: "Silindi" });
  } catch (error) {
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
    res.json({ success: true, message: `İşlem Başarılı: ${action}` });
  } catch (error) {
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
    const userId = parseInt(req.params.id);
    const { isPrivate } = req.body;
    if (req.user?.id !== userId && req.user?.role !== 'SUPERADMIN') {
      res.status(403).json({ success: false, message: "Başkasının gizlilik ayarını değiştiremezsiniz!" });
      return;
    }
    const updatedUser = await userService.updateUser(userId, { isPrivate });
    res.json({ success: true, message: `Hesap artık ${isPrivate ? 'Gizli' : 'Herkese Açık'}.`, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blockerId = req.user?.id as string | number;
    const blockedId = req.params.id;
    await userService.blockUser(blockerId, blockedId);
    res.json({ success: true, message: "Kullanıcı engellendi." });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const blockerId = req.user?.id as string | number;
    const blockedId = req.params.id;
    await userService.unblockUser(blockerId, blockedId);
    res.json({ success: true, message: "Kullanıcının engeli kaldırıldı." });
  } catch (error) {
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
