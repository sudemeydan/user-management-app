// @ts-nocheck
import userRepository from '../repositories/userRepository';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import emailService from './emailService';
import driveClient from '../utils/driveClient';
import fs from 'fs';
import path from 'path';
import os from 'os';
import prisma from '../utils/prisma';
import AppError from '../utils/AppError';
import { generateATSPDF, generateTailoredPDF } from './pdfService';
import { uploadBufferToDrive } from '../utils/driveClient';
import { extractJobDetails, generateTailoringProposals } from './geminiService';

const getAllUsers = async (currentUserId: any) => {
  const users = await userRepository.findAllUsers(currentUserId);

  if (!currentUserId) return users;

  return users.map(user => ({
    ...user,
    isBlockedByMe: user.blockedUsers && user.blockedUsers.length > 0
  }));
};

const registerUser = async (userData: any) => {
  // 1. Gelen veriyi parÃ§alÄ±yoruz 
  const { email, password, confirmPassword, address, ...otherData } = userData;

  // 2. Gerekli AlanlarÄ±n Doluluk KontrolÃ¼
  if (!email || !password || !confirmPassword || !address) {
    throw new Error("LÃ¼tfen e-posta, ÅŸifre, ÅŸifre tekrarÄ± ve ÅŸehir (adres) alanlarÄ±nÄ± doldurun.");
  }

  // 3. Åifre EÅŸleÅŸme KontrolÃ¼
  if (password !== confirmPassword) {
    throw new AppError("GirdiÄŸiniz ÅŸifreler eÅŸleÅŸmiyor.", 400);
  }

  // 4. GÃ¼Ã§lÃ¼ Åifre KontrolÃ¼ (En az 8 karakter, 1 bÃ¼yÃ¼k, 1 kÃ¼Ã§Ã¼k, 1 rakam)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new AppError("Åifre en az 8 karakter olmalÄ±; en az bir bÃ¼yÃ¼k harf, bir kÃ¼Ã§Ã¼k harf ve bir rakam iÃ§ermelidir.", 400);
  }

  // 5. Åehir (Adres) KontrolÃ¼
  const validCities = ["Ä°stanbul", "Ankara", "Ä°zmir", "Bursa", "Antalya"];
  if (!validCities.includes(address)) {
    throw new AppError("LÃ¼tfen geÃ§erli bir ÅŸehir seÃ§iniz.", 400);
  }

  // 6. KullanÄ±cÄ± Zaten Var mÄ± KontrolÃ¼ 
  const existingUser = await userRepository.findUserByEmail(email);
  if (existingUser) {
    throw new AppError("Bu e-posta adresi zaten kullanÄ±mda.", 400);
  }

  // 7. Åifreyi Hashleme ve Token OluÅŸturma 
  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // 8. VeritabanÄ±na KayÄ±t (Repository Ã¼zerinden)
  const newUser = await userRepository.createUser({
    ...otherData,
    email,
    address,
    password: hashedPassword,
    emailVerificationToken: verificationToken,
    isEmailVerified: false
  });

  // 9. Onay Maili GÃ¶nderme (Senin mevcut kodun)
  try {
    await emailService.sendVerificationEmail(newUser.email, verificationToken);
    console.log(`Onay maili gÃ¶nderildi: ${newUser.email}`);
  } catch (error) {
    console.error("Mail gÃ¶nderme hatasÄ±:", error);
  }

  return newUser;
};

const verifyEmail = async (token: any) => {
  const user = await prisma.user.findUnique({
    where: { emailVerificationToken: token }
  });

  if (!user) {
    throw new AppError("GeÃ§ersiz veya sÃ¼resi dolmuÅŸ onay kodu.", 400);
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

const loginUser = async (email: any, password: any) => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new AppError("E-posta adresi veya ÅŸifre hatalÄ±.", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("LÃ¼tfen giriÅŸ yapmadan Ã¶nce e-posta adresinize gÃ¶nderilen linkten hesabÄ±nÄ±zÄ± onaylayÄ±n.", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError("E-posta adresi veya ÅŸifre hatalÄ±.", 401);
  }

  return user;
};

const forgotPassword = async (email: any) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new AppError("Bu e-posta adresiyle kayÄ±tlÄ± bir kullanÄ±cÄ± bulunamadÄ±.", 400);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 saat geÃ§erli

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

const resetPassword = async (token: any, newPassword: any) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() }
    }
  });

  if (!user) {
    throw new AppError("GeÃ§ersiz veya sÃ¼resi dolmuÅŸ ÅŸifre sÄ±fÄ±rlama baÄŸlantÄ±sÄ±.", 400);
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

const updateUser = async (id: any, userData: any) => {
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, 10);
  }
  return await userRepository.updateUser(id, userData);
};

const deleteUser = async (id: any) => {
  return await userRepository.deleteUser(id);
};

const requestUpgrade = async (userId: any) => {
  console.log("1. Service KatmanÄ±: Ä°stek baÅŸladÄ±. KullanÄ±cÄ± ID:", userId);

  if (!userRepository.createUpgradeRequest) {
    console.error("!!! HATA: userRepository.createUpgradeRequest fonksiyonu BULUNAMADI!");
    throw new AppError("Sunucu hatasÄ±: Repository fonksiyonu eksik.", 400);
  }

  const lastRequest = await userRepository.findLatestUpgradeRequest(userId);
  console.log("2. Son istek durumu:", lastRequest);

  if (lastRequest && lastRequest.status === 'PENDING') {
    console.log("3. Zaten bekleyen istek var, iptal ediliyor.");
    throw new AppError("Zaten incelenmeyi bekleyen bir talebiniz var.", 400);
  }

  console.log("4. Yeni kayÄ±t oluÅŸturuluyor...");
  const newRequest = await userRepository.createUpgradeRequest(userId);

  console.log("5. SONUÃ‡: Yeni kayÄ±t oluÅŸturuldu:", newRequest);
  return newRequest;
};

const handleUpgrade = async (userId: any, action: any) => {
  const lastRequest = await userRepository.findLatestUpgradeRequest(userId);

  if (!lastRequest || lastRequest.status !== 'PENDING') {
    throw new AppError("Bekleyen bir talep bulunamadÄ±.", 400);
  }

  if (action === 'APPROVE') {
    await userRepository.updateUpgradeRequestStatus(lastRequest.id, 'APPROVED');
    await userRepository.updateUser(userId, { role: 'PRO_USER' });
  } else {
    await userRepository.updateUpgradeRequestStatus(lastRequest.id, 'REJECTED');
  }
};

const uploadProfileImage = async (userId: any, fileObj: any) => {
  const { fileId, publicUrl } = await driveClient.uploadToDrive(fileObj);

  fs.unlink(fileObj.path, (err) => {
    if (err) console.error("GeÃ§ici dosya silinemedi:", err);
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

const uploadCV = async (userId: any, file: any) => {
  const cvFolderId = process.env.GOOGLE_DRIVE_CV_FOLDER_ID;

  const driveResponse = await driveClient.uploadToDrive(file, cvFolderId);

  // Set others to inactive if this is the first CV? No, user explicitly activates.

  const newCV = await prisma.cV.create({
    data: {
      fileName: file.originalname, // KullanÄ±cÄ±nÄ±n gÃ¶receÄŸi orijinal dosya adÄ±
      fileId: driveResponse.fileId, // Drive ID'si
      fileSize: file.size, // Multer bize boyutu BYTE cinsinden verir
      mimeType: file.mimetype,
      isActive: false, // Varsayilan false
      userId: userId
    }
  });

  return newCV;
};

const getUserCVs = async (targetUserId: any, requesterId: any, requesterRole: any) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: parseInt(targetUserId) },
    include: {
      sentConnections: { where: { receiverId: parseInt(requesterId), status: 'ACCEPTED' } },
      receivedConnections: { where: { senderId: parseInt(requesterId), status: 'ACCEPTED' } }
    }
  });

  if (!targetUser) throw new AppError("KullanÄ±cÄ± bulunamadÄ±.", 400);

  const isOwner = parseInt(targetUserId) === parseInt(requesterId);
  const isAdmin = requesterRole === 'SUPERADMIN';
  const isConnected = targetUser.sentConnections.length > 0 || targetUser.receivedConnections.length > 0;

  if (!isOwner && !isAdmin && targetUser.isPrivate && !isConnected) {
    throw new AppError("Gizli profil olduÄŸu iÃ§in CV'leri gÃ¶remezsiniz.", 403);
  }

  const cvs = await prisma.cV.findMany({
    where: {
      userId: parseInt(targetUserId),
      ...(isOwner || isAdmin ? {} : { isActive: true })
    },
    include: {
      entries: true,
      tailoredCVs: {
        include: {
          entries: true,
          jobPosting: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return cvs;
};

const activateCV = async (userId: any, cvId: any) => {
  const cv = await prisma.cV.findFirst({
    where: { id: parseInt(cvId), userId: parseInt(userId) }
  });

  if (!cv) throw new AppError("CV bulunamadÄ± veya yetkiniz yok.", 400);

  // Ã–nce hepsi pasif, sonra seÃ§ilen aktif (Transaction ile)
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

const deleteCV = async (userId: any, cvId: any) => {
  const cv = await prisma.cV.findFirst({
    where: { id: parseInt(cvId), userId: parseInt(userId) }
  });

  if (!cv) throw new AppError("CV bulunamadÄ± veya yetkiniz yok.", 400);

  // Drive'dan sil
  try {
    await driveClient.deleteFromDrive(cv.fileId);
  } catch (error) {
    console.error("Drive silme hatasÄ± (Yine de veritabanÄ±ndan kaldÄ±rÄ±lacak):", error);
  }

  // VeritabanÄ±ndan sil
  await prisma.cV.delete({
    where: { id: parseInt(cvId) }
  });

  return true;
};

const getAllActiveCVs = async (requesterId: any, requesterRole: any) => {
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

const blockUser = async (blockerId: any, blockedId: any) => {
  if (parseInt(blockerId) === parseInt(blockedId)) {
    throw new AppError("Kendinizi engelleyemezsiniz.", 400);
  }
  return await userRepository.blockUser(blockerId, blockedId);
};

const unblockUser = async (blockerId: any, blockedId: any) => {
  return await userRepository.unblockUser(blockerId, blockedId);
};

const optimizeCVFormat = async (userId: any, cvId: any) => {
  const cv = await prisma.cV.findUnique({
    where: { id: parseInt(cvId) },
    include: { entries: true, user: true }
  });

  if (!cv || cv.userId !== parseInt(userId)) {
    throw new AppError("CV bulunamadÄ± veya yetkiniz yok.", 404);
  }

  // Optimize edilmiÅŸ PDF Ã¼ret
  const pdfBuffer = await generateATSPDF({
    summary: cv.summary,
    userName: cv.user.name,
    userEmail: cv.user.email
  }, cv.entries);

  // DosyayÄ± geÃ§ici olarak diske kaydet (DiÄŸer yÃ¼klemelerin mantÄ±ÄŸÄ±)
  const tempPath = path.join(os.tmpdir(), `ATS-${cv.id}-${Date.now()}.pdf`);
  fs.writeFileSync(tempPath, pdfBuffer);

  // Drive'a yÃ¼kle
  const driveResponse = await driveClient.uploadToDrive({
    path: tempPath,
    originalname: `ATS-${cv.fileName}`,
    mimetype: 'application/pdf'
  }, process.env.GOOGLE_DRIVE_CV_FOLDER_ID);

  // GeÃ§ici dosyayÄ± sil
  fs.unlinkSync(tempPath);

  // VeritabanÄ±nda kaydet
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

const getUserATSStatus = async (cvId: any) => {
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

const getCVDataForRender = async (cvId: any) => {
  const cv = await prisma.cV.findUnique({
    where: { id: parseInt(cvId) },
    include: {
      entries: true,
      user: true
    }
  });

  if (!cv) throw new AppError("CV bulunamadÄ±", 400);

  // Format data to match what the frontend expects
  return {
    personalInfo: {
      firstName: cv.user.name.split(' ')[0],
      lastName: cv.user.name.split(' ').slice(1).join(' '),
      email: cv.user.email,
      phone: '', // Add fields from user profile if available
      linkedin: '',
      github: '',
      portfolio: ''
    },
    summary: cv.summary,
    entries: cv.entries
  };
};

// ---- Ä°Å Ä°LANI VE TAILORING FONKSÄ°YONLARI ----

const createJobPosting = async (jobText: any, url = null) => {
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

const getTailoringProposals = async (cvId: any, jobPostingId: any) => {
  const cv = await prisma.cV.findUnique({
    where: { id: parseInt(cvId) },
    include: { entries: true }
  });
  const job = await prisma.jobPosting.findUnique({
    where: { id: parseInt(jobPostingId) }
  });

  if (!cv || !job) throw new AppError("CV veya Ä°ÅŸ Ä°lanÄ± bulunamadÄ±.", 404);

  const proposals = await generateTailoringProposals(cv, job);
  return proposals;
};

const createTailoredCV = async (userId: any, originalCvId: any, jobPostingId: any, tailoredData: any) => {
  const { improvedSummary, approvedProposals, atsScore } = tailoredData;

  const tailoredCV = await prisma.tailoredCV.create({
    data: {
      userId: parseInt(userId),
      originalCvId: parseInt(originalCvId),
      jobPostingId: parseInt(jobPostingId),
      improvedSummary: improvedSummary,
      atsScore: atsScore || null
    }
  });

  if (approvedProposals && approvedProposals.length > 0) {
    const entriesToCreate = approvedProposals.map(p => ({
      tailoredCvId: tailoredCV.id,
      category: p.category,
      name: p.suggestedTitle || 'BelirtilmemiÅŸ',
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

const optimizeTailoredCV = async (userId: any, tailoredCvId: any) => {
  const tailoredCV = await prisma.tailoredCV.findUnique({
    where: { id: parseInt(tailoredCvId) },
    include: {
      entries: true,
      jobPosting: true,
      originalCv: {
        include: {
          entries: true,
          user: true
        }
      }
    }
  });

  if (!tailoredCV || tailoredCV.userId !== parseInt(userId)) {
    throw new AppError("UyarlanmÄ±ÅŸ CV bulunamadÄ± veya yetkiniz yok.", 404);
  }

  // PDF iÃ§in cvData objesini hazÄ±rla (ats_cv.html beklentilerine gÃ¶re)
  const cvData = {
    userName: tailoredCV.originalCv.user.name,
    userEmail: tailoredCV.originalCv.user.email,
    summary: tailoredCV.originalCv.summary,
    entries: tailoredCV.originalCv.entries
  };

  // PDF Ãœret (Modern ÅŸablonu zorla)
  const pdfBuffer = await generateTailoredPDF(cvData, tailoredCV, 'modern');

  // DosyayÄ± geÃ§ici olarak diske kaydet
  const tempPath = path.join(os.tmpdir(), `Tailored-${tailoredCvId}-${Date.now()}.pdf`);
  fs.writeFileSync(tempPath, pdfBuffer);

  // Drive'a yÃ¼kle
  const driveResponse = await driveClient.uploadToDrive({
    path: tempPath,
    originalname: `Tailored-${tailoredCV.jobPosting.title}-${tailoredCV.originalCv.fileName}`,
    mimetype: 'application/pdf'
  }, process.env.GOOGLE_DRIVE_CV_FOLDER_ID);

  // GeÃ§ici dosyayÄ± sil
  fs.unlinkSync(tempPath);

  // DB GÃ¼ncelle
  const updated = await prisma.tailoredCV.update({
    where: { id: parseInt(tailoredCvId) },
    data: { fileId: driveResponse.fileId }
  });

  return {
    ...updated,
    publicUrl: driveResponse.publicUrl
  };
};

export default {
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
  getCVDataForRender,
  createJobPosting,
  getTailoringProposals,
  createTailoredCV,
  optimizeTailoredCV
};
