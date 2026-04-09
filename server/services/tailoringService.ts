import jobPostingRepository from '../repositories/jobPostingRepository';
import cvRepository from '../repositories/cvRepository';
import AppError from '../utils/AppError';
import { extractJobDetails, generateTailoringProposals } from './geminiService';
import { generateTailoredPDF } from './pdfService';
import fs from 'fs';
import path from 'path';
import os from 'os';
import driveClient, { DriveResponse } from '../utils/driveClient';

const createJobPosting = async (url: string | null, description: string | undefined, role?: string) => {
  let finalDescription = description;
  let title = role || 'Belirtilmedi';
  let company: string | null = null;

  if (url) {
    const extractedData: any = await extractJobDetails(url);
    if (!extractedData) {
      throw new AppError("URL'den işilanı çekilemedi. Lütfen manuel giriniz.", 400);
    }
    title = extractedData.title || title;
    company = extractedData.company || null;
    finalDescription = extractedData.description || description;
  }

  if (!finalDescription) {
    throw new AppError("Lütfen bir iş ilanı URL'si veya metni giriniz.", 400);
  }

  const jobPosting = await jobPostingRepository.createJobPosting({
    title,
    description: finalDescription,
    company,
    url: url || null
  });

  return jobPosting;
};

const proposalCache = new Map<string, any>();

const getTailoringProposals = async (userId: string | number, cvId: string | number, jobPostingId: string | number) => {
  const cacheKey = `${cvId}-${jobPostingId}`;
  if (proposalCache.has(cacheKey)) {
    console.log(`[CACHE HIT] CV ID: ${cvId}, Job ID: ${jobPostingId} icin onbellekte veri bulundu.`);
    return proposalCache.get(cacheKey);
  }

  console.log(`[CACHE MISS] CV ID: ${cvId}, Job ID: ${jobPostingId} icin Gemini cagriliyor...`);

  const cv: any = await cvRepository.findCVById(cvId, true);
  if (!cv || cv.userId !== Number(userId)) {
    throw new AppError('CV bulunamadı veya yetkiniz yok.', 404);
  }

  const jobPosting = await jobPostingRepository.findJobPostingById(jobPostingId);
  if (!jobPosting) {
    throw new AppError('İş ilanı bulunamadı.', 404);
  }

  const proposals = await generateTailoringProposals(cv, jobPosting.description);
  
  // Sonucu önbelleğe kaydet
  proposalCache.set(cacheKey, proposals);
  
  return proposals;
};


const createTailoredCV = async (userId: string | number, cvId: string | number, jobPostingId: string | number, tailoredData: any) => {
  const jobPosting = await jobPostingRepository.findJobPostingById(jobPostingId);
  if (!jobPosting) throw new AppError('İş ilanı bulunamadı.', 404);

  const cv: any = await cvRepository.findCVById(cvId, true);
  if (!cv || cv.userId !== Number(userId)) throw new AppError('Orijinal CV bulunamadı.', 404);

  const newTailoredCv = await jobPostingRepository.createTailoredCV({
    userId: Number(userId),
    originalCvId: Number(cvId),
    jobPostingId: Number(jobPostingId),
    improvedSummary: tailoredData.improvedSummary || cv.summary,
    ...(tailoredData.atsScore ? { atsScore: tailoredData.atsScore } : {})
  });

  const adaptedEntries = cv.entries.map((entry: any) => {
    const updatedEntry = tailoredData.updatedEntries?.find(
      (e: any) => Number(e.originalEntryId) === Number(entry.id)
    );
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
    await jobPostingRepository.createTailoredCVEntries(adaptedEntries);
  }

  return await jobPostingRepository.findTailoredCVById(newTailoredCv.id);
};

const optimizeTailoredCV = async (userId: string | number, tailoredCvId: string | number) => {
  const tailoredCv: any = await jobPostingRepository.findTailoredCVById(tailoredCvId);

  if (!tailoredCv || tailoredCv.originalCv.userId !== Number(userId)) {
    throw new AppError('Uyarlanmış CV bulunamadı veya yetkiniz yok.', 404);
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

  const pdfBuffer = await generateTailoredPDF(cvData, tailoredData, 'modern');

  const tempPath = path.join(os.tmpdir(), `Tailored-${tailoredCv.id}-${Date.now()}.pdf`);
  fs.writeFileSync(tempPath, pdfBuffer as any);

  const driveResponse = await driveClient.uploadToDrive({
    path: tempPath,
    originalname: `Tailored-${tailoredCv.originalCv.fileName}`,
    mimetype: 'application/pdf'
  }, process.env.GOOGLE_DRIVE_CV_FOLDER_ID as string);

  fs.unlinkSync(tempPath);

  const updatedCv = await jobPostingRepository.updateTailoredCVFileId(tailoredCvId, driveResponse.fileId as string);

  return {
    ...updatedCv,
    publicUrl: driveResponse.publicUrl
  };
};

export default {
  createJobPosting,
  getTailoringProposals,
  createTailoredCV,
  optimizeTailoredCV
};
