"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../utils/prisma"));
const createCV = async (cvData) => {
    return await prisma_1.default.cV.create({
        data: cvData
    });
};
const findCVById = async (cvId, includeRelations = false) => {
    const query = { where: { id: Number(cvId) } };
    if (includeRelations) {
        query.include = { entries: true, user: true };
    }
    return await prisma_1.default.cV.findUnique(query);
};
const findCVByIdWithTailored = async (cvId, userId) => {
    return await prisma_1.default.cV.findFirst({
        where: { id: Number(cvId), userId: Number(userId) }
    });
};
const findUserCVs = async (targetUserId, includeActiveOnly = false) => {
    const query = {
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
    return await prisma_1.default.cV.findMany(query);
};
const findAllActiveCVs = async (requesterId) => {
    return await prisma_1.default.cV.findMany({
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
const activateCV = async (userId, cvId) => {
    return await prisma_1.default.$transaction([
        prisma_1.default.cV.updateMany({
            where: { userId: Number(userId) },
            data: { isActive: false }
        }),
        prisma_1.default.cV.update({
            where: { id: Number(cvId) },
            data: { isActive: true }
        })
    ]);
};
const deleteCV = async (cvId) => {
    return await prisma_1.default.cV.delete({
        where: { id: Number(cvId) }
    });
};
const getCVATSStatus = async (cvId) => {
    return await prisma_1.default.cV.findUnique({
        where: { id: Number(cvId) },
        select: {
            atsFormatScore: true,
            atsFormatFeedback: true,
            atsFormattedCV: true
        }
    });
};
const upsertAtsFormattedCV = async (cvId, fileId) => {
    return await prisma_1.default.atsFormattedCV.upsert({
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
const countUserCVs = async (userId) => {
    return await prisma_1.default.cV.count({
        where: { userId: Number(userId) }
    });
};
exports.default = {
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
