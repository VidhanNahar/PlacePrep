import { prisma } from '../db/client.js';
import {
  CreateExperienceInput,
  ExperienceQueryParams,
  ExperienceDTO,
  SubmissionStatus,
} from '@placeprep/shared';
import { NotFoundError } from '../errors/AppError.js';

export class ExperienceRepository {
  async findAll(params: ExperienceQueryParams, currentUserId?: string) {
    const {
      query,
      companyId,
      role,
      batchYear,
      outcome,
      difficulty,
      expType,
      topic,
      sort,
      page,
      limit,
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      status: 'APPROVED',
    };

    if (companyId) where.companyId = companyId;
    if (role) where.roleTitle = { contains: role, mode: 'insensitive' };
    if (batchYear) where.batchYear = batchYear;
    if (outcome) where.outcome = outcome;
    if (difficulty) where.overallDifficulty = difficulty;
    if (expType) where.expType = expType;

    if (query) {
      where.OR = [
        { roleTitle: { contains: query, mode: 'insensitive' } },
        { overview: { contains: query, mode: 'insensitive' } },
        { preparationTips: { contains: query, mode: 'insensitive' } },
        { company: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    if (topic) {
      where.rounds = {
        some: {
          questions: {
            some: {
              topicTag: { contains: topic, mode: 'insensitive' },
            },
          },
        },
      };
    }

    // Determine sorting
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'upvotes') orderBy = { upvoteCount: 'desc' };
    if (sort === 'difficulty_asc') orderBy = { overallDifficulty: 'asc' };
    if (sort === 'difficulty_desc') orderBy = { overallDifficulty: 'desc' };

    const [experiences, total] = await Promise.all([
      prisma.interviewExperience.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          company: true,
          user: true,
          rounds: {
            include: {
              questions: {
                include: { category: true },
              },
            },
            orderBy: { roundNumber: 'asc' },
          },
          upvotes: currentUserId ? { where: { userId: currentUserId } } : false,
          bookmarks: currentUserId ? { where: { userId: currentUserId } } : false,
        },
      }),
      prisma.interviewExperience.count({ where }),
    ]);

    return {
      experiences: experiences.map((exp) => this.mapToDTO(exp, currentUserId)),
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, currentUserId?: string) {
    const experience = await prisma.interviewExperience.findUnique({
      where: { id },
      include: {
        company: true,
        user: true,
        rounds: {
          include: {
            questions: {
              include: { category: true },
            },
          },
          orderBy: { roundNumber: 'asc' },
        },
        upvotes: currentUserId ? { where: { userId: currentUserId } } : false,
        bookmarks: currentUserId ? { where: { userId: currentUserId } } : false,
      },
    });

    return experience ? this.mapToDTO(experience, currentUserId) : null;
  }

  async create(userId: string, data: CreateExperienceInput) {
    return prisma.$transaction(async (tx) => {
      const experience = await tx.interviewExperience.create({
        data: {
          userId,
          companyId: data.companyId,
          roleTitle: data.roleTitle,
          expType: data.expType,
          batchYear: data.batchYear,
          placementCycleYear: data.placementCycleYear,
          outcome: data.outcome,
          overallDifficulty: data.overallDifficulty,
          totalRounds: data.totalRounds,
          compensationCtc: data.compensationCtc ? Number(data.compensationCtc) : null,
          location: data.location || null,
          overview: data.overview,
          preparationTips: data.preparationTips || null,
          isAnonymous: data.isAnonymous || false,
          status: 'PENDING_REVIEW',
          rounds: {
            create: data.rounds.map((round) => ({
              roundNumber: round.roundNumber,
              roundName: round.roundName,
              roundType: round.roundType,
              difficulty: round.difficulty,
              durationMinutes: round.durationMinutes || null,
              description: round.description,
              questions: {
                create: (round.questions || []).map((q) => ({
                  categoryId: q.categoryId,
                  questionText: q.questionText,
                  answerApproach: q.answerApproach || null,
                  difficulty: q.difficulty,
                  topicTag: q.topicTag,
                })),
              },
            })),
          },
        },
        include: {
          company: true,
          rounds: {
            include: {
              questions: true,
            },
          },
        },
      });

      return experience;
    });
  }

  async toggleUpvote(userId: string, experienceId: string) {
    return prisma.$transaction(async (tx) => {
      const exp = await tx.interviewExperience.findUnique({
        where: { id: experienceId },
      });
      if (!exp) {
        throw new NotFoundError('Interview experience not found');
      }

      const existing = await tx.upvote.findUnique({
        where: { userId_experienceId: { userId, experienceId } },
      });

      if (existing) {
        await tx.upvote.delete({
          where: { userId_experienceId: { userId, experienceId } },
        });
        const updated = await tx.interviewExperience.update({
          where: { id: experienceId },
          data: { upvoteCount: { decrement: 1 } },
        });
        return { upvoted: false, upvoteCount: updated.upvoteCount };
      } else {
        await tx.upvote.create({
          data: { userId, experienceId },
        });
        const updated = await tx.interviewExperience.update({
          where: { id: experienceId },
          data: { upvoteCount: { increment: 1 } },
        });
        return { upvoted: true, upvoteCount: updated.upvoteCount };
      }
    });
  }

  async toggleBookmark(userId: string, experienceId: string) {
    const exp = await prisma.interviewExperience.findUnique({
      where: { id: experienceId },
    });
    if (!exp) {
      throw new NotFoundError('Interview experience not found');
    }

    const existing = await prisma.bookmark.findUnique({
      where: { userId_experienceId: { userId, experienceId } },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { userId_experienceId: { userId, experienceId } },
      });
      return { bookmarked: false };
    } else {
      await prisma.bookmark.create({
        data: { userId, experienceId },
      });
      return { bookmarked: true };
    }
  }

  async incrementViews(id: string) {
    await prisma.interviewExperience.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  private mapToDTO(exp: any, currentUserId?: string): ExperienceDTO {
    return {
      id: exp.id,
      userId: exp.userId,
      authorName: exp.isAnonymous ? 'Anonymous Student' : exp.user?.fullName,
      authorCollege: exp.isAnonymous ? 'Verified Campus' : exp.user?.collegeName,
      authorGraduationYear: exp.isAnonymous ? undefined : exp.user?.graduationYear,
      isAnonymous: exp.isAnonymous,
      companyId: exp.companyId,
      companyName: exp.company?.name || 'Company',
      companyLogoUrl: exp.company?.logoUrl,
      roleTitle: exp.roleTitle,
      expType: exp.expType,
      batchYear: exp.batchYear,
      placementCycleYear: exp.placementCycleYear,
      outcome: exp.outcome,
      overallDifficulty: exp.overallDifficulty,
      totalRounds: exp.totalRounds,
      compensationCtc: exp.compensationCtc ? Number(exp.compensationCtc) : null,
      location: exp.location,
      overview: exp.overview,
      preparationTips: exp.preparationTips,
      status: exp.status as SubmissionStatus,
      rejectionReason: exp.rejectionReason,
      upvoteCount: exp.upvoteCount ?? 0,
      commentCount: exp.commentCount ?? 0,
      viewCount: exp.viewCount ?? 0,
      isUpvotedByMe: exp.upvotes ? exp.upvotes.length > 0 : false,
      isBookmarkedByMe: exp.bookmarks ? exp.bookmarks.length > 0 : false,
      rounds: exp.rounds
        ? exp.rounds.map((r: any) => ({
            id: r.id,
            experienceId: r.experienceId,
            roundNumber: r.roundNumber,
            roundName: r.roundName,
            roundType: r.roundType,
            difficulty: r.difficulty,
            durationMinutes: r.durationMinutes,
            description: r.description,
            createdAt: r.createdAt.toISOString(),
            questions: (r.questions || []).map((q: any) => ({
              id: q.id,
              roundId: q.roundId,
              categoryId: q.categoryId,
              categoryName: q.category?.name,
              categorySlug: q.category?.slug,
              questionText: q.questionText,
              answerApproach: q.answerApproach,
              difficulty: q.difficulty,
              topicTag: q.topicTag,
              createdAt: q.createdAt.toISOString(),
            })),
          }))
        : undefined,
      createdAt: exp.createdAt.toISOString(),
      updatedAt: exp.updatedAt.toISOString(),
    };
  }
}

export const experienceRepository = new ExperienceRepository();
