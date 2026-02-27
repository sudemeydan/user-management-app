const userRepository = require('../repositories/userRepository');
const bcrypt = require('bcrypt');
const driveClient = require('../utils/driveClient');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async () => {
  return await userRepository.findAllUsers();
};

const registerUser = async (userData) => {
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("Bu e-posta adresi zaten kullanımda.");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  return await userRepository.createUser({
    ...userData,
    password: hashedPassword
  });
};

const loginUser = async (email, password) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Şifre hatalı.");
  }

  return user;
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

module.exports = {
  getAllUsers,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  requestUpgrade,
  handleUpgrade,
  uploadProfileImage
};