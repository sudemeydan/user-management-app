import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

const createJobPosting = async (jobData: Prisma.JobPostingCreateInput) => {
  return await prisma.jobPosting.create({
    data: jobData
  });
};

const findJobPostingById = async (jobPostingId: string | number) => {
  return await prisma.jobPosting.findUnique({
    where: { id: Number(jobPostingId) }
  });
};

const createTailoredCV = async (tailoredData: Prisma.TailoredCVCreateInput | Prisma.TailoredCVUncheckedCreateInput) => {
  return await prisma.tailoredCV.create({
    data: tailoredData
  });
};

const createTailoredCVEntries = async (entries: Prisma.TailoredCVEntryCreateManyInput[]) => {
    return await prisma.tailoredCVEntry.createMany({
        data: entries
    });
};

const findTailoredCVById = async (tailoredCvId: string | number) => {
  return await prisma.tailoredCV.findUnique({
    where: { id: Number(tailoredCvId) },
    include: {
      entries: true,
      jobPosting: true,
      originalCv: {
        include: {
          entries: true,
          user: true
        }
      }
    }
  });
};

const updateTailoredCVFileId = async (tailoredCvId: string | number, fileId: string) => {
    return await prisma.tailoredCV.update({
        where: { id: Number(tailoredCvId) },
        data: { fileId: fileId }
    });
};

export default {
  createJobPosting,
  findJobPostingById,
  createTailoredCV,
  createTailoredCVEntries,
  findTailoredCVById,
  updateTailoredCVFileId
};
