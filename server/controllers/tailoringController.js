const tailoringService = require('../services/tailoringService');

const createJobPosting = async (req, res, next) => {
  try {
    const { jobText, url } = req.body;
    if (!jobText && !url) {
      return res.status(400).json({ success: false, message: "İş ilanı metni veya URL gereklidir." });
    }
    const jobPosting = await tailoringService.createJobPosting(url, jobText, req.body.role);
    res.json({ success: true, message: "İş ilanı başarıyla kaydedildi ve analiz edildi!", data: jobPosting });
  } catch (error) {
    next(error);
  }
};

const getTailoringProposals = async (req, res, next) => {
  try {
    const { cvId, jobPostingId } = req.params;
    const proposals = await tailoringService.getTailoringProposals(req.user.id, cvId, jobPostingId);
    res.json({ success: true, data: proposals });
  } catch (error) {
    next(error);
  }
};

const createTailoredCV = async (req, res, next) => {
  try {
    const { originalCvId, jobPostingId, improvedSummary, approvedProposals, atsScore } = req.body;
    const userId = req.user.id;

    const tailoredCV = await tailoringService.createTailoredCV(userId, originalCvId, jobPostingId, {
      improvedSummary: improvedSummary,
      atsScore: atsScore || null,
      updatedEntries: approvedProposals?.map(p => ({
        // BUG FIX: frontend entryId gönderir (string), parseInt ile int'e çeviriyoruz
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

const optimizeTailoredCV = async (req, res, next) => {
  try {
    const { tailoredCvId } = req.params;
    const userId = req.user.id;
    const result = await tailoringService.optimizeTailoredCV(userId, tailoredCvId);
    res.json({ success: true, message: "Uyarlanmış CV PDF'i başarıyla oluşturuldu!", data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJobPosting,
  getTailoringProposals,
  createTailoredCV,
  optimizeTailoredCV
};
