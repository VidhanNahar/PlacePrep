import { prisma } from '../db/client.js';
import { cacheService } from './cache.service.js';
import { DifficultyLevel, PlatformAnalyticsDTO } from '@placeprep/shared';

export class AnalyticsService {
  async getOverview(): Promise<PlatformAnalyticsDTO> {
    const cacheKey = 'analytics:overview';
    const cached = await cacheService.get<PlatformAnalyticsDTO>(cacheKey);
    if (cached) return cached;

    const [
      totalExperiences,
      totalCompanies,
      totalQuestions,
      avgCtcResult,
      selectedCount,
      difficultyGroups,
      topCompaniesRaw,
      topTopicsRaw,
    ] = await Promise.all([
      prisma.interviewExperience.count({ where: { status: 'APPROVED' } }),
      prisma.company.count(),
      prisma.interviewQuestion.count({
        where: { round: { experience: { status: 'APPROVED' } } },
      }),
      prisma.interviewExperience.aggregate({
        where: { status: 'APPROVED', compensationCtc: { not: null } },
        _avg: { compensationCtc: true },
      }),
      prisma.interviewExperience.count({
        where: { status: 'APPROVED', outcome: 'SELECTED' },
      }),
      prisma.interviewExperience.groupBy({
        by: ['overallDifficulty'],
        where: { status: 'APPROVED' },
        _count: { id: true },
      }),
      prisma.company.findMany({
        take: 8,
        orderBy: { totalExperiencesCount: 'desc' },
        select: { id: true, name: true, totalExperiencesCount: true },
      }),
      prisma.interviewQuestion.groupBy({
        by: ['topicTag', 'categoryId'],
        where: { round: { experience: { status: 'APPROVED' } } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    const categories = await prisma.questionCategory.findMany();
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const difficultyDistribution: Record<DifficultyLevel, number> = {
      EASY: 0,
      MEDIUM: 0,
      HARD: 0,
      VERY_HARD: 0,
    };

    difficultyGroups.forEach((g) => {
      difficultyDistribution[g.overallDifficulty as DifficultyLevel] = g._count.id;
    });

    const result: PlatformAnalyticsDTO = {
      totalExperiences,
      totalCompanies,
      totalQuestions,
      avgCtcLpa: avgCtcResult._avg.compensationCtc
        ? Number(avgCtcResult._avg.compensationCtc)
        : 0,
      selectionRatePercent:
        totalExperiences > 0 ? Math.round((selectedCount / totalExperiences) * 100) : 0,
      topCompanies: topCompaniesRaw.map((c) => ({
        companyId: c.id,
        name: c.name,
        count: c.totalExperiencesCount,
      })),
      difficultyDistribution,
      topQuestionTopics: topTopicsRaw.map((t) => ({
        topic: t.topicTag,
        count: t._count.id,
        category: categoryMap.get(t.categoryId) || 'General',
      })),
    };

    await cacheService.set(cacheKey, result, 1000 * 60 * 15); // 15 min cache
    return result;
  }
}

export const analyticsService = new AnalyticsService();
