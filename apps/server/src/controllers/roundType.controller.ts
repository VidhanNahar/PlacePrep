import { Request, Response, NextFunction } from 'express';
import { roundTypeService } from '../services/roundType.service.js';

export class RoundTypeController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const roundTypes = await roundTypeService.listRoundTypes();
      res.json({ success: true, data: roundTypes });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await roundTypeService.createRoundType(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  }
}

export const roundTypeController = new RoundTypeController();
