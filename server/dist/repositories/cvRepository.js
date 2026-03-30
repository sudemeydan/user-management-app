"use strict";
const prisma = require('../utils/prisma');
const createCV = async (cvData) => {
    return await prisma.cV.create({
        data: cvData
    });
};
const findCVById = async (cvId, includeRelations = false) => {
    const query = { where: { id: parseInt(cvId) } };
    if (includeRelations) {
        query.include = { entries: true, user: true };
    }
    return await prisma.cV.findUnique(query);
};
const findCVByIdWithTailored = async (cvId, userId) => {
    return await prisma.cV.findFirst({
        where: { id: parseInt(cvId), userId: parseInt(userId) }
    });
};
const findUserCVs = async (targetUserId, includeActiveOnly = false) => {
    const query = {
        where: {
            userId: parseInt(targetUserId),
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
const findAllActiveCVs = async (requesterId) => {
    return await prisma.cV.findMany({
        where: { isActive: true },
        include: {
            user: {
                include: {
                    sentConnections: { where: { receiverId: parseInt(requesterId), status: 'ACCEPTED' } },
                    receivedConnections: { where: { senderId: parseInt(requesterId), status: 'ACCEPTED' } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};
const activateCV = async (userId, cvId) => {
    return await prisma.$transaction([
        prisma.cV.updateMany({
            where: { userId: parseInt(userId) },
            data: { isActive: false }
        }),
        prisma.cV.update({
            where: { id: parseInt(cvId) },
            data: { isActive: true }
        })
    ]);
};
const deleteCV = async (cvId) => {
    return await prisma.cV.delete({
        where: { id: parseInt(cvId) }
    });
};
const getCVATSStatus = async (cvId) => {
    return await prisma.cV.findUnique({
        where: { id: parseInt(cvId) },
        select: {
            atsFormatScore: true,
            atsFormatFeedback: true,
            atsFormattedCV: true
        }
    });
};
const upsertAtsFormattedCV = async (cvId, fileId) => {
    return await prisma.atsFormattedCV.upsert({
        where: { cvId: parseInt(cvId) },
        update: {
            fileId: fileId
        },
        create: {
            cvId: parseInt(cvId),
            fileId: fileId
        }
    });
};
const countUserCVs = async (userId) => {
    return await prisma.cV.count({
        where: { userId: parseInt(userId) }
    });
};
module.exports = {
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
