import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commentService } from '../../services/comment.service.js';
import { prisma } from '../../db/client.js';
import { NotFoundError, ForbiddenError } from '../../errors/AppError.js';
import { UserRole } from '@placeprep/shared';

vi.mock('../../db/client.js', () => ({
  prisma: {
    comment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    interviewExperience: {
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('Comment Service & Repository Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get top-level comments and nested replies by experienceId', async () => {
    const mockComments = [
      {
        id: 'cm1',
        experienceId: 'exp1',
        userId: 'u1',
        parentCommentId: null,
        content: 'Top comment',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { fullName: 'Aarav', collegeName: 'Thapar' },
        replies: [
          {
            id: 'cm2',
            experienceId: 'exp1',
            userId: 'u2',
            parentCommentId: 'cm1',
            content: 'Reply comment',
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: { fullName: 'Priya', collegeName: 'IITB' },
          },
        ],
      },
    ];

    (prisma.comment.findMany as any).mockResolvedValueOnce(mockComments);

    const comments = await commentService.getCommentsByExperience('exp1');
    expect(comments).toHaveLength(1);
    expect(comments[0].content).toBe('Top comment');
    expect(comments[0].replies).toHaveLength(1);
    expect(comments[0].replies![0].userName).toBe('Priya');
  });

  it('should add comment and increment commentCount in transaction', async () => {
    const mockComment = {
      id: 'cm3',
      experienceId: 'exp1',
      userId: 'u1',
      content: 'Great tips!',
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: { fullName: 'Aarav', collegeName: 'Thapar' },
    };

    (prisma.comment.create as any).mockResolvedValueOnce(mockComment);
    (prisma.interviewExperience.update as any).mockResolvedValueOnce({});

    const result = await commentService.addComment('u1', 'exp1', {
      content: 'Great tips!',
    });

    expect(result.id).toBe('cm3');
    expect(prisma.comment.create).toHaveBeenCalled();
    expect(prisma.interviewExperience.update).toHaveBeenCalledWith({
      where: { id: 'exp1' },
      data: { commentCount: { increment: 1 } },
    });
  });

  it('should allow author to delete comment', async () => {
    (prisma.comment.findUnique as any).mockResolvedValueOnce({
      id: 'cm1',
      userId: 'author-id',
      content: 'My comment',
      isDeleted: false,
    });
    (prisma.comment.update as any).mockResolvedValueOnce({
      id: 'cm1',
      isDeleted: true,
      content: '[This comment was deleted]',
    });

    await expect(
      commentService.deleteComment('cm1', 'author-id', UserRole.STUDENT)
    ).resolves.not.toThrow();

    expect(prisma.comment.update).toHaveBeenCalledWith({
      where: { id: 'cm1' },
      data: { isDeleted: true, content: '[This comment was deleted]' },
    });
  });

  it('should allow MODERATOR or ADMIN to delete any comment', async () => {
    (prisma.comment.findUnique as any).mockResolvedValueOnce({
      id: 'cm1',
      userId: 'other-student',
      content: 'Inappropriate content',
      isDeleted: false,
    });
    (prisma.comment.update as any).mockResolvedValueOnce({
      id: 'cm1',
      isDeleted: true,
      content: '[This comment was deleted]',
    });

    await expect(
      commentService.deleteComment('cm1', 'moderator-id', UserRole.MODERATOR)
    ).resolves.not.toThrow();
  });

  it('should throw ForbiddenError if another student tries to delete comment', async () => {
    (prisma.comment.findUnique as any).mockResolvedValueOnce({
      id: 'cm1',
      userId: 'author-id',
      content: 'Original comment',
      isDeleted: false,
    });

    await expect(
      commentService.deleteComment('cm1', 'attacker-student-id', UserRole.STUDENT)
    ).rejects.toThrow(ForbiddenError);
  });

  it('should throw NotFoundError if comment to delete does not exist', async () => {
    (prisma.comment.findUnique as any).mockResolvedValueOnce(null);

    await expect(
      commentService.deleteComment('nonexistent', 'user-id', UserRole.ADMIN)
    ).rejects.toThrow(NotFoundError);
  });
});
