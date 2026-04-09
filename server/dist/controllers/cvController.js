"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cvService_1 = __importDefault(require("../services/cvService"));
const rabbitmqService_1 = require("../services/rabbitmqService");
const driveClient_1 = __importDefault(require("../utils/driveClient"));
const fs_1 = __importDefault(require("fs"));
const cvRepository_1 = __importDefault(require("../repositories/cvRepository"));
const uploadCV = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: "Lütfen geçerli bir PDF veya DOCX dosyası seçin." });
            return;
        }
        const userRole = req.user?.role;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ success: false, message: "Kullanıcı bulunamadı." });
            return;
        }
        const cvCount = await cvRepository_1.default.countUserCVs(userId);
        if (userRole === 'FREE_USER' && cvCount >= 1) {
            res.status(403).json({ success: false, message: "Ücretsiz kullanıcılar en fazla 1 adet CV yükleyip analiz ettirebilir." });
            return;
        }
        if (userRole === 'PRO_USER' && cvCount >= 5) {
            res.status(403).json({ success: false, message: "Pro kullanıcılar en fazla 5 adet CV yükleyip analiz ettirebilir." });
            return;
        }
        let pdfBase64 = null;
        if (req.file.mimetype === 'application/pdf') {
            if (req.file.buffer) {
                pdfBase64 = req.file.buffer.toString('base64');
            }
            else if (req.file.path) {
                const fileData = fs_1.default.readFileSync(req.file.path);
                pdfBase64 = fileData.toString('base64');
            }
            else {
                throw new Error("Dosya verisi okunamadı.");
            }
        }
        const savedCV = await cvService_1.default.uploadCV(userId, req.file);
        if (pdfBase64) {
            const queueMessage = { cvId: savedCV.id, fileData: pdfBase64 };
            await (0, rabbitmqService_1.sendToQueue)('cv_parsing_queue', queueMessage);
            console.log(`[x] CV (ID: ${savedCV.id}) RabbitMQ kuyruğuna gönderildi.`);
        }
        res.json({ success: true, message: "CV başarıyla yüklendi ve işleniyor!", data: savedCV });
    }
    catch (error) {
        next(error);
    }
};
const getUserCVs = async (req, res, next) => {
    try {
        const targetUserId = req.params.id;
        const requesterId = req.user?.id;
        const requesterRole = req.user?.role;
        const cvs = await cvService_1.default.getUserCVs(targetUserId, requesterId, requesterRole);
        res.json({ success: true, data: cvs });
    }
    catch (error) {
        next(error);
    }
};
const activateCV = async (req, res, next) => {
    try {
        const cvId = req.params.cvId;
        const userId = req.user?.id;
        await cvService_1.default.activateCV(userId, cvId);
        res.json({ success: true, message: "CV aktif edildi." });
    }
    catch (error) {
        next(error);
    }
};
const deleteCV = async (req, res, next) => {
    try {
        const cvId = req.params.cvId;
        const userId = req.user?.id;
        await cvService_1.default.deleteCV(userId, cvId);
        res.json({ success: true, message: "CV silindi." });
    }
    catch (error) {
        next(error);
    }
};
const getAllActiveCVs = async (req, res, next) => {
    try {
        const requesterId = req.user?.id;
        const requesterRole = req.user?.role;
        const cvs = await cvService_1.default.getAllActiveCVs(requesterId, requesterRole);
        res.json({ success: true, data: cvs });
    }
    catch (error) {
        next(error);
    }
};
const downloadCV = async (req, res, next) => {
    try {
        const fileId = req.params.fileId;
        await driveClient_1.default.streamFile(fileId, res);
    }
    catch (error) {
        next(error);
    }
};
const downloadCvPdf = async (req, res, next) => {
    try {
        const cvId = req.params.cvId;
        const template = req.query.template || 'classic';
        const pdfBuffer = await cvService_1.default.generatePdfBufferForDownload(cvId, template);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=cv-${cvId}-ats.pdf`,
            'Content-Length': pdfBuffer.length.toString()
        });
        res.end(pdfBuffer);
    }
    catch (error) {
        next(error);
    }
};
exports.default = {
    uploadCV,
    getUserCVs,
    activateCV,
    deleteCV,
    getAllActiveCVs,
    downloadCV,
    downloadCvPdf
};
