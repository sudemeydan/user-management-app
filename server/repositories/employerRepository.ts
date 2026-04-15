import prisma from '../utils/prisma';
import { Prisma } from '@prisma/client';

// --- İş İlanı (EmployerJobPosting) ---

const createJobPosting = async (data: {
  title: string;
  company: string;
  description: string;
  location?: string;
  createdById: number;
}) => {
  return await prisma.employerJobPosting.create({
    data
  });
};

const findJobPostingsByUser = async (userId: number) => {
  return await prisma.employerJobPosting.findMany({
    where: { createdById: userId },
    include: {
      _count: { select: { applications: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const findJobPostingById = async (id: number) => {
  return await prisma.employerJobPosting.findUnique({
    where: { id }
  });
};

const findJobPostingWithApplications = async (id: number) => {
  return await prisma.employerJobPosting.findUnique({
    where: { id },
    include: {
      applications: {
        orderBy: { matchScore: { sort: 'desc', nulls: 'last' } }
      },
      createdBy: {
        select: { id: true, name: true, email: true }
      }
    }
  });
};

const deleteJobPosting = async (id: number) => {
  return await prisma.employerJobPosting.delete({
    where: { id }
  });
};

// --- Aday Başvurusu (CandidateApplication) ---

const createApplication = async (data: {
  jobPostingId: number;
  candidateName: string;
  candidateEmail?: string;
  userId?: number;
  cvFileId: string;
  cvFileName: string;
}) => {
  return await prisma.candidateApplication.create({
    data
  });
};

const findApplicationById = async (id: number) => {
  return await prisma.candidateApplication.findUnique({
    where: { id },
    include: {
      jobPosting: true
    }
  });
};

const findApplicationsByJobPosting = async (jobPostingId: number) => {
  return await prisma.candidateApplication.findMany({
    where: { jobPostingId },
    orderBy: { matchScore: { sort: 'desc', nulls: 'last' } }
  });
};

const findPendingApplicationsByJobPosting = async (jobPostingId: number) => {
  return await prisma.candidateApplication.findMany({
    where: {
      jobPostingId,
      analysisStatus: { in: ['PENDING', 'FAILED'] },
      cvRawText: { not: null }
    }
  });
};

const updateApplicationRawText = async (id: number, rawText: string) => {
  return await prisma.candidateApplication.update({
    where: { id },
    data: {
      cvRawText: rawText,
      analysisStatus: 'PENDING'
    }
  });
};

const updateApplicationAnalysis = async (id: number, analysisData: {
  matchScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
}) => {
  return await prisma.candidateApplication.update({
    where: { id },
    data: {
      matchScore: analysisData.matchScore,
      scoreSummary: analysisData.summary,
      strengths: analysisData.strengths,
      weaknesses: analysisData.weaknesses,
      analysisStatus: 'COMPLETED'
    }
  });
};

const updateApplicationStatus = async (id: number, status: 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED') => {
  return await prisma.candidateApplication.update({
    where: { id },
    data: { analysisStatus: status }
  });
};

const deleteApplication = async (id: number) => {
  return await prisma.candidateApplication.delete({
    where: { id }
  });
};

export default {
  createJobPosting,
  findJobPostingsByUser,
  findJobPostingById,
  findJobPostingWithApplications,
  deleteJobPosting,
  createApplication,
  findApplicationById,
  findApplicationsByJobPosting,
  findPendingApplicationsByJobPosting,
  updateApplicationRawText,
  updateApplicationAnalysis,
  updateApplicationStatus,
  deleteApplication
};
