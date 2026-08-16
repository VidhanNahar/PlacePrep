import { prisma } from '../db/client.js';
import { CreateCommentInput, CommentDTO } from '@placeprep/shared';

export class CommentRepository {
  async findByExperienceId(experienceId: string) {
    const comments = await prisma.comment.findMany({
      where: {
        experienceId,
        parentCommentId: null, // Top-level comments
      },
      include: {
        user: true,
        replies: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return comments.map(this.mapToDTO);
  }

  async create(userId: string, experienceId: string, data: CreateCommentInput) {
    return prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          userId,
          experienceId,
          parentCommentId: data.parentCommentId || null,
          content: data.content,
        },
        include: { user: true },
      });

      await tx.interviewExperience.update({
        where: { id: experienceId },
        data: { commentCount: { increment: 1 } },
      });

      return this.mapToDTO(comment);
    });
  }

  async delete(commentId: string) {
    return prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true, content: '[This comment was deleted]' },
    });
  }

  private mapToDTO(comment: any): CommentDTO {
    return {
      id: comment.id,
      experienceId: comment.experienceId,
      userId: comment.userId,
      userName: comment.user?.fullName || 'Anonymous Student',
      userCollege: comment.user?.collegeName || 'Campus Student',
      parentCommentId: comment.parentCommentId,
      content: comment.content,
      isDeleted: comment.isDeleted,
      replies: comment.replies ? comment.replies.map((r: any) => this.mapToDTO(r)) : undefined,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    };
  }
}

export const commentRepository = new CommentRepository();
