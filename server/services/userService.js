const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailService = require('./emailService');
const driveClient = require('../utils/driveClient');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/AppError');
const prisma = new PrismaClient();

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

const blockUser = async (blockerId, blockedId) => {
  if (parseInt(blockerId) === parseInt(blockedId)) {
    throw new Error("Kendinizi engelleyemezsiniz.");
  }
  return await userRepository.blockUser(blockerId, blockedId);
};

const unblockUser = async (blockerId, blockedId) => {
  return await userRepository.unblockUser(blockerId, blockedId);
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
  unblockUser
};