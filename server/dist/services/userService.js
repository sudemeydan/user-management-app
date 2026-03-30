"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const userRepository_1 = __importDefault(require("../repositories/userRepository"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const emailService_1 = __importDefault(require("./emailService"));
const driveClient_1 = __importDefault(require("../utils/driveClient"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const pdfService_1 = require("./pdfService");
const geminiService_1 = require("./geminiService");
const getAllUsers = async (currentUserId) => {
    const users = await userRepository_1.default.findAllUsers(currentUserId);
    if (!currentUserId)
        return users;
    return users.map(user => ({
        ...user,
        isBlockedByMe: user.blockedUsers && user.blockedUsers.length > 0
    }));
};
const registerUser = async (userData) => {
    // 1. Gelen veriyi parçalıyoruz 
    const { email, password, confirmPassword, address, ...otherData } = userData;
    // 2. Gerekli Alanların Doluluk Kontrolü
    if (!email || !password || !confirmPassword || !address) {
        throw new Error("Lütfen e-posta, şifre, şifre tekrarı ve şehir (adres) alanlarını doldurun.");
    }
    // 3. Şifre Eşleşme Kontrolü
    if (password !== confirmPassword) {
        throw new AppError_1.default("Girdiğiniz şifreler eşleşmiyor.", 400);
    }
    // 4. Güçlü Şifre Kontrolü (En az 8 karakter, 1 büyük, 1 küçük, 1 rakam)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new AppError_1.default("Şifre en az 8 karakter olmalı; en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.", 400);
    }
    // 5. Şehir (Adres) Kontrolü
    const validCities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"];
    if (!validCities.includes(address)) {
        throw new AppError_1.default("Lütfen geçerli bir şehir seçiniz.", 400);
    }
    // 6. Kullanıcı Zaten Var mı Kontrolü 
    const existingUser = await userRepository_1.default.findUserByEmail(email);
    if (existingUser) {
        throw new AppError_1.default("Bu e-posta adresi zaten kullanımda.", 400);
    }
    // 7. Şifreyi Hashleme ve Token Oluşturma 
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
    // 8. Veritabanına Kayıt (Repository üzerinden)
    const newUser = await userRepository_1.default.createUser({
        ...otherData,
        email,
        address,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        isEmailVerified: false
    });
    // 9. Onay Maili Gönderme (Senin mevcut kodun)
    try {
        await emailService_1.default.sendVerificationEmail(newUser.email, verificationToken);
        console.log(`Onay maili gönderildi: ${newUser.email}`);
    }
    catch (error) {
        console.error("Mail gönderme hatası:", error);
    }
    return newUser;
};
const verifyEmail = async (token) => {
    const user = await prisma_1.default.user.findUnique({
        where: { emailVerificationToken: token }
    });
    if (!user) {
        throw new AppError_1.default("Geçersiz veya süresi dolmuş onay kodu.", 400);
    }
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            isEmailVerified: true,
            emailVerificationToken: null
        }
    });
    return true;
};
const loginUser = async (email, password) => {
    const user = await userRepository_1.default.findUserByEmail(email);
    if (!user) {
        throw new AppError_1.default("E-posta adresi veya şifre hatalı.", 401);
    }
    if (!user.isEmailVerified) {
        throw new AppError_1.default("Lütfen giriş yapmadan önce e-posta adresinize gönderilen linkten hesabınızı onaylayın.", 403);
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError_1.default("E-posta adresi veya şifre hatalı.", 401);
    }
    return user;
};
const forgotPassword = async (email) => {
    const user = await userRepository_1.default.findUserByEmail(email);
    if (!user) {
        throw new AppError_1.default("Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.", 400);
    }
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 saat geçerli
    await prisma_1.default.user.update({
        where: { id: user.id },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetPasswordExpires
        }
    });
    await emailService_1.default.sendPasswordResetEmail(user.email, resetToken);
    return true;
};
const resetPassword = async (token, newPassword) => {
    const user = await prisma_1.default.user.findFirst({
        where: {
            resetPasswordToken: token,
            resetPasswordExpires: { gt: new Date() }
        }
    });
    if (!user) {
        throw new AppError_1.default("Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.", 400);
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    await prisma_1.default.user.update({
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
        userData.password = await bcrypt_1.default.hash(userData.password, 10);
    }
    return await userRepository_1.default.updateUser(id, userData);
};
const deleteUser = async (id) => {
    return await userRepository_1.default.deleteUser(id);
};
const requestUpgrade = async (userId) => {
    console.log("1. Service Katmanı: İstek başladı. Kullanıcı ID:", userId);
    if (!userRepository_1.default.createUpgradeRequest) {
        console.error("!!! HATA: userRepository.createUpgradeRequest fonksiyonu BULUNAMADI!");
        throw new AppError_1.default("Sunucu hatası: Repository fonksiyonu eksik.", 400);
    }
    const lastRequest = await userRepository_1.default.findLatestUpgradeRequest(userId);
    console.log("2. Son istek durumu:", lastRequest);
    if (lastRequest && lastRequest.status === 'PENDING') {
        console.log("3. Zaten bekleyen istek var, iptal ediliyor.");
        throw new AppError_1.default("Zaten incelenmeyi bekleyen bir talebiniz var.", 400);
    }
    console.log("4. Yeni kayıt oluşturuluyor...");
    const newRequest = await userRepository_1.default.createUpgradeRequest(userId);
    console.log("5. SONUÇ: Yeni kayıt oluşturuldu:", newRequest);
    return newRequest;
};
const handleUpgrade = async (userId, action) => {
    const lastRequest = await userRepository_1.default.findLatestUpgradeRequest(userId);
    if (!lastRequest || lastRequest.status !== 'PENDING') {
        throw new AppError_1.default("Bekleyen bir talep bulunamadı.", 400);
    }
    if (action === 'APPROVE') {
        await userRepository_1.default.updateUpgradeRequestStatus(lastRequest.id, 'APPROVED');
        await userRepository_1.default.updateUser(userId, { role: 'PRO_USER' });
    }
    else {
        await userRepository_1.default.updateUpgradeRequestStatus(lastRequest.id, 'REJECTED');
    }
};
const uploadProfileImage = async (userId, fileObj) => {
    const { fileId, publicUrl } = await driveClient_1.default.uploadToDrive(fileObj);
    fs_1.default.unlink(fileObj.path, (err) => {
        if (err)
            console.error("Geçici dosya silinemedi:", err);
    });
    const existingImage = await prisma_1.default.profileImage.findUnique({
        where: { userId: parseInt(userId) }
    });
    if (existingImage) {
        await driveClient_1.default.deleteFromDrive(existingImage.fileId);
    }
    const savedImage = await prisma_1.default.profileImage.upsert({
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
    const driveResponse = await driveClient_1.default.uploadToDrive(file, cvFolderId);
    // Set others to inactive if this is the first CV? No, user explicitly activates.
    const newCV = await prisma_1.default.cV.create({
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
    const targetUser = await prisma_1.default.user.findUnique({
        where: { id: parseInt(targetUserId) },
        include: {
            sentConnections: { where: { receiverId: parseInt(requesterId), status: 'ACCEPTED' } },
            receivedConnections: { where: { senderId: parseInt(requesterId), status: 'ACCEPTED' } }
        }
    });
    if (!targetUser)
        throw new AppError_1.default("Kullanıcı bulunamadı.", 400);
    const isOwner = parseInt(targetUserId) === parseInt(requesterId);
    const isAdmin = requesterRole === 'SUPERADMIN';
    const isConnected = targetUser.sentConnections.length > 0 || targetUser.receivedConnections.length > 0;
    if (!isOwner && !isAdmin && targetUser.isPrivate && !isConnected) {
        throw new AppError_1.default("Gizli profil olduğu için CV'leri göremezsiniz.", 403);
    }
    const cvs = await prisma_1.default.cV.findMany({
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
const activateCV = async (userId, cvId) => {
    const cv = await prisma_1.default.cV.findFirst({
        where: { id: parseInt(cvId), userId: parseInt(userId) }
    });
    if (!cv)
        throw new AppError_1.default("CV bulunamadı veya yetkiniz yok.", 400);
    // Önce hepsi pasif, sonra seçilen aktif (Transaction ile)
    await prisma_1.default.$transaction([
        prisma_1.default.cV.updateMany({
            where: { userId: parseInt(userId) },
            data: { isActive: false }
        }),
        prisma_1.default.cV.update({
            where: { id: parseInt(cvId) },
            data: { isActive: true }
        })
    ]);
    return true;
};
const deleteCV = async (userId, cvId) => {
    const cv = await prisma_1.default.cV.findFirst({
        where: { id: parseInt(cvId), userId: parseInt(userId) }
    });
    if (!cv)
        throw new AppError_1.default("CV bulunamadı veya yetkiniz yok.", 400);
    // Drive'dan sil
    try {
        await driveClient_1.default.deleteFromDrive(cv.fileId);
    }
    catch (error) {
        console.error("Drive silme hatası (Yine de veritabanından kaldırılacak):", error);
    }
    // Veritabanından sil
    await prisma_1.default.cV.delete({
        where: { id: parseInt(cvId) }
    });
    return true;
};
const getAllActiveCVs = async (requesterId, requesterRole) => {
    const isAdmin = requesterRole === 'SUPERADMIN';
    // Get all active CVs including user and their connections
    const activeCVs = await prisma_1.default.cV.findMany({
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
        if (isOwner || isAdmin)
            return true;
        if (!cv.user.isPrivate)
            return true;
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
        throw new AppError_1.default("Kendinizi engelleyemezsiniz.", 400);
    }
    return await userRepository_1.default.blockUser(blockerId, blockedId);
};
const unblockUser = async (blockerId, blockedId) => {
    return await userRepository_1.default.unblockUser(blockerId, blockedId);
};
const optimizeCVFormat = async (userId, cvId) => {
    const cv = await prisma_1.default.cV.findUnique({
        where: { id: parseInt(cvId) },
        include: { entries: true, user: true }
    });
    if (!cv || cv.userId !== parseInt(userId)) {
        throw new AppError_1.default("CV bulunamadı veya yetkiniz yok.", 404);
    }
    // Optimize edilmiş PDF üret
    const pdfBuffer = await (0, pdfService_1.generateATSPDF)({
        summary: cv.summary,
        userName: cv.user.name,
        userEmail: cv.user.email
    }, cv.entries);
    // Dosyayı geçici olarak diske kaydet (Diğer yüklemelerin mantığı)
    const tempPath = path_1.default.join(os_1.default.tmpdir(), `ATS-${cv.id}-${Date.now()}.pdf`);
    fs_1.default.writeFileSync(tempPath, pdfBuffer);
    // Drive'a yükle
    const driveResponse = await driveClient_1.default.uploadToDrive({
        path: tempPath,
        originalname: `ATS-${cv.fileName}`,
        mimetype: 'application/pdf'
    }, process.env.GOOGLE_DRIVE_CV_FOLDER_ID);
    // Geçici dosyayı sil
    fs_1.default.unlinkSync(tempPath);
    // Veritabanında kaydet
    const atsFormattedCV = await prisma_1.default.atsFormattedCV.upsert({
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
    const cv = await prisma_1.default.cV.findUnique({
        where: { id: parseInt(cvId) },
        select: {
            atsFormatScore: true,
            atsFormatFeedback: true,
            atsFormattedCV: true
        }
    });
    return cv;
};
const getCVDataForRender = async (cvId) => {
    const cv = await prisma_1.default.cV.findUnique({
        where: { id: parseInt(cvId) },
        include: {
            entries: true,
            user: true
        }
    });
    if (!cv)
        throw new AppError_1.default("CV bulunamadı", 400);
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
// ---- İŞ İLANI VE TAILORING FONKSİYONLARI ----
const createJobPosting = async (jobText, url = null) => {
    const extracted = await (0, geminiService_1.extractJobDetails)(jobText);
    return await prisma_1.default.jobPosting.create({
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
    const cv = await prisma_1.default.cV.findUnique({
        where: { id: parseInt(cvId) },
        include: { entries: true }
    });
    const job = await prisma_1.default.jobPosting.findUnique({
        where: { id: parseInt(jobPostingId) }
    });
    if (!cv || !job)
        throw new AppError_1.default("CV veya İş İlanı bulunamadı.", 404);
    const proposals = await (0, geminiService_1.generateTailoringProposals)(cv, job);
    return proposals;
};
const createTailoredCV = async (userId, originalCvId, jobPostingId, tailoredData) => {
    const { improvedSummary, approvedProposals, atsScore } = tailoredData;
    const tailoredCV = await prisma_1.default.tailoredCV.create({
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
            name: p.suggestedTitle || 'Belirtilmemiş',
            description: p.suggestedDescription,
            isModified: true,
            aiComment: p.aiComment
        }));
        await prisma_1.default.tailoredCVEntry.createMany({
            data: entriesToCreate
        });
    }
    return tailoredCV;
};
const optimizeTailoredCV = async (userId, tailoredCvId) => {
    const tailoredCV = await prisma_1.default.tailoredCV.findUnique({
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
        throw new AppError_1.default("Uyarlanmış CV bulunamadı veya yetkiniz yok.", 404);
    }
    // PDF için cvData objesini hazırla (ats_cv.html beklentilerine göre)
    const cvData = {
        userName: tailoredCV.originalCv.user.name,
        userEmail: tailoredCV.originalCv.user.email,
        summary: tailoredCV.originalCv.summary,
        entries: tailoredCV.originalCv.entries
    };
    // PDF Üret (Modern şablonu zorla)
    const pdfBuffer = await (0, pdfService_1.generateTailoredPDF)(cvData, tailoredCV, 'modern');
    // Dosyayı geçici olarak diske kaydet
    const tempPath = path_1.default.join(os_1.default.tmpdir(), `Tailored-${tailoredCvId}-${Date.now()}.pdf`);
    fs_1.default.writeFileSync(tempPath, pdfBuffer);
    // Drive'a yükle
    const driveResponse = await driveClient_1.default.uploadToDrive({
        path: tempPath,
        originalname: `Tailored-${tailoredCV.jobPosting.title}-${tailoredCV.originalCv.fileName}`,
        mimetype: 'application/pdf'
    }, process.env.GOOGLE_DRIVE_CV_FOLDER_ID);
    // Geçici dosyayı sil
    fs_1.default.unlinkSync(tempPath);
    // DB Güncelle
    const updated = await prisma_1.default.tailoredCV.update({
        where: { id: parseInt(tailoredCvId) },
        data: { fileId: driveResponse.fileId }
    });
    return {
        ...updated,
        publicUrl: driveResponse.publicUrl
    };
};
exports.default = {
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
