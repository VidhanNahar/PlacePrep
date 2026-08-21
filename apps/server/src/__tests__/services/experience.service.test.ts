import { describe, it, expect, vi, beforeEach } from 'vitest';
import { experienceService } from '../../services/experience.service.js';
import { prisma } from '../../db/client.js';
import { NotFoundError } from '../../errors/AppError.js';
import { ExperienceType, SelectionStatus, DifficultyLevel, RoundType, SubmissionStatus } from '@placeprep/shared';

vi.mock('../../db/client.js', () => ({
  prisma: {
    interviewExperience: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    upvote: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    bookmark: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('Experience Service & Repository Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list experiences with pagination and filters', async () => {
    const mockExp = {
      id: 'exp1',
      userId: 'u1',
      companyId: 'c1',
      roleTitle: 'SDE-1',
      expType: ExperienceType.ON_CAMPUS,
      batchYear: 2025,
      placementCycleYear: 2024,
      outcome: SelectionStatus.SELECTED,
      overallDifficulty: DifficultyLevel.MEDIUM,
      totalRounds: 1,
      overview: 'Great process',
      status: SubmissionStatus.APPROVED,
      upvoteCount: 10,
      commentCount: 2,
      viewCount: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      company: { name: 'Google', logoUrl: null },
      user: { fullName: 'Aarav', collegeName: 'Thapar', graduationYear: 2025 },
      rounds: [],
      upvotes: [],
      bookmarks: [],
    };

    (prisma.interviewExperience.findMany as any).mockResolvedValueOnce([mockExp]);
    (prisma.interviewExperience.count as any).mockResolvedValueOnce(1);

    const result = await experienceService.listExperiences({
      page: 1,
      limit: 10,
      sort: 'recent',
    });

    expect(result.experiences).toHaveLength(1);
    expect(result.experiences[0].companyName).toBe('Google');
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('should obfuscate author details when isAnonymous is true', async () => {
    const mockExp = {
      id: 'exp2',
      userId: 'u1',
      companyId: 'c1',
      roleTitle: 'SDE-1',
      expType: ExperienceType.ON_CAMPUS,
      batchYear: 2025,
      placementCycleYear: 2024,
      outcome: SelectionStatus.SELECTED,
      overallDifficulty: DifficultyLevel.HARD,
      totalRounds: 1,
      overview: 'Anonymous review',
      isAnonymous: true,
      status: SubmissionStatus.APPROVED,
      upvoteCount: 5,
      commentCount: 0,
      viewCount: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
      company: { name: 'Amazon', logoUrl: null },
      user: { fullName: 'Secret Student', collegeName: 'Secret College', graduationYear: 2025 },
      rounds: [],
    };

    (prisma.interviewExperience.findUnique as any).mockResolvedValueOnce(mockExp);
    (prisma.interviewExperience.update as any).mockResolvedValueOnce({});

    const result = await experienceService.getExperienceById('exp2');
    expect(result.authorName).toBe('Anonymous Student');
    expect(result.authorCollege).toBe('Verified Campus');
    expect(result.authorGraduationYear).toBeUndefined();
  });

  it('should throw NotFoundError if experience is not found by ID', async () => {
    (prisma.interviewExperience.findUnique as any).mockResolvedValueOnce(null);

    await expect(experienceService.getExperienceById('nonexistent')).rejects.toThrow(NotFoundError);
  });

  it('should toggle upvote: add upvote when not upvoted', async () => {
    (prisma.interviewExperience.findUnique as any).mockResolvedValueOnce({ id: 'exp1' });
    (prisma.upvote.findUnique as any).mockResolvedValueOnce(null);
    (prisma.upvote.create as any).mockResolvedValueOnce({});
    (prisma.interviewExperience.update as any).mockResolvedValueOnce({ upvoteCount: 11 });

    const result = await experienceService.toggleUpvote('u1', 'exp1');
    expect(result.upvoted).toBe(true);
    expect(result.upvoteCount).toBe(11);
  });

  it('should toggle upvote: remove upvote when already upvoted', async () => {
    (prisma.interviewExperience.findUnique as any).mockResolvedValueOnce({ id: 'exp1' });
    (prisma.upvote.findUnique as any).mockResolvedValueOnce({ userId: 'u1', experienceId: 'exp1' });
    (prisma.upvote.delete as any).mockResolvedValueOnce({});
    (prisma.interviewExperience.update as any).mockResolvedValueOnce({ upvoteCount: 10 });

    const result = await experienceService.toggleUpvote('u1', 'exp1');
    expect(result.upvoted).toBe(false);
    expect(result.upvoteCount).toBe(10);
  });

  it('should toggle bookmark: bookmark and unbookmark', async () => {
    // Add bookmark
    (prisma.interviewExperience.findUnique as any).mockResolvedValueOnce({ id: 'exp1' });
    (prisma.bookmark.findUnique as any).mockResolvedValueOnce(null);
    (prisma.bookmark.create as any).mockResolvedValueOnce({});

    const res1 = await experienceService.toggleBookmark('u1', 'exp1');
    expect(res1.bookmarked).toBe(true);

    // Remove bookmark
    (prisma.interviewExperience.findUnique as any).mockResolvedValueOnce({ id: 'exp1' });
    (prisma.bookmark.findUnique as any).mockResolvedValueOnce({ userId: 'u1', experienceId: 'exp1' });
    (prisma.bookmark.delete as any).mockResolvedValueOnce({});

    const res2 = await experienceService.toggleBookmark('u1', 'exp1');
    expect(res2.bookmarked).toBe(false);
  });

  it('should throw NotFoundError on upvote or bookmark if experience does not exist', async () => {
    (prisma.interviewExperience.findUnique as any).mockResolvedValue(null);

    await expect(experienceService.toggleUpvote('u1', 'bad-id')).rejects.toThrow(NotFoundError);
    await expect(experienceService.toggleBookmark('u1', 'bad-id')).rejects.toThrow(NotFoundError);
  });
});
