import prisma from '../utils/prisma';
import { CV, Prisma } from '@prisma/client';

const createCV = async (cvData: Prisma.CVCreateInput) => {
  return await prisma.cV.create({
    data: cvData
  });
};

const findCVById = async (cvId: string | number, includeRelations = false) => {
  const query: Prisma.CVFindUniqueArgs = { where: { id: Number(cvId) } };
  if (includeRelations) {
    query.include = { entries: true, user: true };
  }
  return await prisma.cV.findUnique(query);
};

const findCVByIdWithTailored = async (cvId: string | number, userId: string | number) => {
  return await prisma.cV.findFirst({
    where: { id: Number(cvId), userId: Number(userId) }
  });
};

const findUserCVs = async (targetUserId: string | number, includeActiveOnly = false) => {
  const query: Prisma.CVFindManyArgs = {
    where: {
      userId: Number(targetUserId),
      ...(includeActiveOnly ? { isActive: true } : {})
    },
    include: {
      entries: true,
      tailoredCVs: {
        include: {
          entries: true,
          jobPosting: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  };
  return await prisma.cV.findMany(query);
};

const findAllActiveCVs = async (requesterId: string | number) => {
  return await prisma.cV.findMany({
    where: { isActive: true },
    include: {
      user: {
        include: {
          sentConnections: { where: { receiverId: Number(requesterId), status: 'ACCEPTED' } },
          receivedConnections: { where: { senderId: Number(requesterId), status: 'ACCEPTED' } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const activateCV = async (userId: string | number, cvId: string | number) => {
  return await prisma.$transaction([
    prisma.cV.updateMany({
      where: { userId: Number(userId) },
      data: { isActive: false }
    }),
    prisma.cV.update({
      where: { id: Number(cvId) },
      data: { isActive: true }
    })
  ]);
};

const deleteCV = async (cvId: string | number) => {
  return await prisma.cV.delete({
    where: { id: Number(cvId) }
  });
};

const getCVATSStatus = async (cvId: string | number) => {
  return await prisma.cV.findUnique({
    where: { id: Number(cvId) },
    select: {
      atsFormatScore: true,
      atsFormatFeedback: true,
      atsFormattedCV: true
    }
  });
};

const upsertAtsFormattedCV = async (cvId: string | number, fileId: string) => {
  return await prisma.atsFormattedCV.upsert({
    where: { cvId: Number(cvId) },
    update: {
      fileId: fileId
    },
    create: {
      cvId: Number(cvId),
      fileId: fileId
    }
  });
};

const countUserCVs = async (userId: string | number) => {
  return await prisma.cV.count({
    where: { userId: Number(userId) }
  });
};

export default {
  createCV,
  findCVById,
  findCVByIdWithTailored,
  findUserCVs,
  findAllActiveCVs,
  activateCV,
  deleteCV,
  getCVATSStatus,
  upsertAtsFormattedCV,
  countUserCVs
};
