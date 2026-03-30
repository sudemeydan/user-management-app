"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../utils/prisma"));
const createJobPosting = async (jobData) => {
    return await prisma_1.default.jobPosting.create({
        data: jobData
    });
};
const findJobPostingById = async (jobPostingId) => {
    return await prisma_1.default.jobPosting.findUnique({
        where: { id: Number(jobPostingId) }
    });
};
const createTailoredCV = async (tailoredData) => {
    return await prisma_1.default.tailoredCV.create({
        data: tailoredData
    });
};
const createTailoredCVEntries = async (entries) => {
    return await prisma_1.default.tailoredCVEntry.createMany({
        data: entries
    });
};
const findTailoredCVById = async (tailoredCvId) => {
    return await prisma_1.default.tailoredCV.findUnique({
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
const updateTailoredCVFileId = async (tailoredCvId, fileId) => {
    return await prisma_1.default.tailoredCV.update({
        where: { id: Number(tailoredCvId) },
        data: { fileId: fileId }
    });
};
exports.default = {
    createJobPosting,
    findJobPostingById,
    createTailoredCV,
    createTailoredCVEntries,
    findTailoredCVById,
    updateTailoredCVFileId
};
