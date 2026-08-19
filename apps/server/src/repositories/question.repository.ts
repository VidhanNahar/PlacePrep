import { prisma } from '../db/client.js';
import { QuestionQueryParams, QuestionDTO } from '@placeprep/shared';

export class QuestionRepository {
  async findAll(params: QuestionQueryParams) {
    const { query, categoryId, topic, difficulty, companyId, companyName, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      round: {
        experience: {
          status: 'APPROVED',
        },
      },
    };

    if (categoryId) where.categoryId = categoryId;
    if (topic) where.topicTag = { contains: topic, mode: 'insensitive' };
    if (difficulty) where.difficulty = difficulty;
    if (companyId) {
      where.round.experience.companyId = companyId;
    }
    if (companyName) {
      where.round = {
        ...where.round,
        experience: {
          ...where.round?.experience,
          company: {
            name: { contains: companyName, mode: 'insensitive' },
          },
        },
      };
    }

    if (query) {
      where.OR = [
        { questionText: { contains: query, mode: 'insensitive' } },
        { answerApproach: { contains: query, mode: 'insensitive' } },
        { topicTag: { contains: query, mode: 'insensitive' } },
        {
          round: {
            experience: {
              company: { name: { contains: query, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    const [questions, total] = await Promise.all([
      prisma.interviewQuestion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          round: {
            include: {
              experience: {
                include: { company: true },
              },
            },
          },
        },
      }),
      prisma.interviewQuestion.count({ where }),
    ]);

    return {
      questions: questions.map(this.mapToDTO),
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCategories() {
    const categories = await prisma.questionCategory.findMany({
      include: {
        _count: {
          select: {
            questions: {
              where: {
                round: {
                  experience: { status: 'APPROVED' },
                },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      totalQuestions: cat._count.questions,
    }));
  }

  private mapToDTO(q: any): QuestionDTO {
    return {
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
      companyName: q.round?.experience?.company?.name,
      roleTitle: q.round?.experience?.roleTitle,
    };
  }
}

export const questionRepository = new QuestionRepository();
