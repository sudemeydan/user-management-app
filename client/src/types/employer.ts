export interface EmployerJobPosting {
  id: number;
  title: string;
  company: string;
  description: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { applications: number };
}

export interface CandidateApplication {
  id: number;
  candidateName: string;
  candidateEmail?: string;
  cvFileName: string;
  cvFileId: string;
  matchScore?: number | null;
  scoreSummary?: string | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  analysisStatus: 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface EmployerJobPostingDetail extends EmployerJobPosting {
  applications: CandidateApplication[];
  createdBy: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AnalysisResult {
  analyzed: number;
  failed: number;
  total: number;
}
