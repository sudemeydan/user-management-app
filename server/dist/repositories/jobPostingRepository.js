"use strict";
const prisma = require('../utils/prisma');
const createJobPosting = async (jobData) => {
    return await prisma.jobPosting.create({
        data: jobData
    });
};
const findJobPostingById = async (jobPostingId) => {
    return await prisma.jobPosting.findUnique({
        where: { id: parseInt(jobPostingId) }
    });
};
const createTailoredCV = async (tailoredData) => {
    return await prisma.tailoredCV.create({
        data: tailoredData
    });
};
const createTailoredCVEntries = async (entries) => {
    return await prisma.tailoredCVEntry.createMany({
        data: entries
    });
};
const findTailoredCVById = async (tailoredCvId) => {
    return await prisma.tailoredCV.findUnique({
        where: { id: parseInt(tailoredCvId) },
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
    return await prisma.tailoredCV.update({
        where: { id: parseInt(tailoredCvId) },
        data: { fileId: fileId }
    });
};
module.exports = {
    createJobPosting,
    findJobPostingById,
    createTailoredCV,
    createTailoredCVEntries,
    findTailoredCVById,
    updateTailoredCVFileId
};
