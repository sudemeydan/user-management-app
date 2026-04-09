"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cvRepository_1 = __importDefault(require("../repositories/cvRepository"));
const driveClient_1 = __importDefault(require("../utils/driveClient"));
const AppError_1 = __importDefault(require("../utils/AppError"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const pdfService_1 = require("./pdfService");
const optimizeCVFormat = async (userId, cvId) => {
    const cv = await cvRepository_1.default.findCVById(cvId, true);
    if (!cv || cv.userId !== Number(userId)) {
        throw new AppError_1.default("CV bulunamadÄ± veya yetkiniz yok.", 404);
    }
    const pdfBuffer = await (0, pdfService_1.generateATSPDF)({
        summary: cv.summary,
        userName: cv.user.name,
        userEmail: cv.user.email
    }, cv.entries);
    const tempPath = path_1.default.join(os_1.default.tmpdir(), `ATS-${cv.id}-${Date.now()}.pdf`);
    fs_1.default.writeFileSync(tempPath, pdfBuffer);
    const driveResponse = await driveClient_1.default.uploadToDrive({
        path: tempPath,
        originalname: `ATS-${cv.fileName}`,
        mimetype: 'application/pdf'
    }, process.env.GOOGLE_DRIVE_CV_FOLDER_ID);
    fs_1.default.unlinkSync(tempPath);
    const atsFormattedCV = await cvRepository_1.default.upsertAtsFormattedCV(cvId, driveResponse.fileId || "");
    return {
        ...atsFormattedCV,
        publicUrl: driveResponse.publicUrl
    };
};
const getUserATSStatus = async (cvId) => {
    return await cvRepository_1.default.getCVATSStatus(cvId);
};
exports.default = {
    optimizeCVFormat,
    getUserATSStatus
};
