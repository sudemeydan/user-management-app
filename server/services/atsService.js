const cvRepository = require('../repositories/cvRepository');
const driveClient = require('../utils/driveClient');
const AppError = require('../utils/AppError');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { generateATSPDF } = require('./pdfService');

const optimizeCVFormat = async (userId, cvId) => {
  const cv = await cvRepository.findCVById(cvId, true);

  if (!cv || cv.userId !== parseInt(userId)) {
    throw new AppError("CV bulunamadı veya yetkiniz yok.", 404);
  }

  const pdfBuffer = await generateATSPDF({
    summary: cv.summary,
    userName: cv.user.name,
    userEmail: cv.user.email
  }, cv.entries);

  const tempPath = path.join(os.tmpdir(), `ATS-${cv.id}-${Date.now()}.pdf`);
  fs.writeFileSync(tempPath, pdfBuffer);

  const driveResponse = await driveClient.uploadToDrive({
    path: tempPath,
    originalname: `ATS-${cv.fileName}`,
    mimetype: 'application/pdf'
  }, process.env.GOOGLE_DRIVE_CV_FOLDER_ID);

  fs.unlinkSync(tempPath);

  const atsFormattedCV = await cvRepository.upsertAtsFormattedCV(cvId, driveResponse.fileId);

  return {
    ...atsFormattedCV,
    publicUrl: driveResponse.publicUrl
  };
};

const getUserATSStatus = async (cvId) => {
  return await cvRepository.getCVATSStatus(cvId);
};

module.exports = {
  optimizeCVFormat,
  getUserATSStatus
};
