const jwt = require('jsonwebtoken');
const fs = require('fs');
const userService = require('../services/userService');
// YENİ EKLEDİĞİMİZ SATIR: RabbitMQ'ya mesaj göndermek için gerekli fonksiyonu çağırıyoruz.
const { sendToQueue } = require('../services/rabbitmqService');

const getUsers = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const users = await userService.getAllUsers(currentUserId);
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const newUser = await userService.registerUser(req.body);
    res.status(201).json({ success: true, message: "Kayıt Başarılı! Lütfen e-postanızı onaylayın.", data: newUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    await userService.verifyEmail(token);
    res.json({ success: true, message: "E-posta adresiniz başarıyla onaylandı! Artık giriş yapabilirsiniz." });
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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.forgotPassword(email);
    res.json({ success: true, message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    await userService.resetPassword(token, newPassword);
    res.json({ success: true, message: "Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
  try {
    await userService.requestUpgrade(req.user.id);
    res.json({ success: true, message: "Talebini aldık! Yönetici onayladığında PRO olacaksın." });
  } catch (error) {
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
    const { isPrivate } = req.body;
    if (req.user.id !== userId && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ success: false, message: "Başkasının gizlilik ayarını değiştiremezsiniz!" });
    }
    const updatedUser = await userService.updateUser(userId, { isPrivate });
    res.json({ success: true, message: `Hesap artık ${isPrivate ? 'Gizli' : 'Herkese Açık'}.`, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gizlilik ayarı güncellenirken hata oluştu: " + error.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;
    await userService.blockUser(blockerId, blockedId);
    res.json({ success: true, message: "Kullanıcı engellendi." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const unblockUser = async (req, res) => {
  try {
    const blockerId = req.user.id;
    const blockedId = req.params.id;
    await userService.unblockUser(blockerId, blockedId);
    res.json({ success: true, message: "Kullanıcının engeli kaldırıldı." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Lütfen geçerli bir PDF veya DOCX dosyası seçin." });
    }

    let pdfBase64 = null;

    // 1. Eğer yüklenecek dosya PDF ise, Drive'a gidip silinmeden ÖNCE diskten/memory'den oku ve base64'e çevir
    if (req.file.mimetype === 'application/pdf') {
      if (req.file.buffer) {
        pdfBase64 = req.file.buffer.toString('base64');
      } else if (req.file.path) {
        const fileData = fs.readFileSync(req.file.path);
        pdfBase64 = fileData.toString('base64');
      } else {
        throw new Error("Dosya verisi okunamadı (ne buffer ne de path bulundu).");
      }
    }

    // 2. Dosyayı Drive'a yükle ve DB'ye CV'yi kaydet (BU İŞLEM DİSKTEKİ DOSYAYI SİLEBİLİR)
    const savedCV = await userService.uploadCV(req.user.id, req.file);

    // 3. Dosya PDF ise, önceden hazırladığımız base64 verisini Python'a (RabbitMQ'ya) gönder
    if (pdfBase64) {
      const queueMessage = {
        cvId: savedCV.id,
        fileData: pdfBase64
      };

      await sendToQueue('cv_parsing_queue', queueMessage);
      console.log(`[x] CV (ID: ${savedCV.id}) RabbitMQ kuyruğuna gönderildi.`);
    }

    res.json({ success: true, message: "CV başarıyla yüklendi ve işleniyor!", data: savedCV });
  } catch (error) {
    console.error("CV Yükleme Hatası (Controller):", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ------------------------------------------

const getUserCVs = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const cvs = await userService.getUserCVs(targetUserId, requesterId, requesterRole);
    res.json({ success: true, data: cvs });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

const activateCV = async (req, res) => {
  try {
    const cvId = req.params.cvId;
    const userId = req.user.id;
    await userService.activateCV(userId, cvId);
    res.json({ success: true, message: "CV başarıyla aktif edildi." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCV = async (req, res) => {
  try {
    const cvId = req.params.cvId;
    const userId = req.user.id;
    await userService.deleteCV(userId, cvId);
    res.json({ success: true, message: "CV başarıyla silindi." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const downloadCV = async (req, res) => {
  const driveClient = require('../utils/driveClient');
  try {
    const { fileId } = req.params;
    await driveClient.streamFile(fileId, res);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Dosya indirilemedi." });
    }
  }
};

const getAllActiveCVs = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    const cvs = await userService.getAllActiveCVs(requesterId, requesterRole);
    res.json({ success: true, data: cvs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const optimizeCVFormat = async (req, res) => {
  try {
    const { cvId } = req.params;
    const userId = req.user.id;
    const result = await userService.optimizeCVFormat(userId, cvId);
    res.json({ success: true, message: "CV başarıyla ATS formatına dönüştürüldü!", data: result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getATSStatus = async (req, res) => {
  try {
    const { cvId } = req.params;
    const status = await userService.getUserATSStatus(cvId);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- İŞ İLANI VE TAILORING CONTROLLER ----

const createJobPosting = async (req, res) => {
  try {
    const { jobText, url } = req.body;
    if (!jobText) {
      return res.status(400).json({ success: false, message: "İş ilanı metni gereklidir." });
    }
    const jobPosting = await userService.createJobPosting(jobText, url);
    res.json({ success: true, message: "İş ilanı başarıyla kaydedildi ve analiz edildi!", data: jobPosting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTailoringProposals = async (req, res) => {
  try {
    const { cvId, jobPostingId } = req.params;
    const proposals = await userService.getTailoringProposals(cvId, jobPostingId);
    res.json({ success: true, data: proposals });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const createTailoredCV = async (req, res) => {
  try {
    const { originalCvId, jobPostingId, improvedSummary, approvedProposals } = req.body;
    const userId = req.user.id;
    const tailoredCV = await userService.createTailoredCV(userId, originalCvId, jobPostingId, {
      improvedSummary,
      approvedProposals
    });
    res.json({ success: true, message: "Uyarlanmış CV başarıyla oluşturuldu!", data: tailoredCV });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  updateUser,
  deleteUser,
  refresh,
  requestUpgrade,
  handleUpgradeRequest,
  uploadAvatar,
  togglePrivacy,
  blockUser,
  unblockUser,
  uploadCV,
  getUserCVs,
  activateCV,
  deleteCV,
  downloadCV,
  getAllActiveCVs,
  optimizeCVFormat,
  getATSStatus,
  createJobPosting,
  getTailoringProposals,
  createTailoredCV
};