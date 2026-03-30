"use strict";
const cvService = require('../services/cvService');
const { sendToQueue } = require('../services/rabbitmqService');
const driveClient = require('../utils/driveClient');
const fs = require('fs');
const uploadCV = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Lütfen geçerli bir PDF veya DOCX dosyası seçin." });
        }
        // YENİ: Kullanıcı Limiti Kontrolü
        const cvRepository = require('../repositories/cvRepository'); // Limit kontrolü için veritabanı erişimi
        const userRole = req.user.role; // req.user.role auth middleware'den geliyor
        const userId = req.user.id;
        // Kullanıcının mevcut CV sayısını kontrol et
        const cvCount = await cvRepository.countUserCVs(userId);
        if (userRole === 'FREE_USER' && cvCount >= 1) {
            return res.status(403).json({ success: false, message: "Ücretsiz kullanıcılar en fazla 1 adet CV yükleyip analiz ettirebilir. Lütfen Pro sürüme geçiş yapın." });
        }
        if (userRole === 'PRO_USER' && cvCount >= 5) {
            return res.status(403).json({ success: false, message: "Pro kullanıcılar en fazla 5 adet CV yükleyip analiz ettirebilir." });
        }
        // SUPERADMIN için limit yok, devam et.
        let pdfBase64 = null;
        if (req.file.mimetype === 'application/pdf') {
            if (req.file.buffer) {
                pdfBase64 = req.file.buffer.toString('base64');
            }
            else if (req.file.path) {
                const fileData = fs.readFileSync(req.file.path);
                pdfBase64 = fileData.toString('base64');
            }
            else {
                throw new Error("Dosya verisi okunamadı (ne buffer ne de path bulundu).");
            }
        }
        const savedCV = await cvService.uploadCV(req.user.id, req.file);
        if (pdfBase64) {
            const queueMessage = { cvId: savedCV.id, fileData: pdfBase64 };
            await sendToQueue('cv_parsing_queue', queueMessage);
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
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        const cvs = await cvService.getUserCVs(targetUserId, requesterId, requesterRole);
        res.json({ success: true, data: cvs });
    }
    catch (error) {
        next(error);
    }
};
const activateCV = async (req, res, next) => {
    try {
        const cvId = req.params.cvId;
        const userId = req.user.id;
        await cvService.activateCV(userId, cvId);
        res.json({ success: true, message: "CV başarıyla aktif edildi." });
    }
    catch (error) {
        next(error);
    }
};
const deleteCV = async (req, res, next) => {
    try {
        const cvId = req.params.cvId;
        const userId = req.user.id;
        await cvService.deleteCV(userId, cvId);
        res.json({ success: true, message: "CV başarıyla silindi." });
    }
    catch (error) {
        next(error);
    }
};
const getAllActiveCVs = async (req, res, next) => {
    try {
        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        const cvs = await cvService.getAllActiveCVs(requesterId, requesterRole);
        res.json({ success: true, data: cvs });
    }
    catch (error) {
        next(error);
    }
};
const downloadCV = async (req, res, next) => {
    try {
        const { fileId } = req.params;
        await driveClient.streamFile(fileId, res);
    }
    catch (error) {
        next(error);
    }
};
const downloadCvPdf = async (req, res, next) => {
    try {
        const { cvId } = req.params;
        const { template = 'classic' } = req.query;
        // DB logic moved to service
        const pdfBuffer = await cvService.generatePdfBufferForDownload(cvId, template);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=cv-${cvId}-ats.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.end(pdfBuffer);
    }
    catch (error) {
        next(error);
    }
};
module.exports = {
    uploadCV,
    getUserCVs,
    activateCV,
    deleteCV,
    getAllActiveCVs,
    downloadCV,
    downloadCvPdf
};
