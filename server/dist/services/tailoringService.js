"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jobPostingRepository_1 = __importDefault(require("../repositories/jobPostingRepository"));
const cvRepository_1 = __importDefault(require("../repositories/cvRepository"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const geminiService_1 = require("./geminiService");
const pdfService_1 = require("./pdfService");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const driveClient_1 = __importDefault(require("../utils/driveClient"));
const createJobPosting = async (url, description, role) => {
    let finalDescription = description;
    let title = role || 'Belirtilmedi';
    let company = null;
    if (url) {
        const extractedData = await (0, geminiService_1.extractJobDetails)(url);
        if (!extractedData) {
            throw new AppError_1.default("URL'den işilanı çekilemedi. Lütfen manuel giriniz.", 400);
        }
        title = extractedData.title || title;
        company = extractedData.company || null;
        finalDescription = extractedData.description || description;
    }
    if (!finalDescription) {
        throw new AppError_1.default("Lütfen bir iş ilanı URL'si veya metni giriniz.", 400);
    }
    const jobPosting = await jobPostingRepository_1.default.createJobPosting({
        title,
        description: finalDescription,
        company,
        url: url || null
    });
    return jobPosting;
};
const proposalCache = new Map();
const getTailoringProposals = async (userId, cvId, jobPostingId) => {
    const cacheKey = `${cvId}-${jobPostingId}`;
    if (proposalCache.has(cacheKey)) {
        console.log(`[CACHE HIT] CV ID: ${cvId}, Job ID: ${jobPostingId} icin onbellekte veri bulundu.`);
        return proposalCache.get(cacheKey);
    }
    console.log(`[CACHE MISS] CV ID: ${cvId}, Job ID: ${jobPostingId} icin Gemini cagriliyor...`);
    const cv = await cvRepository_1.default.findCVById(cvId, true);
    if (!cv || cv.userId !== Number(userId)) {
        throw new AppError_1.default('CV bulunamadı veya yetkiniz yok.', 404);
    }
    const jobPosting = await jobPostingRepository_1.default.findJobPostingById(jobPostingId);
    if (!jobPosting) {
        throw new AppError_1.default('İş ilanı bulunamadı.', 404);
    }
    const proposals = await (0, geminiService_1.generateTailoringProposals)(cv, jobPosting.description);
    // Sonucu önbelleğe kaydet
    proposalCache.set(cacheKey, proposals);
    return proposals;
};
const createTailoredCV = async (userId, cvId, jobPostingId, tailoredData) => {
    const jobPosting = await jobPostingRepository_1.default.findJobPostingById(jobPostingId);
    if (!jobPosting)
        throw new AppError_1.default('İş ilanı bulunamadı.', 404);
    const cv = await cvRepository_1.default.findCVById(cvId, true);
    if (!cv || cv.userId !== Number(userId))
        throw new AppError_1.default('Orijinal CV bulunamadı.', 404);
    const newTailoredCv = await jobPostingRepository_1.default.createTailoredCV({
        userId: Number(userId),
        originalCvId: Number(cvId),
        jobPostingId: Number(jobPostingId),
        improvedSummary: tailoredData.improvedSummary || cv.summary,
        ...(tailoredData.atsScore ? { atsScore: tailoredData.atsScore } : {})
    });
    const adaptedEntries = cv.entries.map((entry) => {
        const updatedEntry = tailoredData.updatedEntries?.find((e) => Number(e.originalEntryId) === Number(entry.id));
        return {
            tailoredCvId: newTailoredCv.id,
            category: entry.category,
            name: updatedEntry?.title || entry.title,
            description: updatedEntry?.content || entry.description,
            isModified: !!updatedEntry,
            aiComment: updatedEntry?.aiComment || null
        };
    });
    if (adaptedEntries.length > 0) {
        await jobPostingRepository_1.default.createTailoredCVEntries(adaptedEntries);
    }
    return await jobPostingRepository_1.default.findTailoredCVById(newTailoredCv.id);
};
const optimizeTailoredCV = async (userId, tailoredCvId) => {
    const tailoredCv = await jobPostingRepository_1.default.findTailoredCVById(tailoredCvId);
    if (!tailoredCv || tailoredCv.originalCv.userId !== Number(userId)) {
        throw new AppError_1.default('Uyarlanmış CV bulunamadı veya yetkiniz yok.', 404);
    }
    const cvData = {
        summary: tailoredCv.originalCv.summary,
        userName: tailoredCv.originalCv.user.name,
        userEmail: tailoredCv.originalCv.user.email,
        entries: tailoredCv.originalCv.entries
    };
    const tailoredData = {
        improvedSummary: tailoredCv.improvedSummary,
        entries: tailoredCv.entries
    };
    const pdfBuffer = await (0, pdfService_1.generateTailoredPDF)(cvData, tailoredData, 'modern');
    const tempPath = path_1.default.join(os_1.default.tmpdir(), `Tailored-${tailoredCv.id}-${Date.now()}.pdf`);
    fs_1.default.writeFileSync(tempPath, pdfBuffer);
    const driveResponse = await driveClient_1.default.uploadToDrive({
        path: tempPath,
        originalname: `Tailored-${tailoredCv.originalCv.fileName}`,
        mimetype: 'application/pdf'
    }, process.env.GOOGLE_DRIVE_CV_FOLDER_ID);
    fs_1.default.unlinkSync(tempPath);
    const updatedCv = await jobPostingRepository_1.default.updateTailoredCVFileId(tailoredCvId, driveResponse.fileId);
    return {
        ...updatedCv,
        publicUrl: driveResponse.publicUrl
    };
};
exports.default = {
    createJobPosting,
    getTailoringProposals,
    createTailoredCV,
    optimizeTailoredCV
};
