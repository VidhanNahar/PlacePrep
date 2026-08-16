import { Request, Response, NextFunction } from 'express';
import { questionService } from '../services/question.service.js';
import { questionQuerySchema } from '@placeprep/shared';

export class QuestionController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedQuery = questionQuerySchema.parse(req.query);
      const result = await questionService.listQuestions(parsedQuery);
      res.json({
        success: true,
        data: result.questions,
        pagination: {
          page: parsedQuery.page,
          limit: parsedQuery.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNextPage: parsedQuery.page < result.totalPages,
          hasPrevPage: parsedQuery.page > 1,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await questionService.getCategories();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }
}

export const questionController = new QuestionController();
