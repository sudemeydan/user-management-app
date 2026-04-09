import { Request, Response, NextFunction } from 'express';
import tailoringService from '../services/tailoringService';

const createJobPosting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobText, url } = req.body;
    if (!jobText && !url) {
      res.status(400).json({ success: false, message: "İş ilanı metni veya URL gereklidir." });
      return;
    }
    const jobPosting = await tailoringService.createJobPosting(url, jobText, req.body.role);
    res.json({ success: true, message: "İş ilanı başarıyla kaydedildi!", data: jobPosting });
  } catch (error) {
    next(error);
  }
};

const getTailoringProposals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const proposals = await tailoringService.getTailoringProposals(req.user?.id as string | number, req.params.cvId as string, req.params.jobPostingId as string);
    res.json({ success: true, data: proposals });
  } catch (error) {
    next(error);
  }
};

const createTailoredCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { originalCvId, jobPostingId, improvedSummary, approvedProposals, atsScore } = req.body;
    const userId = req.user?.id as string | number;

    const tailoredCV = await tailoringService.createTailoredCV(userId, originalCvId, jobPostingId, {
      improvedSummary: improvedSummary,
      atsScore: atsScore || null,
      updatedEntries: approvedProposals?.map((p: any) => ({
        originalEntryId: parseInt(p.entryId),
        title: p.suggestedTitle,
        content: p.suggestedDescription,
        aiComment: p.aiComment
      }))
    });

    res.json({ success: true, message: "Uyarlanmış CV başarıyla oluşturuldu!", data: tailoredCV });
  } catch (error) {
    next(error);
  }
};

const optimizeTailoredCV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tailoredCvId = req.params.tailoredCvId as string;
    const userId = req.user?.id as string | number;
    const result = await tailoringService.optimizeTailoredCV(userId, tailoredCvId);
    res.json({ success: true, message: "Uyarlanmış CV PDF'i oluşturuldu!", data: result });
  } catch (error) {
    next(error);
  }
};

export default {
  createJobPosting,
  getTailoringProposals,
  createTailoredCV,
  optimizeTailoredCV
};
