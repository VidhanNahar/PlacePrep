import { describe, it, expect, vi, beforeEach } from 'vitest';
import { questionService } from '../../services/question.service.js';
import { prisma } from '../../db/client.js';
import { DifficultyLevel } from '@placeprep/shared';

vi.mock('../../db/client.js', () => ({
  prisma: {
    interviewQuestion: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    questionCategory: {
      findMany: vi.fn(),
    },
  },
}));

describe('Question Service & Repository Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list questions with category and topicTag filters', async () => {
    const mockQuestions = [
      {
        id: 'q1',
        roundId: 'r1',
        categoryId: 'cat-dsa',
        questionText: 'Two Sum Problem',
        answerApproach: 'Use Hash Map for O(n)',
        difficulty: DifficultyLevel.EASY,
        topicTag: 'Hash Maps',
        createdAt: new Date(),
        category: { name: 'DSA', slug: 'dsa' },
        round: {
          experience: {
            roleTitle: 'Software Engineer',
            company: { name: 'Google' },
          },
        },
      },
    ];

    (prisma.interviewQuestion.findMany as any).mockResolvedValueOnce(mockQuestions);
    (prisma.interviewQuestion.count as any).mockResolvedValueOnce(1);

    const result = await questionService.listQuestions({
      page: 1,
      limit: 20,
      topic: 'Hash Maps',
    });

    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].questionText).toBe('Two Sum Problem');
    expect(result.questions[0].companyName).toBe('Google');
    expect(result.total).toBe(1);
  });

  it('should get categories with aggregated question counts', async () => {
    const mockCategories = [
      {
        id: 'cat-1',
        name: 'Data Structures & Algorithms',
        slug: 'dsa',
        description: 'Trees, Graphs, DP',
        _count: { questions: 25 },
      },
      {
        id: 'cat-2',
        name: 'System Design',
        slug: 'system-design',
        description: 'Scalability & Architecture',
        _count: { questions: 12 },
      },
    ];

    (prisma.questionCategory.findMany as any).mockResolvedValueOnce(mockCategories);

    const categories = await questionService.getCategories();
    expect(categories).toHaveLength(2);
    expect(categories[0].slug).toBe('dsa');
    expect(categories[0].totalQuestions).toBe(25);
  });
});
