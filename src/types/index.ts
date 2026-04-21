// Resume Parser Types
export interface ParsedResume {
  text: string;
  sections: ResumeSections;
  metadata: ResumeMetadata;
}

export interface ResumeSections {
  contact: ContactInfo | null;
  summary: string | null;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  projects: ProjectEntry[];
  certifications: string[];
}

export interface ContactInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  website: string | null;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  bulletPoints: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string | null;
  graduationDate: string | null;
  gpa: number | null;
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologies: string[];
}

export interface ResumeMetadata {
  wordCount: number;
  pageCount: number;
  bulletPointCount: number;
  hasQuantifiedAchievements: boolean;
  fileType: 'pdf' | 'docx' | 'txt';
}

// ATS Scoring Types
export interface AtsScore {
  overall: number;
  breakdown: {
    formatting: number;
    keywords: number;
    structure: number;
    content: number;
    readability: number;
  };
  details: ScoreDetail[];
}

export interface ScoreDetail {
  category: string;
  score: number;
  feedback: string;
  suggestion: string;
}

// AI Review Types
export interface ResumeReview {
  atsScore: AtsScore;
  strengths: string[];
  improvements: Improvement[];
  redFlags: RedFlag[];
  industryBenchmark: Benchmark;
  ragContext: RagContext[];
}

export interface Improvement {
  priority: 'high' | 'medium' | 'low';
  category: string;
  issue: string;
  suggestion: string;
  example: string;
}

export interface RedFlag {
  severity: 'critical' | 'warning' | 'notice';
  issue: string;
  impact: string;
  fix: string;
  recruiterStatistic: string;
}

export interface Benchmark {
  percentile: number;
  industryAverage: number;
  topPercentile: number;
  role: string;
}

export interface RagContext {
  source: string;
  relevance: number;
  content: string;
}

// Job Matching Types
export interface JobMatch {
  score: number;
  keywordGaps: KeywordGap[];
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface KeywordGap {
  keyword: string;
  importance: 'critical' | 'important' | 'preferred';
  frequency: number;
}

// Pinecone Types
export interface VectorResult {
  id: string;
  score: number;
  metadata: Record<string, any>;
}

// App State Types
export interface AppState {
  currentStep: 'upload' | 'review' | 'generate' | 'match';
  parsedResume: ParsedResume | null;
  review: ResumeReview | null;
  isLoading: boolean;
  error: string | null;
}
