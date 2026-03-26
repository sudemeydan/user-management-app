const userService = require('../services/userService');

const getUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const users = await userService.getAllUsers(currentUserId);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(id, req.body);
    res.json({ success: true, message: "Güncellendi", data: updatedUser });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.json({ success: true, message: "Silindi" });
  } catch (error) {
    next(error);
  }
};

const requestUpgrade = async (req, res, next) => {
  try {
    await userService.requestUpgrade(req.user.id);
    res.json({ success: true, message: "Talebini aldık! Yönetici onayladığında PRO olacaksın." });
  } catch (error) {
    next(error);
  }
};

const handleUpgradeRequest = async (req, res, next) => {
  try {
    const { userId, action } = req.body;
    await userService.handleUpgrade(userId, action);
    res.json({ success: true, message: `İşlem Başarılı: ${action}` });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Dosya yok" });
    }
    const savedImage = await userService.uploadProfileImage(req.user.id, req.file);
    res.json({ success: true, message: "Resim yüklendi!", data: savedImage });
  } catch (error) {
    next(error);
  }
};

const togglePrivacy = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { isPrivate } = req.body;
    if (req.user.id !== userId && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ success: false, message: "Başkasının gizlilik ayarını değiştiremezsiniz!" });
    }
    const updatedUser = await userService.updateUser(userId, { isPrivate });
    res.json({ success: true, message: `Hesap artık ${isPrivate ? 'Gizli' : 'Herkese Açık'}.`, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;
    await userService.blockUser(blockerId, blockedId);
    res.json({ success: true, message: "Kullanıcı engellendi." });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;
    await userService.unblockUser(blockerId, blockedId);
    res.json({ success: true, message: "Kullanıcının engeli kaldırıldı." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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