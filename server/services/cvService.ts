import cvRepository from '../repositories/cvRepository';
import userRepository from '../repositories/userRepository';
import driveClient from '../utils/driveClient';
import AppError from '../utils/AppError';
import { generateATSPDF } from './pdfService';

const uploadCV = async (userId: number | string, file: Express.Multer.File) => {
  const cvFolderId = process.env.GOOGLE_DRIVE_CV_FOLDER_ID;

  const driveResponse = await driveClient.uploadToDrive(file, cvFolderId as string);

  const newCV = await cvRepository.createCV({
    fileName: file.originalname,
    fileId: driveResponse.fileId,
    fileSize: file.size,
    mimeType: file.mimetype,
    isActive: false,
    user: {
      connect: { id: Number(userId) }
    }
  });

  return newCV;
};

const getUserCVs = async (targetUserId: number | string, requesterId: number | string, requesterRole?: string) => {
  const isOwner = Number(targetUserId) === Number(requesterId);
  const isAdmin = requesterRole === 'SUPERADMIN';

  const targetUser: any = await userRepository.findUserWithConnections(targetUserId, requesterId);

  if (!targetUser) throw new Error("KullanÄ±cÄ± bulunamadÄ±.");

  const isConnected = targetUser.sentConnections.length > 0 || targetUser.receivedConnections.length > 0;

  if (!isOwner && !isAdmin && targetUser.isPrivate && !isConnected) {
    throw new AppError("Gizli profil olduÄŸu iÃ§in CV'leri gÃ¶remezsiniz.", 403);
  }

  const cvs = await cvRepository.findUserCVs(targetUserId, !(isOwner || isAdmin));
  return cvs;
};

const activateCV = async (userId: number | string, cvId: number | string) => {
  const cv = await cvRepository.findCVByIdWithTailored(cvId, userId);

  if (!cv) throw new Error("CV bulunamadÄ± veya yetkiniz yok.");

  await cvRepository.activateCV(userId, cvId);
  return true;
};

const deleteCV = async (userId: number | string, cvId: number | string) => {
  const cv: any = await cvRepository.findCVByIdWithTailored(cvId, userId);

  if (!cv) throw new Error("CV bulunamadÄ± veya yetkiniz yok.");

  try {
    await driveClient.deleteFromDrive(cv.fileId);
  } catch (error) {
    console.error("Drive silme hatasÄ± (Yine de veritabanÄ±ndan kaldÄ±rÄ±lacak):", error);
  }

  await cvRepository.deleteCV(cvId);
  return true;
};

const getAllActiveCVs = async (requesterId: number | string, requesterRole?: string) => {
  const isAdmin = requesterRole === 'SUPERADMIN';
  const activeCVs = await cvRepository.findAllActiveCVs(requesterId);

  const accessibleCVs = activeCVs.filter((cv: any) => {
    const isOwner = cv.userId === Number(requesterId);
    if (isOwner || isAdmin) return true;
    if (!cv.user.isPrivate) return true;

    const isConnected = cv.user.sentConnections.length > 0 || cv.user.receivedConnections.length > 0;
    return isConnected;
  });

  return accessibleCVs.map((cv: any) => ({
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

const getCVDataForRender = async (cvId: number | string) => {
  const cv: any = await cvRepository.findCVById(cvId, true);

  if (!cv) throw new Error("CV bulunamadÄ±");

  return {
    personalInfo: {
      firstName: cv.user.name.split(' ')[0],
      lastName: cv.user.name.split(' ').slice(1).join(' '),
      email: cv.user.email,
      phone: '',
      linkedin: '',
      github: '',
      portfolio: ''
    },
    summary: cv.summary,
    entries: cv.entries
  };
};

const generatePdfBufferForDownload = async (cvId: number | string, template?: string) => {
  const cv: any = await cvRepository.findCVById(cvId, true);

  if (!cv) {
    throw new AppError("CV bulunamadÄ±.", 404);
  }

  const cvDataDetails = {
    summary: cv.summary,
    userName: cv.user.name,
    userEmail: cv.user.email
  };

  const pdfBuffer = await generateATSPDF(cvDataDetails, cv.entries, template);
  return pdfBuffer;
};

export default {
  uploadCV,
  getUserCVs,
  activateCV,
  deleteCV,
  getAllActiveCVs,
  getCVDataForRender,
  generatePdfBufferForDownload
};
