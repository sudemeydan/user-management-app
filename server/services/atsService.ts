import cvRepository from '../repositories/cvRepository';
import driveClient, { DriveResponse } from '../utils/driveClient';
import AppError from '../utils/AppError';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { generateATSPDF } from './pdfService';

export interface UserData {
  id: number;
  name: string;
  email: string;
}

export interface CVEntry {
  id: number;
  [key: string]: any;
}

export interface CVData {
  id: number;
  userId: number;
  summary: string;
  fileName: string;
  user: UserData;
  entries: CVEntry[];
}

export interface ATSFormattedCV {
  id: number;
  cvId: number;
  fileId: string | null;
  [key: string]: any;
}

export interface OptimizeCVResult extends ATSFormattedCV {
  publicUrl: string;
}


const optimizeCVFormat = async (userId: string | number, cvId: number): Promise<OptimizeCVResult> => {
  const cv = await cvRepository.findCVById(cvId, true) as unknown as CVData;

  if (!cv || cv.userId !== Number(userId)) {
    throw new AppError("CV bulunamadÄ± veya yetkiniz yok.", 404);
  }

  const pdfBuffer: Uint8Array = await generateATSPDF({
    summary: cv.summary,
    userName: cv.user.name,
    userEmail: cv.user.email
  }, cv.entries);

  const tempPath = path.join(os.tmpdir(), `ATS-${cv.id}-${Date.now()}.pdf`);
  fs.writeFileSync(tempPath, pdfBuffer);

  const driveResponse: DriveResponse = await driveClient.uploadToDrive({
    path: tempPath,
    originalname: `ATS-${cv.fileName}`,
    mimetype: 'application/pdf'
  }, process.env.GOOGLE_DRIVE_CV_FOLDER_ID as any);

  fs.unlinkSync(tempPath);

  const atsFormattedCV: ATSFormattedCV = await cvRepository.upsertAtsFormattedCV(cvId, driveResponse.fileId || "");

  return {
    ...atsFormattedCV,
    publicUrl: driveResponse.publicUrl
  };
};

const getUserATSStatus = async (cvId: number): Promise<any> => {
  return await cvRepository.getCVATSStatus(cvId);
};

export default {
  optimizeCVFormat,
  getUserATSStatus
};
