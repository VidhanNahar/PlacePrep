import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service.js';

export class CommentController {
  async getByExperience(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await commentService.getCommentsByExperience(req.params.experienceId);
      res.json({ success: true, data: comments });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.addComment(
        req.user!.id,
        req.params.experienceId,
        req.body
      );
      res.status(201).json({ success: true, data: comment });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await commentService.deleteComment(req.params.id, req.user!.id, req.user!.role);
      res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const commentController = new CommentController();
