import employerRepository from '../repositories/employerRepository';
import driveClient from '../utils/driveClient';
import { sendToQueue } from './rabbitmqService';
import { scoreCVForJobPosting } from './geminiService';
import AppError from '../utils/AppError';
import fs from 'fs';

// --- İş İlanı İşlemleri ---

const createJobPosting = async (userId: number, data: {
  title: string;
  company: string;
  description: string;
  location?: string;
}) => {
  return await employerRepository.createJobPosting({
    ...data,
    createdById: userId
  });
};

const getMyJobPostings = async (userId: number) => {
  return await employerRepository.findJobPostingsByUser(userId);
};

const getJobPostingDetail = async (jobPostingId: number, requestingUserId: number) => {
  const jobPosting = await employerRepository.findJobPostingWithApplications(jobPostingId);

  if (!jobPosting) {
    throw new AppError('İş ilanı bulunamadı.', 404);
  }

  // Sadece oluşturan kişi veya ADMIN görebilir
  if (jobPosting.createdById !== requestingUserId) {
    throw new AppError('Bu ilanı görüntüleme yetkiniz yok.', 403);
  }

  return jobPosting;
};

const deleteJobPosting = async (jobPostingId: number, requestingUserId: number) => {
  const jobPosting = await employerRepository.findJobPostingById(jobPostingId);

  if (!jobPosting) {
    throw new AppError('İş ilanı bulunamadı.', 404);
  }

  if (jobPosting.createdById !== requestingUserId) {
    throw new AppError('Bu ilanı silme yetkiniz yok.', 403);
  }

  return await employerRepository.deleteJobPosting(jobPostingId);
};

// --- Başvuru İşlemleri ---

const uploadApplication = async (
  jobPostingId: number,
  requestingUserId: number,
  file: Express.Multer.File,
  candidateInfo: { candidateName: string; candidateEmail?: string }
) => {
  // İlanın varlığını ve sahipliğini kontrol et
  const jobPosting = await employerRepository.findJobPostingById(jobPostingId);
  if (!jobPosting) {
    throw new AppError('İş ilanı bulunamadı.', 404);
  }
  if (jobPosting.createdById !== requestingUserId) {
    throw new AppError('Bu ilana başvuru yükleme yetkiniz yok.', 403);
  }

  // Drive'a yükle
  const cvFolderId = process.env.GOOGLE_DRIVE_CV_FOLDER_ID;
  const driveResponse = await driveClient.uploadToDrive(file, cvFolderId as string);

  // DB'ye kaydet
  const application = await employerRepository.createApplication({
    jobPostingId,
    candidateName: candidateInfo.candidateName,
    candidateEmail: candidateInfo.candidateEmail,
    cvFileId: driveResponse.fileId || "",
    cvFileName: file.originalname
  });

  // RabbitMQ'ya parse görevi gönder (mevcut pipeline)
  if (file.mimetype === 'application/pdf') {
    let pdfBase64: string | null = null;

    if (file.buffer) {
      pdfBase64 = file.buffer.toString('base64');
    } else if (file.path) {
      const fileData = fs.readFileSync(file.path);
      pdfBase64 = fileData.toString('base64');
    }

    if (pdfBase64) {
      // employer_cv_result_queue'den geri alınacak; applicationId ekliyoruz
      const queueMessage = {
        cvId: application.id,
        fileData: pdfBase64,
        source: 'employer'       // Hangi pipeline'dan geldiğini belirt
      };
      await sendToQueue('cv_parsing_queue', queueMessage as any);
      console.log(`[EMPLOYER] Başvuru CV (ID: ${application.id}) RabbitMQ kuyruğuna gönderildi.`);
    }
  }

  return application;
};

const deleteApplication = async (applicationId: number, requestingUserId: number) => {
  const application = await employerRepository.findApplicationById(applicationId);

  if (!application) {
    throw new AppError('Başvuru bulunamadı.', 404);
  }

  if (application.jobPosting.createdById !== requestingUserId) {
    throw new AppError('Bu başvuruyu silme yetkiniz yok.', 403);
  }

  // Drive'dan sil
  try {
    await driveClient.deleteFromDrive(application.cvFileId);
  } catch (error) {
    console.error("Drive silme hatası (Yine de veritabanından kaldırılacak):", error);
  }

  return await employerRepository.deleteApplication(applicationId);
};

// --- AI Analiz İşlemleri ---

const BATCH_SIZE = 3;      // Gemini rate limit koruması
const BATCH_DELAY_MS = 2000; // Gruplar arası bekleme

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const analyzeAllApplications = async (jobPostingId: number, requestingUserId: number) => {
  const jobPosting = await employerRepository.findJobPostingWithApplications(jobPostingId);

  if (!jobPosting) {
    throw new AppError('İş ilanı bulunamadı.', 404);
  }
  if (jobPosting.createdById !== requestingUserId) {
    throw new AppError('Bu ilanın analizini başlatma yetkiniz yok.', 403);
  }

  // rawText'i dolu olan ve henüz analiz edilmemiş başvuruları al
  const pendingApplications = await employerRepository.findPendingApplicationsByJobPosting(jobPostingId);

  if (pendingApplications.length === 0) {
    return { analyzed: 0, failed: 0, message: 'Analiz edilecek başvuru bulunamadı. CV\'ler henüz parse edilmemiş olabilir.' };
  }

  let analyzed = 0;
  let failed = 0;

  // Batch halinde analiz et (rate limiting koruması)
  for (let i = 0; i < pendingApplications.length; i += BATCH_SIZE) {
    const batch = pendingApplications.slice(i, i + BATCH_SIZE);

    const results = await Promise.allSettled(
      batch.map(async (app) => {
        try {
          // Status: ANALYZING
          await employerRepository.updateApplicationStatus(app.id, 'ANALYZING');

          // Gemini skoru
          const analysis = await scoreCVForJobPosting(
            app.cvRawText!,
            jobPosting.description,
            jobPosting.title
          );

          // Sonucu kaydet
          await employerRepository.updateApplicationAnalysis(app.id, analysis);
          return 'success';
        } catch (error) {
          console.error(`[EMPLOYER] Başvuru ID ${app.id} analiz hatası:`, error);
          await employerRepository.updateApplicationStatus(app.id, 'FAILED');
          throw error;
        }
      })
    );

    results.forEach(result => {
      if (result.status === 'fulfilled') analyzed++;
      else failed++;
    });

    // Son batch değilse bekle
    if (i + BATCH_SIZE < pendingApplications.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return { analyzed, failed, total: pendingApplications.length };
};

// RabbitMQ'dan gelen employer CV parse sonuçlarını işle
const handleEmployerCVParseResult = async (applicationId: number, rawText: string) => {
  try {
    await employerRepository.updateApplicationRawText(applicationId, rawText);
    console.log(`[EMPLOYER] Başvuru CV (ID: ${applicationId}) rawText kaydedildi.`);
  } catch (error) {
    console.error(`[EMPLOYER] Başvuru rawText kaydetme hatası (ID: ${applicationId}):`, error);
  }
};

export default {
  createJobPosting,
  getMyJobPostings,
  getJobPostingDetail,
  deleteJobPosting,
  uploadApplication,
  deleteApplication,
  analyzeAllApplications,
  handleEmployerCVParseResult
};
