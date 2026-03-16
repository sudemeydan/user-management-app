const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailService = require('./emailService');
const driveClient = require('../utils/driveClient');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError');
const prisma = new PrismaClient();
const { generateATSPDF } = require('./pdfService');
const { uploadBufferToDrive } = require('../utils/driveClient');
const { extractJobDetails, generateTailoringProposals } = require('./geminiService');

const getAllUsers = async (currentUserId) => {
  const users = await userRepository.findAllUsers();

  if (!currentUserId) return users;

  const filteredUsers = [];
  for (const user of users) {
    const hasBlockedMe = user.blockingUsers?.some(block => block.blockedId === parseInt(currentUserId));
    if (hasBlockedMe) continue;

    const iHaveBlocked = user.blockedUsers?.some(block => block.blockerId === parseInt(currentUserId));

    filteredUsers.push({
      ...user,
      isBlockedByMe: iHaveBlocked
    });
  }

  return filteredUsers;
};

const registerUser = async (userData) => {
  // 1. Gelen veriyi parçalıyoruz (confirmPassword db'ye gitmeyecek)
  const { email, password, confirmPassword, address, ...otherData } = userData;

  // 2. Gerekli Alanların Doluluk Kontrolü
  if (!email || !password || !confirmPassword || !address) {
    throw new Error("Lütfen e-posta, şifre, şifre tekrarı ve şehir (adres) alanlarını doldurun.");
  }

  // 3. Şifre Eşleşme Kontrolü
  if (password !== confirmPassword) {
    throw new Error("Girdiğiniz şifreler eşleşmiyor.");
  }

  // 4. Güçlü Şifre Kontrolü (En az 8 karakter, 1 büyük, 1 küçük, 1 rakam)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error("Şifre en az 8 karakter olmalı; en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.");
  }

  // 5. Şehir (Adres) Kontrolü
  const validCities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];
  if (!validCities.includes(address)) {
    throw new Error("Lütfen geçerli bir şehir seçiniz.");
  }

  // 6. Kullanıcı Zaten Var mı Kontrolü (Senin mevcut kodun)
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new Error("Bu e-posta adresi zaten kullanımda.");
  }

  // 7. Şifreyi Hashleme ve Token Oluşturma (Senin mevcut kodun)
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // 8. Veritabanına Kayıt (Repository üzerinden)
  const newUser = await userRepository.createUser({
    ...otherData, // İsim, soyisim gibi ekstra alanlar varsa kaybolmasın
    email,
    address,      // db'deki address alanına seçilen şehri yazıyoruz
    password: hashedPassword,
    emailVerificationToken: verificationToken,
    isEmailVerified: false
  });

  // 9. Onay Maili Gönderme (Senin mevcut kodun)
  try {
    await emailService.sendVerificationEmail(newUser.email, verificationToken);
    console.log(`Onay maili gönderildi: ${newUser.email}`);
  } catch (error) {
    console.error("Mail gönderme hatası:", error);
  }

  return newUser;
};

const verifyEmail = async (token) => {
  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token }
  });

  if (!user) {
    throw new Error("Geçersiz veya süresi dolmuş onay kodu.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null
    }
  });

  return true;
};

const loginUser = async (email, password) => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("E-posta adresi veya şifre hatalı.", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Lütfen giriş yapmadan önce e-posta adresinize gönderilen linkten hesabınızı onaylayın.", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("E-posta adresi veya şifre hatalı.", 401);
  }

  return user;
};

const forgotPassword = async (email) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.");
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 saat geçerli

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetPasswordExpires
    }
  });

  await emailService.sendPasswordResetEmail(user.email, resetToken);
  return true;
};

const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() }
    }
  });

  if (!user) {
    throw new Error("Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  return true;
};

const updateUser = async (id, userData) => {
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  return await userRepository.updateUser(id, userData);
};

const deleteUser = async (id) => {
  return await userRepository.deleteUser(id);
};

const requestUpgrade = async (userId) => {
  console.log("1. Service Katmanı: İstek başladı. Kullanıcı ID:", userId);

  if (!userRepository.createUpgradeRequest) {
    console.error("!!! HATA: userRepository.createUpgradeRequest fonksiyonu BULUNAMADI!");
    throw new Error("Sunucu hatası: Repository fonksiyonu eksik.");
  }

  const lastRequest = await userRepository.findLatestUpgradeRequest(userId);
  console.log("2. Son istek durumu:", lastRequest);

  if (lastRequest && lastRequest.status === 'PENDING') {
    console.log("3. Zaten bekleyen istek var, iptal ediliyor.");
    throw new Error("Zaten incelenmeyi bekleyen bir talebiniz var.");
  }

  console.log("4. Yeni kayıt oluşturuluyor...");
  const newRequest = await userRepository.createUpgradeRequest(userId);

  console.log("5. SONUÇ: Yeni kayıt oluşturuldu:", newRequest);
  return newRequest;
};

const handleUpgrade = async (userId, action) => {
  const lastRequest = await userRepository.findLatestUpgradeRequest(userId);

  if (!lastRequest || lastRequest.status !== 'PENDING') {
    throw new Error("Bekleyen bir talep bulunamadı.");
  }

  if (action === 'APPROVE') {
    await userRepository.updateUpgradeRequestStatus(lastRequest.id, 'APPROVED');
    await userRepository.updateUser(userId, { role: 'PRO_USER' });
  } else {
    await userRepository.updateUpgradeRequestStatus(lastRequest.id, 'REJECTED');
  }
};

const uploadProfileImage = async (userId, fileObj) => {
  const { fileId, publicUrl } = await driveClient.uploadToDrive(fileObj);

  fs.unlink(fileObj.path, (err) => {
    if (err) console.error("Geçici dosya silinemedi:", err);
  });

  const existingImage = await prisma.profileImage.findUnique({
    where: { userId: parseInt(userId) }
  });

  if (existingImage) {
    await driveClient.deleteFromDrive(existingImage.fileId);
  }

  const savedImage = await prisma.profileImage.upsert({
    where: { userId: parseInt(userId) },
    update: {
      url: publicUrl,
      fileId: fileId
    },
    create: {
      userId: parseInt(userId),
      url: publicUrl,
      fileId: fileId
    }
  });

  return savedImage;
};

const uploadCV = async (userId, file) => {
  const cvFolderId = process.env.GOOGLE_DRIVE_CV_FOLDER_ID;

  const driveResponse = await driveClient.uploadToDrive(file, cvFolderId);

  // Set others to inactive if this is the first CV? No, user explicitly activates.

  const newCV = await prisma.cV.create({
    data: {
      fileName: file.originalname, // Kullanıcının göreceği orijinal dosya adı
      fileId: driveResponse.fileId, // Drive ID'si
      fileSize: file.size, // Multer bize boyutu BYTE cinsinden verir
      mimeType: file.mimetype,
      isActive: false, // Varsayilan false
      userId: userId
    }
  });

  return newCV;
};

const getUserCVs = async (targetUserId, requesterId, requesterRole) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: parseInt(targetUserId) },
    include: {
      sentConnections: { where: { receiverId: parseInt(requesterId), status: 'ACCEPTED' } },
      receivedConnections: { where: { senderId: parseInt(requesterId), status: 'ACCEPTED' } }
    }
  });

  if (!targetUser) throw new Error("Kullanıcı bulunamadı.");

  const isOwner = parseInt(targetUserId) === parseInt(requesterId);
  const isAdmin = requesterRole === 'SUPERADMIN';
  const isConnected = targetUser.sentConnections.length > 0 || targetUser.receivedConnections.length > 0;

  if (!isOwner && !isAdmin && targetUser.isPrivate && !isConnected) {
    throw new AppError("Gizli profil olduğu için CV'leri göremezsiniz.", 403);
  }

  // Sahibi ise tüm CV'leri, değilse sadece aktif olanı listele
  const cvs = await prisma.cV.findMany({
    where: {
      userId: parseInt(targetUserId),
      ...(isOwner || isAdmin ? {} : { isActive: true })
    },
    include: {
      entries: true,
      // YENİ EKLENEN KISIM: Normal CV'ye bağlı uyarlanmış (Tailored) CV'leri de getir
      tailoredCVs: {
        include: {
          entries: true, // Uyarlanmış CV'nin güncellenmiş yetenek/deneyim girdileri
          jobPosting: true // Hangi iş ilanına göre uyarlandığı bilgisi (opsiyonel)
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return cvs;
};

const activateCV = async (userId, cvId) => {
  const cv = await prisma.cV.findFirst({
    where: { id: parseInt(cvId), userId: parseInt(userId) }
  });

  if (!cv) throw new Error("CV bulunamadı veya yetkiniz yok.");

  // Önce hepsi pasif, sonra seçilen aktif (Transaction ile)
  await prisma.$transaction([
    prisma.cV.updateMany({
      where: { userId: parseInt(userId) },
      data: { isActive: false }
    }),
    prisma.cV.update({
      where: { id: parseInt(cvId) },
      data: { isActive: true }
    })
  ]);

  return true;
};

const deleteCV = async (userId, cvId) => {
  const cv = await prisma.cV.findFirst({
    where: { id: parseInt(cvId), userId: parseInt(userId) }
  });

  if (!cv) throw new Error("CV bulunamadı veya yetkiniz yok.");

  // Drive'dan sil
  try {
    await driveClient.deleteFromDrive(cv.fileId);
  } catch (error) {
    console.error("Drive silme hatası (Yine de veritabanından kaldırılacak):", error);
  }

  // Veritabanından sil
  await prisma.cV.delete({
    where: { id: parseInt(cvId) }
  });

  return true;
};

const getAllActiveCVs = async (requesterId, requesterRole) => {
  const isAdmin = requesterRole === 'SUPERADMIN';

  // Get all active CVs including user and their connections
  const activeCVs = await prisma.cV.findMany({
    where: { isActive: true },
    include: {
      user: {
        include: {
          sentConnections: { where: { receiverId: parseInt(requesterId), status: 'ACCEPTED' } },
          receivedConnections: { where: { senderId: parseInt(requesterId), status: 'ACCEPTED' } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Filter based on privacy rules
  const accessibleCVs = activeCVs.filter(cv => {
    const isOwner = cv.userId === parseInt(requesterId);
    if (isOwner || isAdmin) return true;
    if (!cv.user.isPrivate) return true;

    const isConnected = cv.user.sentConnections.length > 0 || cv.user.receivedConnections.length > 0;
    return isConnected;
  });

  // Remove connection details from response to keep it clean, but keep user name/email
  return accessibleCVs.map(cv => ({
    id: cv.id,
    fileName: cv.fileName,
    fileId: cv.fileId,
    fileSize: cv.fileSize,
    mimeType: cv.mimeType,
    isActive: cv.isActive,
    createdAt: cv.createdAt,
    userId: cv.userId,
    userName: cv.user.name,
    userEmail: cv.user.email,
    userRole: cv.user.role
  }));
};

const blockUser = async (blockerId, blockedId) => {
  if (parseInt(blockerId) === parseInt(blockedId)) {
    throw new Error("Kendinizi engelleyemezsiniz.");
  }
  return await userRepository.blockUser(blockerId, blockedId);
};

const unblockUser = async (blockerId, blockedId) => {
  return await userRepository.unblockUser(blockerId, blockedId);
};

const optimizeCVFormat = async (userId, cvId) => {
  const cv = await prisma.cV.findUnique({
    where: { id: parseInt(cvId) },
    include: { entries: true, user: true }
  });

  if (!cv || cv.userId !== parseInt(userId)) {
    throw new AppError("CV bulunamadı veya yetkiniz yok.", 404);
  }

  // Optimize edilmiş PDF üret
  const pdfBuffer = await generateATSPDF({
    summary: cv.summary,
    userName: cv.user.name,
    userEmail: cv.user.email
  }, cv.entries);

  // Drive'a yükle
  const driveResponse = await uploadBufferToDrive(
    pdfBuffer,
    `ATS-${cv.fileName}`,
    'application/pdf',
    process.env.GOOGLE_DRIVE_CV_FOLDER_ID
  );

  // Veritabanında kaydet
  const atsFormattedCV = await prisma.atsFormattedCV.upsert({
    where: { cvId: parseInt(cvId) },
    update: {
      fileId: driveResponse.fileId
    },
    create: {
      cvId: parseInt(cvId),
      fileId: driveResponse.fileId
    }
  });

  return {
    ...atsFormattedCV,
    publicUrl: driveResponse.publicUrl
  };
};

const getUserATSStatus = async (cvId) => {
  const cv = await prisma.cV.findUnique({
    where: { id: parseInt(cvId) },
    select: {
      atsFormatScore: true,
      atsFormatFeedback: true,
      atsFormattedCV: true
    }
  });
  return cv;
};

// ---- İŞ İLANI VE TAILORING FONKSİYONLARI ----

const createJobPosting = async (jobText, url = null) => {
  const extracted = await extractJobDetails(jobText);
  return await prisma.jobPosting.create({
    data: {
      title: extracted.title,
      company: extracted.company,
      description: jobText,
      url: url,
      extractedSkills: extracted.skills
    }
  });
};

const getTailoringProposals = async (cvId, jobPostingId) => {
  const cv = await prisma.cV.findUnique({
    where: { id: parseInt(cvId) },
    include: { entries: true }
  });
  const job = await prisma.jobPosting.findUnique({
    where: { id: parseInt(jobPostingId) }
  });

  if (!cv || !job) throw new AppError("CV veya İş İlanı bulunamadı.", 404);

  const proposals = await generateTailoringProposals(cv, job);
  return proposals;
};

const createTailoredCV = async (userId, originalCvId, jobPostingId, tailoredData) => {
  const { improvedSummary, approvedProposals } = tailoredData;

  const tailoredCV = await prisma.tailoredCV.create({
    data: {
      userId: parseInt(userId),
      originalCvId: parseInt(originalCvId),
      jobPostingId: parseInt(jobPostingId),
      improvedSummary: improvedSummary
    }
  });

  if (approvedProposals && approvedProposals.length > 0) {
    const entriesToCreate = approvedProposals.map(p => ({
      tailoredCvId: tailoredCV.id,
      category: p.category,
      name: p.suggestedTitle || 'Belirtilmemiş',
      description: p.suggestedDescription,
      isModified: true,
      aiComment: p.aiComment
    }));

    await prisma.tailoredCVEntry.createMany({
      data: entriesToCreate
    });
  }

  return tailoredCV;
};

module.exports = {
  getAllUsers,
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  updateUser,
  deleteUser,
  requestUpgrade,
  handleUpgrade,
  uploadProfileImage,
  blockUser,
  unblockUser,
  uploadCV,
  getUserCVs,
  activateCV,
  deleteCV,
  getAllActiveCVs,
  optimizeCVFormat,
  getUserATSStatus,
  createJobPosting,
  getTailoringProposals,
  createTailoredCV
};
