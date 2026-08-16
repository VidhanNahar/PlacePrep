import { Request, Response, NextFunction } from 'express';
import { experienceService } from '../services/experience.service.js';
import { experienceQuerySchema } from '@placeprep/shared';

export class ExperienceController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedQuery = experienceQuerySchema.parse(req.query);
      const result = await experienceService.listExperiences(parsedQuery, req.user?.id);
      
      res.json({
        success: true,
        data: result.experiences,
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

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const experience = await experienceService.getExperienceById(req.params.id, req.user?.id);
      res.json({ success: true, data: experience });
    } catch (err) {
      next(err);
    }
  }

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const experience = await experienceService.submitExperience(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: experience,
        message: 'Your interview experience has been submitted for review! Thank you for contributing.',
      });
    } catch (err) {
      next(err);
    }
  }

  async toggleUpvote(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await experienceService.toggleUpvote(req.user!.id, req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async toggleBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await experienceService.toggleBookmark(req.user!.id, req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const experienceController = new ExperienceController();
