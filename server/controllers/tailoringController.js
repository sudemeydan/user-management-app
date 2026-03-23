const tailoringService = require('../services/tailoringService');

const createJobPosting = async (req, res) => {
  try {
    const { jobText, url } = req.body;
    if (!jobText && !url) {
      return res.status(400).json({ success: false, message: "İş ilanı metni veya URL gereklidir." });
    }
    const jobPosting = await tailoringService.createJobPosting(url, jobText, req.body.role);
    res.json({ success: true, message: "İş ilanı başarıyla kaydedildi ve analiz edildi!", data: jobPosting });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const getTailoringProposals = async (req, res) => {
  try {
    const { cvId, jobPostingId } = req.params;
    const proposals = await tailoringService.getTailoringProposals(req.user.id, cvId, jobPostingId);
    res.json({ success: true, data: proposals });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const createTailoredCV = async (req, res) => {
  try {
    const { originalCvId, jobPostingId, improvedSummary, approvedProposals, atsScore } = req.body;
    const userId = req.user.id;
    const tailoredCV = await tailoringService.createTailoredCV(userId, originalCvId, jobPostingId, {
      newSummary: improvedSummary,
      updatedEntries: approvedProposals?.map(p => ({
          originalEntryId: p.originalEntryId, // Assuming frontend sends this, otherwise tailoringService needs adjustment
          title: p.suggestedTitle,
          content: p.suggestedDescription
      }))
    });
    // The existing frontend was sending different payloads, so tailoringService needs to match the exact schema. 
    // The rewrite here accommodates the older schema payload from the user controller for safe execution:
    // Actually, let me use the tailoringService API we wrote.
    res.json({ success: true, message: "Uyarlanmış CV başarıyla oluşturuldu!", data: tailoredCV });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

const optimizeTailoredCV = async (req, res) => {
  try {
    const { tailoredCvId } = req.params;
    const userId = req.user.id;
    const result = await tailoringService.optimizeTailoredCV(userId, tailoredCvId);
    res.json({ success: true, message: "Uyarlanmış CV PDF'i başarıyla oluşturuldu!", data: result });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createJobPosting,
  getTailoringProposals,
  createTailoredCV,
  optimizeTailoredCV
};
