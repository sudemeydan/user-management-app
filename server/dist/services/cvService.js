"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cvRepository_1 = __importDefault(require("../repositories/cvRepository"));
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const driveClient_1 = __importDefault(require("../utils/driveClient"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const pdfService_1 = require("./pdfService");
const uploadCV = async (userId, file) => {
    const cvFolderId = process.env.GOOGLE_DRIVE_CV_FOLDER_ID;
    const driveResponse = await driveClient_1.default.uploadToDrive(file, cvFolderId);
    const newCV = await cvRepository_1.default.createCV({
        fileName: file.originalname,
        fileId: driveResponse.fileId,
        fileSize: file.size,
        mimeType: file.mimetype,
        isActive: false,
        userId: Number(userId)
    });
    return newCV;
};
const getUserCVs = async (targetUserId, requesterId, requesterRole) => {
    const isOwner = Number(targetUserId) === Number(requesterId);
    const isAdmin = requesterRole === 'SUPERADMIN';
    const targetUser = await userRepository_1.default.findUserWithConnections(targetUserId, requesterId);
    if (!targetUser)
        throw new Error("Kullanıcı bulunamadı.");
    const isConnected = targetUser.sentConnections.length > 0 || targetUser.receivedConnections.length > 0;
    if (!isOwner && !isAdmin && targetUser.isPrivate && !isConnected) {
        throw new AppError_1.default("Gizli profil olduğu için CV'leri göremezsiniz.", 403);
    }
    const cvs = await cvRepository_1.default.findUserCVs(targetUserId, !(isOwner || isAdmin));
    return cvs;
};
const activateCV = async (userId, cvId) => {
    const cv = await cvRepository_1.default.findCVByIdWithTailored(cvId, userId);
    if (!cv)
        throw new Error("CV bulunamadı veya yetkiniz yok.");
    await cvRepository_1.default.activateCV(userId, cvId);
    return true;
};
const deleteCV = async (userId, cvId) => {
    const cv = await cvRepository_1.default.findCVByIdWithTailored(cvId, userId);
    if (!cv)
        throw new Error("CV bulunamadı veya yetkiniz yok.");
    try {
        await driveClient_1.default.deleteFromDrive(cv.fileId);
    }
    catch (error) {
        console.error("Drive silme hatası (Yine de veritabanından kaldırılacak):", error);
    }
    await cvRepository_1.default.deleteCV(cvId);
    return true;
};
const getAllActiveCVs = async (requesterId, requesterRole) => {
    const isAdmin = requesterRole === 'SUPERADMIN';
    const activeCVs = await cvRepository_1.default.findAllActiveCVs(requesterId);
    const accessibleCVs = activeCVs.filter((cv) => {
        const isOwner = cv.userId === Number(requesterId);
        if (isOwner || isAdmin)
            return true;
        if (!cv.user.isPrivate)
            return true;
        const isConnected = cv.user.sentConnections.length > 0 || cv.user.receivedConnections.length > 0;
        return isConnected;
    });
    return accessibleCVs.map((cv) => ({
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
const getCVDataForRender = async (cvId) => {
    const cv = await cvRepository_1.default.findCVById(cvId, true);
    if (!cv)
        throw new Error("CV bulunamadı");
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
const generatePdfBufferForDownload = async (cvId, template) => {
    const cv = await cvRepository_1.default.findCVById(cvId, true);
    if (!cv) {
        throw new AppError_1.default("CV bulunamadı.", 404);
    }
    const cvDataDetails = {
        summary: cv.summary,
        userName: cv.user.name,
        userEmail: cv.user.email
    };
    const pdfBuffer = await (0, pdfService_1.generateATSPDF)(cvDataDetails, cv.entries, template);
    return pdfBuffer;
};
exports.default = {
    uploadCV,
    getUserCVs,
    activateCV,
    deleteCV,
    getAllActiveCVs,
    getCVDataForRender,
    generatePdfBufferForDownload
};
