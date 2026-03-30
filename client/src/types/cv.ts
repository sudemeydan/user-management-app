export interface CVEntry {
  id: number;
  category: 'SKILL' | 'EXPERIENCE' | 'EDUCATION';
  title: string;
  name?: string;
  subtitle?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isModified?: boolean;
  aiComment?: string;
}

export interface TailoredCV {
  id: number;
  jobPosting?: {
    title: string;
    company: string;
  };
  atsScore?: number;
  fileId?: string;
  improvedSummary?: string;
  entries?: CVEntry[];
}

export interface CVData {
  id: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  atsFormatScore?: number;
  atsFormatFeedback?: string;
  summary?: string;
  personalInfo?: {
    firstName?: string;
    lastName?: string;
  };
  entries?: CVEntry[];
  tailoredCVs?: TailoredCV[];
  isActive?: boolean;
  fileName?: string;
}
