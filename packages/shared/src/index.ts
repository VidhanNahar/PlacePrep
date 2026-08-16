import { z } from 'zod';

// ==========================================
// 1. ENUMS
// ==========================================

export const UserRole = {
  STUDENT: 'STUDENT',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ExperienceType = {
  ON_CAMPUS: 'ON_CAMPUS',
  OFF_CAMPUS: 'OFF_CAMPUS',
  INTERNSHIP: 'INTERNSHIP',
  PPO: 'PPO',
} as const;
export type ExperienceType = (typeof ExperienceType)[keyof typeof ExperienceType];

export const SelectionStatus = {
  SELECTED: 'SELECTED',
  REJECTED: 'REJECTED',
  WAITLISTED: 'WAITLISTED',
  OPTED_OUT: 'OPTED_OUT',
} as const;
export type SelectionStatus = (typeof SelectionStatus)[keyof typeof SelectionStatus];

export const DifficultyLevel = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
  VERY_HARD: 'VERY_HARD',
} as const;
export type DifficultyLevel = (typeof DifficultyLevel)[keyof typeof DifficultyLevel];

export const RoundType = {
  ONLINE_ASSESSMENT: 'ONLINE_ASSESSMENT',
  TECHNICAL: 'TECHNICAL',
  SYSTEM_DESIGN: 'SYSTEM_DESIGN',
  MANAGERIAL: 'MANAGERIAL',
  HR: 'HR',
  GROUP_DISCUSSION: 'GROUP_DISCUSSION',
  OTHER: 'OTHER',
} as const;
export type RoundType = (typeof RoundType)[keyof typeof RoundType];

export const SubmissionStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type SubmissionStatus = (typeof SubmissionStatus)[keyof typeof SubmissionStatus];

export const ReportStatus = {
  OPEN: 'OPEN',
  INVESTIGATING: 'INVESTIGATING',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

// ==========================================
// 2. QUESTION CATEGORIES
// ==========================================

export const QUESTION_CATEGORIES_PRESETS = [
  { name: 'Data Structures & Algorithms', slug: 'dsa', description: 'Arrays, Trees, Graphs, DP, Recursion, etc.' },
  { name: 'Object-Oriented Programming', slug: 'oop', description: 'Encapsulation, Polymorphism, Inheritance, Design Patterns' },
  { name: 'Database Management Systems', slug: 'dbms', description: 'SQL, Normalization, Indexing, Transactions, ACID' },
  { name: 'Operating Systems', slug: 'os', description: 'Process Management, Threads, Deadlocks, Memory Virtualization' },
  { name: 'Computer Networks', slug: 'cn', description: 'OSI Model, TCP/UDP, DNS, HTTP/HTTPS, Routing' },
  { name: 'System Design', slug: 'system-design', description: 'High-level architecture, Caching, Sharding, Load Balancing' },
  { name: 'Behavioral & HR', slug: 'hr', description: 'STAR format questions, Situational questions, Leadership principles' },
  { name: 'Aptitude & Logical Reasoning', slug: 'aptitude', description: 'Quantitative math, puzzles, and critical reasoning' },
  { name: 'Other', slug: 'other', description: 'Domain specific or miscellaneous placement questions' },
] as const;

// ==========================================
// 3. ZOD VALIDATION SCHEMAS & INTERFACES
// ==========================================

// --- Auth & User ---
export const syncProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(150),
  collegeName: z.string().min(2, 'College name is required').max(200),
  graduationYear: z.number().int().min(2020).max(2035),
  branch: z.string().min(2, 'Branch / Department is required').max(100),
});
export type SyncProfileInput = z.infer<typeof syncProfileSchema>;

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  graduationYear: z.number().int().min(2020).max(2035).optional(),
  branch: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export interface UserDTO {
  id: string;
  authId: string;
  email: string;
  fullName: string;
  collegeName: string;
  graduationYear: number;
  branch: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

// --- Companies ---
export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name is required').max(200),
  websiteUrl: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  industry: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
});
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

export interface CompanyDTO {
  id: string;
  name: string;
  slug: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  industry?: string | null;
  description?: string | null;
  totalExperiencesCount: number;
  createdAt: string;
}

// --- Questions ---
export const questionInputSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  questionText: z.string().min(5, 'Question text must be at least 5 characters'),
  answerApproach: z.string().optional().or(z.literal('')),
  difficulty: z.nativeEnum(DifficultyLevel),
  topicTag: z.string().min(1, 'Topic tag is required (e.g. Dynamic Programming, B-Trees)').max(100),
});
export type QuestionInput = z.infer<typeof questionInputSchema>;

export interface QuestionDTO {
  id: string;
  roundId: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  questionText: string;
  answerApproach?: string | null;
  difficulty: DifficultyLevel;
  topicTag: string;
  createdAt: string;
  companyName?: string;
  roleTitle?: string;
}

// --- Rounds ---
export const roundInputSchema = z.object({
  id: z.string().optional(),
  roundNumber: z.number().int().min(1).max(15),
  roundName: z.string().min(2, 'Round name is required').max(150),
  roundType: z.nativeEnum(RoundType),
  difficulty: z.nativeEnum(DifficultyLevel),
  durationMinutes: z.number().int().positive().optional(),
  description: z.string().min(10, 'Round description must be at least 10 characters'),
  questions: z.array(questionInputSchema).default([]),
});
export type RoundInput = z.infer<typeof roundInputSchema>;

export interface RoundDTO {
  id: string;
  experienceId: string;
  roundNumber: number;
  roundName: string;
  roundType: RoundType;
  difficulty: DifficultyLevel;
  durationMinutes?: number | null;
  description: string;
  questions: QuestionDTO[];
  createdAt: string;
}

// --- Interview Experiences ---
export const createExperienceSchema = z.object({
  companyId: z.string().uuid('Please select a valid company'),
  roleTitle: z.string().min(2, 'Role title is required (e.g. Software Engineer)').max(150),
  expType: z.nativeEnum(ExperienceType),
  batchYear: z.number().int().min(2018).max(2030),
  placementCycleYear: z.number().int().min(2018).max(2030),
  outcome: z.nativeEnum(SelectionStatus),
  overallDifficulty: z.nativeEnum(DifficultyLevel),
  totalRounds: z.number().int().min(1).max(15),
  compensationCtc: z.number().positive().optional(),
  location: z.string().max(150).optional(),
  overview: z.string().min(30, 'Overview must be at least 30 characters explaining the hiring process'),
  preparationTips: z.string().optional().or(z.literal('')),
  isAnonymous: z.boolean().default(false),
  rounds: z.array(roundInputSchema).min(1, 'At least one interview round must be provided'),
});
export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;

export interface ExperienceDTO {
  id: string;
  userId: string;
  authorName?: string;
  authorCollege?: string;
  authorGraduationYear?: number;
  isAnonymous?: boolean;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string | null;
  roleTitle: string;
  expType: ExperienceType;
  batchYear: number;
  placementCycleYear: number;
  outcome: SelectionStatus;
  overallDifficulty: DifficultyLevel;
  totalRounds: number;
  compensationCtc?: number | null;
  location?: string | null;
  overview: string;
  preparationTips?: string | null;
  status: SubmissionStatus;
  rejectionReason?: string | null;
  upvoteCount: number;
  commentCount: number;
  viewCount: number;
  isUpvotedByMe?: boolean;
  isBookmarkedByMe?: boolean;
  rounds?: RoundDTO[];
  createdAt: string;
  updatedAt: string;
}

// --- Search and Query Filters ---
export const experienceQuerySchema = z.object({
  query: z.string().optional(),
  companyId: z.string().optional(),
  role: z.string().optional(),
  batchYear: z.coerce.number().int().optional(),
  outcome: z.nativeEnum(SelectionStatus).optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  expType: z.nativeEnum(ExperienceType).optional(),
  topic: z.string().optional(),
  sort: z.enum(['recent', 'upvotes', 'difficulty_asc', 'difficulty_desc']).default('recent'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});
export type ExperienceQueryParams = z.infer<typeof experienceQuerySchema>;

export const questionQuerySchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  companyId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type QuestionQueryParams = z.infer<typeof questionQuerySchema>;

// --- Comments & Community ---
export const createCommentSchema = z.object({
  content: z.string().min(2, 'Comment must be at least 2 characters').max(1500),
  parentCommentId: z.string().uuid().optional(),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export interface CommentDTO {
  id: string;
  experienceId: string;
  userId: string;
  userName: string;
  userCollege: string;
  parentCommentId?: string | null;
  content: string;
  isDeleted: boolean;
  replies?: CommentDTO[];
  createdAt: string;
  updatedAt: string;
}

// --- Moderation ---
export const reviewSubmissionSchema = z.object({
  status: z.enum([SubmissionStatus.APPROVED, SubmissionStatus.REJECTED]),
  rejectionReason: z.string().optional(),
});
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;

export const reportContentSchema = z.object({
  experienceId: z.string().uuid().optional(),
  commentId: z.string().uuid().optional(),
  reason: z.string().min(3).max(100),
  details: z.string().max(1000).optional(),
});
export type ReportContentInput = z.infer<typeof reportContentSchema>;

// --- Platform Analytics ---
export interface PlatformAnalyticsDTO {
  totalExperiences: number;
  totalCompanies: number;
  totalQuestions: number;
  avgCtcLpa: number;
  selectionRatePercent: number;
  topCompanies: { companyId: string; name: string; count: number }[];
  difficultyDistribution: Record<DifficultyLevel, number>;
  topQuestionTopics: { topic: string; count: number; category: string }[];
}

// --- Generic API Response Envelopes ---
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
