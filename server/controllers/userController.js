const jwt = require('jsonwebtoken');
const userService = require('../services/userService');


const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const createUser = async (req, res) => {
  try {
    const newUser = await userService.registerUser(req.body);
    res.status(201).json({ success: true, message: "Kayıt Başarılı!", data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.loginUser(email, password);
    
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET, 
      { expiresIn: '2h' }
    );

    res.json({ 
      success: true, 
      message: "Giriş Başarılı!", 
      user: user, 
      accessToken: accessToken, 
      refreshToken: refreshToken 
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};


const refresh = async (req, res) => {
  const { refreshToken } = req.body; 

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Refresh Token bulunamadı!" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ success: false, message: "Geçersiz Refresh Token, tekrar giriş yapın." });
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(id, req.body);
    res.json({ success: true, message: "Güncellendi", data: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.json({ success: true, message: "Silindi" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const requestUpgrade = async (req, res) => {
  console.log(" CONTROLLER: Yükseltme isteği geldi. User ID:", req.user?.id);
  try {
    
    await userService.requestUpgrade(req.user.id);

    res.json({ 
      success: true, 
      message: "Talebini aldık! Yönetici onayladığında PRO olacaksın." 
    });
  } catch (error) {
    console.error("CONTROLLER HATASI:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleUpgradeRequest = async (req, res) => {
  try {
    const { userId, action } = req.body; 
    
    
    await userService.handleUpgrade(userId, action);

    res.json({ success: true, message: `İşlem Başarılı: ${action}` });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Dosya yok" });
    }
    
    const savedImage = await userService.uploadProfileImage(req.user.id, req.file);
    res.json({ success: true, message: "Resim yüklendi!", data: savedImage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const togglePrivacy = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isPrivate } = req.body; // Frontend'den true veya false gelecek

    // Sadece hesabın sahibi veya Superadmin bu ayarı değiştirebilir (Güvenlik Guard'ı)
    if (req.user.id !== userId && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ success: false, message: "Başkasının gizlilik ayarını değiştiremezsiniz!" });
    }

    // Prisma ile veritabanını güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isPrivate: isPrivate },
    });

    res.json({ 
      success: true, 
      message: `Hesap artık ${isPrivate ? 'Gizli' : 'Herkese Açık'}.`, 
      data: updatedUser 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Gizlilik ayarı güncellenirken hata oluştu: " + error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  login,
  updateUser,
  deleteUser,
  refresh,
  requestUpgrade,      
  handleUpgradeRequest,
  uploadAvatar,
  togglePrivacy
};