import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service.js';

export class AnalyticsController {
  async getOverview(_req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await analyticsService.getOverview();
      res.json({ success: true, data: overview });
    } catch (err) {
      next(err);
    }
  }
}

export const analyticsController = new AnalyticsController();
