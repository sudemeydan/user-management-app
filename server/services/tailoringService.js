const jobPostingRepository = require('../repositories/jobPostingRepository');
const cvRepository = require('../repositories/cvRepository');
const appError = require('../utils/AppError');
const { extractJobDetails, generateTailoringProposals } = require('./geminiService');
const { generateTailoredPDF } = require('./pdfService');
const fs = require('fs');
const path = require('path');
const os = require('os');
const driveClient = require('../utils/driveClient');

const createJobPosting = async (url, description, role) => {
  let finalDescription = description;

  if (url) {
    const extractedData = await extractJobDetails(url);
    if (extractedData) {
      finalDescription = `Başlık: ${extractedData.title}\nŞirket: ${extractedData.company}\n\nDetaylar:\n${extractedData.description}`;
    } else {
      throw new appError("URL'den iş ilanı çekilemedi. Lütfen manuel giriniz.", 400);
    }
  }

  if (!finalDescription) {
    throw new appError("Lütfen bir iş ilanı URL'si veya metni giriniz.", 400);
  }

  // finalDescription'dan başlık çıkar (varsa)
  let title = role || "Belirtilmedi";
  const titleMatch = finalDescription.match(/Başlık:\s*(.+)/);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }

  let company = null;
  const companyMatch = finalDescription.match(/Şirket:\s*(.+)/);
  if (companyMatch) {
    company = companyMatch[1].trim();
  }

  const jobPosting = await jobPostingRepository.createJobPosting({
    title: title,
    description: finalDescription,
    company: company,
    url: url || null
  });

  return jobPosting;
};

const getTailoringProposals = async (userId, cvId, jobPostingId) => {
  const cv = await cvRepository.findCVById(cvId, true);
  if (!cv || cv.userId !== parseInt(userId)) {
    throw new appError("CV bulunamadı veya yetkiniz yok.", 404);
  }

  const jobPosting = await jobPostingRepository.findJobPostingById(jobPostingId);
  if (!jobPosting) {
    throw new appError("İş ilanı bulunamadı.", 404);
  }

  const proposals = await generateTailoringProposals(cv, jobPosting.description);
  return proposals;
};

const createTailoredCV = async (userId, cvId, jobPostingId, tailoredData) => {
  const jobPosting = await jobPostingRepository.findJobPostingById(jobPostingId);
  if (!jobPosting) throw new appError("İş ilanı bulunamadı.", 404);

  const cv = await cvRepository.findCVById(cvId, true);
  if (!cv || cv.userId !== parseInt(userId)) throw new appError("Orijinal CV bulunamadı.", 404);

  const newTailoredCv = await jobPostingRepository.createTailoredCV({
    userId: parseInt(userId),
    originalCvId: parseInt(cvId),
    jobPostingId: parseInt(jobPostingId),
    improvedSummary: tailoredData.improvedSummary || cv.summary,
    // ATS skoru varsa kaydet
    ...(tailoredData.atsScore ? { atsScore: tailoredData.atsScore } : {})
  });

  const adaptedEntries = cv.entries.map(entry => {
    // BUG FIX: parseInt ile karşılaştır — entryId string gelir, entry.id number olur
    const updatedEntry = tailoredData.updatedEntries?.find(
      e => parseInt(e.originalEntryId) === parseInt(entry.id)
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

const optimizeTailoredCV = async (userId, tailoredCvId) => {
  const tailoredCv = await jobPostingRepository.findTailoredCVById(tailoredCvId);

  if (!tailoredCv || tailoredCv.originalCv.userId !== parseInt(userId)) {
    throw new appError("Uyarlanmış CV bulunamadı veya yetkiniz yok.", 404);
  }

  // pdfService.generateTailoredPDF beklediği format:
  // cvData = { summary, userName, userEmail, entries: [...originalEntries] }
  // tailoredData = { improvedSummary, entries: [...tailoredEntries] }
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
  fs.writeFileSync(tempPath, pdfBuffer);

  const driveResponse = await driveClient.uploadToDrive({
    path: tempPath,
    originalname: `Tailored-${tailoredCv.originalCv.fileName}`,
    mimetype: 'application/pdf'
  }, process.env.GOOGLE_DRIVE_CV_FOLDER_ID);

  fs.unlinkSync(tempPath);

  const updatedCv = await jobPostingRepository.updateTailoredCVFileId(tailoredCvId, driveResponse.fileId);

  return {
    ...updatedCv,
    publicUrl: driveResponse.publicUrl
  };
};

module.exports = {
  createJobPosting,
  getTailoringProposals,
  createTailoredCV,
  optimizeTailoredCV
};
