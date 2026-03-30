import { Request, Response, NextFunction } from 'express';
import cvService from '../services/cvService';
import { sendToQueue } from '../services/rabbitmqService';
import driveClient from '../utils/driveClient';
import fs from 'fs';
import cvRepository from '../repositories/cvRepository';

const uploadCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: "LÃ¼tfen geÃ§erli bir PDF veya DOCX dosyasÄ± seÃ§in." });
      return;
    }

    const userRole = req.user?.role; 
    const userId = req.user?.id;
    
    if (!userId) {
       res.status(401).json({ success: false, message: "KullanÄ±cÄ± bulunamadÄ±." });
       return;
    }

    const cvCount = await cvRepository.countUserCVs(userId);

    if (userRole === 'FREE_USER' && cvCount >= 1) {
      res.status(403).json({ success: false, message: "Ãœcretsiz kullanÄ±cÄ±lar en fazla 1 adet CV yÃ¼kleyip analiz ettirebilir." });
      return;
    }

    if (userRole === 'PRO_USER' && cvCount >= 5) {
      res.status(403).json({ success: false, message: "Pro kullanÄ±cÄ±lar en fazla 5 adet CV yÃ¼kleyip analiz ettirebilir." });
      return;
    }

    let pdfBase64: string | null = null;

    if (req.file.mimetype === 'application/pdf') {
      if (req.file.buffer) {
        pdfBase64 = req.file.buffer.toString('base64');
      } else if (req.file.path) {
        const fileData = fs.readFileSync(req.file.path);
        pdfBase64 = fileData.toString('base64');
      } else {
        throw new Error("Dosya verisi okunamadÄ±.");
      }
    }

    const savedCV = await cvService.uploadCV(userId, req.file);

    if (pdfBase64) {
      const queueMessage = { cvId: savedCV.id, fileData: pdfBase64 };
      await sendToQueue('cv_parsing_queue', queueMessage);
      console.log(`[x] CV (ID: ${savedCV.id}) RabbitMQ kuyruÄŸuna gÃ¶nderildi.`);
    }

    res.json({ success: true, message: "CV baÅŸarÄ±yla yÃ¼klendi ve iÅŸleniyor!", data: savedCV });
  } catch (error) {
    next(error);
  }
};

const getUserCVs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const targetUserId = req.params.id as string;
    const requesterId = req.user?.id as string | number;
    const requesterRole = req.user?.role;

    const cvs = await cvService.getUserCVs(targetUserId, requesterId, requesterRole);
    res.json({ success: true, data: cvs });
  } catch (error) {
    next(error);
  }
};

const activateCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cvId = req.params.cvId as string;
    const userId = req.user?.id as string | number;
    await cvService.activateCV(userId, cvId);
    res.json({ success: true, message: "CV aktif edildi." });
  } catch (error) {
    next(error);
  }
};

const deleteCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cvId = req.params.cvId as string;
    const userId = req.user?.id as string | number;
    await cvService.deleteCV(userId, cvId);
    res.json({ success: true, message: "CV silindi." });
  } catch (error) {
    next(error);
  }
};

const getAllActiveCVs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const requesterId = req.user?.id as string | number;
    const requesterRole = req.user?.role;

    const cvs = await cvService.getAllActiveCVs(requesterId, requesterRole);
    res.json({ success: true, data: cvs });
  } catch (error) {
    next(error);
  }
};

const downloadCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const fileId = req.params.fileId as string;
    await driveClient.streamFile(fileId, res);
  } catch (error) {
    next(error);
  }
};

const downloadCvPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cvId = req.params.cvId as string;
    const template = req.query.template as string || 'classic';
    
    const pdfBuffer = await cvService.generatePdfBufferForDownload(cvId, template);
    
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=cv-${cvId}-ats.pdf`,
        'Content-Length': pdfBuffer.length.toString()
    });
    
    res.end(pdfBuffer);
    
  } catch (error) {
    next(error);
  }
};

export default {
  uploadCV,
  getUserCVs,
  activateCV,
  deleteCV,
  getAllActiveCVs,
  downloadCV,
  downloadCvPdf
};
