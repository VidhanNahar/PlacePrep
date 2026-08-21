import { describe, it, expect } from 'vitest';
import {
  syncProfileSchema,
  updateProfileSchema,
  createCompanySchema,
  questionInputSchema,
  roundInputSchema,
  createExperienceSchema,
  experienceQuerySchema,
  questionQuerySchema,
  createCommentSchema,
  reviewSubmissionSchema,
  reportContentSchema,
  createRoundTypeSchema,
  UserRole,
  ExperienceType,
  SelectionStatus,
  DifficultyLevel,
  RoundType,
  SubmissionStatus,
  ReportStatus,
  QUESTION_CATEGORIES_PRESETS,
  ROUND_TYPES_PRESETS,
} from '../index.js';

describe('Shared Schemas & Enums Test Suite', () => {
  describe('Enums & Presets Integrity', () => {
    it('should have all valid UserRole values', () => {
      expect(UserRole.STUDENT).toBe('STUDENT');
      expect(UserRole.MODERATOR).toBe('MODERATOR');
      expect(UserRole.ADMIN).toBe('ADMIN');
    });

    it('should have all valid ExperienceType values', () => {
      expect(ExperienceType.ON_CAMPUS).toBe('ON_CAMPUS');
      expect(ExperienceType.OFF_CAMPUS).toBe('OFF_CAMPUS');
      expect(ExperienceType.INTERNSHIP).toBe('INTERNSHIP');
      expect(ExperienceType.PPO).toBe('PPO');
    });

    it('should have all valid SelectionStatus values', () => {
      expect(SelectionStatus.SELECTED).toBe('SELECTED');
      expect(SelectionStatus.REJECTED).toBe('REJECTED');
      expect(SelectionStatus.WAITLISTED).toBe('WAITLISTED');
      expect(SelectionStatus.OPTED_OUT).toBe('OPTED_OUT');
    });

    it('should have all valid DifficultyLevel values', () => {
      expect(DifficultyLevel.EASY).toBe('EASY');
      expect(DifficultyLevel.MEDIUM).toBe('MEDIUM');
      expect(DifficultyLevel.HARD).toBe('HARD');
      expect(DifficultyLevel.VERY_HARD).toBe('VERY_HARD');
    });

    it('should have all valid RoundType values', () => {
      expect(RoundType.ONLINE_ASSESSMENT).toBe('ONLINE_ASSESSMENT');
      expect(RoundType.TECHNICAL).toBe('TECHNICAL');
      expect(RoundType.SYSTEM_DESIGN).toBe('SYSTEM_DESIGN');
      expect(RoundType.MANAGERIAL).toBe('MANAGERIAL');
      expect(RoundType.HR).toBe('HR');
      expect(RoundType.GROUP_DISCUSSION).toBe('GROUP_DISCUSSION');
      expect(RoundType.OTHER).toBe('OTHER');
    });

    it('should have non-empty QUESTION_CATEGORIES_PRESETS with valid slugs', () => {
      expect(QUESTION_CATEGORIES_PRESETS.length).toBeGreaterThan(5);
      for (const cat of QUESTION_CATEGORIES_PRESETS) {
        expect(cat.name).toBeDefined();
        expect(cat.slug).toBeDefined();
        expect(cat.description).toBeDefined();
      }
    });

    it('should have non-empty ROUND_TYPES_PRESETS', () => {
      expect(ROUND_TYPES_PRESETS.length).toBeGreaterThan(5);
      for (const rt of ROUND_TYPES_PRESETS) {
        expect(rt.label).toBeDefined();
        expect(rt.value).toBeDefined();
      }
    });
  });

  describe('syncProfileSchema', () => {
    it('should validate correct student profile data', () => {
      const validData = {
        fullName: 'Aarav Sharma',
        collegeName: 'Thapar Institute',
        graduationYear: 2025,
        branch: 'Computer Science and Engineering',
      };
      const result = syncProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fullName).toBe('Aarav Sharma');
      }
    });

    it('should reject names shorter than 2 characters', () => {
      const invalidData = {
        fullName: 'A',
        collegeName: 'Thapar Institute',
        graduationYear: 2025,
        branch: 'CSE',
      };
      const result = syncProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject graduation years outside 2020-2035 range', () => {
      const tooEarly = {
        fullName: 'Aarav Sharma',
        collegeName: 'Thapar',
        graduationYear: 2015,
        branch: 'CSE',
      };
      expect(syncProfileSchema.safeParse(tooEarly).success).toBe(false);

      const tooLate = {
        fullName: 'Aarav Sharma',
        collegeName: 'Thapar',
        graduationYear: 2040,
        branch: 'CSE',
      };
      expect(syncProfileSchema.safeParse(tooLate).success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate partial updates', () => {
      const validPartial = {
        fullName: 'Aarav S.',
        bio: 'Aspiring distributed systems architect.',
      };
      const result = updateProfileSchema.safeParse(validPartial);
      expect(result.success).toBe(true);
    });

    it('should reject bio exceeding 500 characters', () => {
      const longBio = {
        bio: 'x'.repeat(501),
      };
      expect(updateProfileSchema.safeParse(longBio).success).toBe(false);
    });
  });

  describe('createCompanySchema', () => {
    it('should validate valid company input', () => {
      const valid = {
        name: 'Google LLC',
        websiteUrl: 'https://careers.google.com',
        logoUrl: 'https://www.google.com/favicon.ico',
        industry: 'Big Tech',
        description: 'Global technology company.',
      };
      expect(createCompanySchema.safeParse(valid).success).toBe(true);
    });

    it('should accept empty strings for optional URLs', () => {
      const validEmptyUrls = {
        name: 'Startup Inc',
        websiteUrl: '',
        logoUrl: '',
      };
      expect(createCompanySchema.safeParse(validEmptyUrls).success).toBe(true);
    });

    it('should reject invalid website URL', () => {
      const invalidUrl = {
        name: 'Invalid Corp',
        websiteUrl: 'not-a-valid-url',
      };
      expect(createCompanySchema.safeParse(invalidUrl).success).toBe(false);
    });
  });

  describe('questionInputSchema & roundInputSchema', () => {
    const validCategoryId = '123e4567-e89b-12d3-a456-426614174000';

    it('should validate question input schema', () => {
      const validQuestion = {
        categoryId: validCategoryId,
        questionText: 'Explain the difference between process and thread.',
        answerApproach: 'Processes have separate address space while threads share memory.',
        difficulty: DifficultyLevel.MEDIUM,
        topicTag: 'Operating Systems / Concurrency',
      };
      expect(questionInputSchema.safeParse(validQuestion).success).toBe(true);
    });

    it('should reject question with invalid category UUID', () => {
      const invalidQuestion = {
        categoryId: 'not-a-uuid',
        questionText: 'Sample question text',
        difficulty: DifficultyLevel.EASY,
        topicTag: 'General',
      };
      expect(questionInputSchema.safeParse(invalidQuestion).success).toBe(false);
    });

    it('should validate round input schema', () => {
      const validRound = {
        roundNumber: 1,
        roundName: 'Online Assessment',
        roundType: RoundType.ONLINE_ASSESSMENT,
        difficulty: DifficultyLevel.MEDIUM,
        durationMinutes: 90,
        description: 'Two coding questions on Arrays and Dynamic Programming.',
        questions: [
          {
            categoryId: validCategoryId,
            questionText: 'Find maximum subarray sum using Kadane algorithm.',
            difficulty: DifficultyLevel.MEDIUM,
            topicTag: 'Dynamic Programming',
          },
        ],
      };
      expect(roundInputSchema.safeParse(validRound).success).toBe(true);
    });
  });

  describe('createExperienceSchema', () => {
    const validCategoryId = '123e4567-e89b-12d3-a456-426614174000';
    const validCompanyId = '123e4567-e89b-12d3-a456-426614174001';

    const validExperience = {
      companyId: validCompanyId,
      roleTitle: 'Software Development Engineer',
      expType: ExperienceType.ON_CAMPUS,
      batchYear: 2025,
      placementCycleYear: 2024,
      outcome: SelectionStatus.SELECTED,
      overallDifficulty: DifficultyLevel.MEDIUM,
      totalRounds: 1,
      compensationCtc: 45,
      location: 'Bangalore',
      overview: 'Very structured and smooth recruitment drive on campus with coding and technical rounds.',
      preparationTips: 'Focus on LeetCode mediums and practice behavioral STAR stories.',
      isAnonymous: false,
      rounds: [
        {
          roundNumber: 1,
          roundName: 'Technical Round 1',
          roundType: RoundType.TECHNICAL,
          difficulty: DifficultyLevel.MEDIUM,
          durationMinutes: 60,
          description: 'DSA and Problem solving round focusing on binary trees.',
          questions: [
            {
              categoryId: validCategoryId,
              questionText: 'Invert a binary tree in place.',
              answerApproach: 'Recursive swap of left and right child nodes.',
              difficulty: DifficultyLevel.EASY,
              topicTag: 'Binary Trees',
            },
          ],
        },
      ],
    };

    it('should validate full experience payload', () => {
      const result = createExperienceSchema.safeParse(validExperience);
      expect(result.success).toBe(true);
    });

    it('should reject experience with empty rounds array', () => {
      const invalid = {
        ...validExperience,
        rounds: [],
      };
      expect(createExperienceSchema.safeParse(invalid).success).toBe(false);
    });

    it('should reject non-positive compensation CTC', () => {
      const negativeCtc = {
        ...validExperience,
        compensationCtc: -10,
      };
      expect(createExperienceSchema.safeParse(negativeCtc).success).toBe(false);
    });
  });

  describe('experienceQuerySchema & questionQuerySchema', () => {
    it('should parse query parameters with coercion and defaults', () => {
      const query = {
        page: '2',
        limit: '10',
        sort: 'upvotes',
        difficulty: 'HARD',
      };
      const parsed = experienceQuerySchema.parse(query);
      expect(parsed.page).toBe(2);
      expect(parsed.limit).toBe(10);
      expect(parsed.sort).toBe('upvotes');
      expect(parsed.difficulty).toBe(DifficultyLevel.HARD);
    });

    it('should apply defaults when pagination parameters are absent', () => {
      const parsed = experienceQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(15);
      expect(parsed.sort).toBe('recent');
    });

    it('should validate questionQuerySchema', () => {
      const parsed = questionQuerySchema.parse({
        page: '1',
        limit: '25',
        topic: 'Graph',
      });
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(25);
      expect(parsed.topic).toBe('Graph');
    });
  });

  describe('createCommentSchema, reviewSubmissionSchema, reportContentSchema', () => {
    it('should validate createCommentSchema', () => {
      expect(createCommentSchema.safeParse({ content: 'Helpful breakdown!' }).success).toBe(true);
      expect(createCommentSchema.safeParse({ content: 'H' }).success).toBe(false); // too short
    });

    it('should validate reviewSubmissionSchema', () => {
      expect(
        reviewSubmissionSchema.safeParse({
          status: SubmissionStatus.APPROVED,
        }).success
      ).toBe(true);

      expect(
        reviewSubmissionSchema.safeParse({
          status: SubmissionStatus.REJECTED,
          rejectionReason: 'Please add more details about the technical questions asked.',
        }).success
      ).toBe(true);

      expect(
        reviewSubmissionSchema.safeParse({
          status: 'INVALID_STATUS' as any,
        }).success
      ).toBe(false);
    });

    it('should validate reportContentSchema', () => {
      const validReport = {
        experienceId: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'Inappropriate content',
        details: 'Violates community guidelines.',
      };
      expect(reportContentSchema.safeParse(validReport).success).toBe(true);
    });
  });
});
