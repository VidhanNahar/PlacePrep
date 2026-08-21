import { commentRepository } from '../repositories/comment.repository.js';
import { CreateCommentInput, UserRole } from '@placeprep/shared';

export class CommentService {
  async getCommentsByExperience(experienceId: string) {
    return commentRepository.findByExperienceId(experienceId);
  }

  async addComment(userId: string, experienceId: string, data: CreateCommentInput) {
    return commentRepository.create(userId, experienceId, data);
  }

  async deleteComment(commentId: string, userId: string, userRole: UserRole) {
    return commentRepository.delete(commentId, userId, userRole);
  }
}

export const commentService = new CommentService();
