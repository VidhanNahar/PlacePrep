import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from '../../services/analytics.service.js';
import { prisma } from '../../db/client.js';
import { cacheService } from '../../services/cache.service.js';

vi.mock('../../db/client.js', () => ({
  prisma: {
    interviewExperience: {
      count: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    company: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    interviewQuestion: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    questionCategory: {
      findMany: vi.fn(),
    },
  },
}));

describe('Analytics Service Test Suite', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await cacheService.flush();
  });

  it('should compute overview metrics accurately', async () => {
    (prisma.interviewExperience.count as any)
      .mockResolvedValueOnce(50) // total experiences
      .mockResolvedValueOnce(35); // selected count

    (prisma.company.count as any).mockResolvedValueOnce(20); // total companies
    (prisma.interviewQuestion.count as any).mockResolvedValueOnce(120); // total questions

    (prisma.interviewExperience.aggregate as any).mockResolvedValueOnce({
      _avg: { compensationCtc: 24.5 },
    });

    (prisma.interviewExperience.groupBy as any).mockResolvedValueOnce([
      { overallDifficulty: 'MEDIUM', _count: { id: 30 } },
      { overallDifficulty: 'HARD', _count: { id: 20 } },
    ]);

    (prisma.company.findMany as any).mockResolvedValueOnce([
      { id: 'c1', name: 'Google', totalExperiencesCount: 15 },
      { id: 'c2', name: 'Amazon', totalExperiencesCount: 12 },
    ]);

    (prisma.interviewQuestion.groupBy as any).mockResolvedValueOnce([
      { topicTag: 'Dynamic Programming', categoryId: 'cat-dsa', _count: { id: 18 } },
    ]);

    (prisma.questionCategory.findMany as any).mockResolvedValueOnce([
      { id: 'cat-dsa', name: 'Data Structures & Algorithms' },
    ]);

    const result = await analyticsService.getOverview();

    expect(result.totalExperiences).toBe(50);
    expect(result.totalCompanies).toBe(20);
    expect(result.totalQuestions).toBe(120);
    expect(result.avgCtcLpa).toBe(24.5);
    expect(result.selectionRatePercent).toBe(70); // 35 / 50 * 100
    expect(result.difficultyDistribution.MEDIUM).toBe(30);
    expect(result.difficultyDistribution.HARD).toBe(20);
    expect(result.topCompanies).toHaveLength(2);
    expect(result.topQuestionTopics[0].topic).toBe('Dynamic Programming');
    expect(result.topQuestionTopics[0].category).toBe('Data Structures & Algorithms');
  });

  it('should serve from cache on subsequent calls', async () => {
    (prisma.interviewExperience.count as any)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5);
    (prisma.company.count as any).mockResolvedValueOnce(5);
    (prisma.interviewQuestion.count as any).mockResolvedValueOnce(20);
    (prisma.interviewExperience.aggregate as any).mockResolvedValueOnce({
      _avg: { compensationCtc: 15 },
    });
    (prisma.interviewExperience.groupBy as any).mockResolvedValueOnce([]);
    (prisma.company.findMany as any).mockResolvedValueOnce([]);
    (prisma.interviewQuestion.groupBy as any).mockResolvedValueOnce([]);
    (prisma.questionCategory.findMany as any).mockResolvedValueOnce([]);

    const res1 = await analyticsService.getOverview();
    expect(res1.totalExperiences).toBe(10);

    // 2nd call should hit cache without calling prisma
    const res2 = await analyticsService.getOverview();
    expect(res2.totalExperiences).toBe(10);
    // Count should have been called only twice from the first call
    expect(prisma.interviewExperience.count).toHaveBeenCalledTimes(2);
  });
});
