import { Request, Response, NextFunction } from 'express';
import employerService from '../services/employerService';

const createJobPosting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.user?.id);
    const { title, company, description, location } = req.body;

    if (!title || !company || !description) {
      res.status(400).json({ success: false, message: "Başlık, şirket ve açıklama alanları zorunludur." });
      return;
    }

    const jobPosting = await employerService.createJobPosting(userId, { title, company, description, location });
    res.status(201).json({ success: true, message: "İş ilanı başarıyla oluşturuldu!", data: jobPosting });
  } catch (error) {
    next(error);
  }
};

const getMyJobPostings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.user?.id);
    const jobPostings = await employerService.getMyJobPostings(userId);
    res.json({ success: true, data: jobPostings });
  } catch (error) {
    next(error);
  }
};

const getJobPostingDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobPostingId = Number(req.params.id);
    const userId = Number(req.user?.id);
    const jobPosting = await employerService.getJobPostingDetail(jobPostingId, userId);
    res.json({ success: true, data: jobPosting });
  } catch (error) {
    next(error);
  }
};

const deleteJobPosting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobPostingId = Number(req.params.id);
    const userId = Number(req.user?.id);
    await employerService.deleteJobPosting(jobPostingId, userId);
    res.json({ success: true, message: "İş ilanı başarıyla silindi." });
  } catch (error) {
    next(error);
  }
};

const uploadApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobPostingId = Number(req.params.id);
    const userId = Number(req.user?.id);

    if (!req.file) {
      res.status(400).json({ success: false, message: "Lütfen bir CV dosyası (PDF) seçin." });
      return;
    }

    const { candidateName, candidateEmail } = req.body;
    if (!candidateName) {
      res.status(400).json({ success: false, message: "Aday adı zorunludur." });
      return;
    }

    const application = await employerService.uploadApplication(jobPostingId, userId, req.file, {
      candidateName,
      candidateEmail
    });

    res.status(201).json({ success: true, message: "Başvuru başarıyla yüklendi ve işleniyor!", data: application });
  } catch (error) {
    next(error);
  }
};

const analyzeAllApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobPostingId = Number(req.params.id);
    const userId = Number(req.user?.id);
    const result = await employerService.analyzeAllApplications(jobPostingId, userId);
    res.json({ success: true, message: `Analiz tamamlandı. ${result.analyzed} başarılı, ${result.failed} başarısız.`, data: result });
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const applicationId = Number(req.params.appId);
    const userId = Number(req.user?.id);
    await employerService.deleteApplication(applicationId, userId);
    res.json({ success: true, message: "Başvuru başarıyla silindi." });
  } catch (error) {
    next(error);
  }
};

export default {
  createJobPosting,
  getMyJobPostings,
  getJobPostingDetail,
  deleteJobPosting,
  uploadApplication,
  analyzeAllApplications,
  deleteApplication
};
