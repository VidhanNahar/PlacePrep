import { Request, Response, NextFunction } from 'express';
import { companyService } from '../services/company.service.js';

export class CompanyController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const query = typeof req.query.query === 'string' ? req.query.query : undefined;
      const industry = typeof req.query.industry === 'string' ? req.query.industry : undefined;

      const result = await companyService.listCompanies({ query, industry, page, limit });
      res.json({
        success: true,
        data: result.companies,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNextPage: page < result.totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companyService.getCompanyBySlug(req.params.slug);
      res.json({ success: true, data: company });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companyService.createCompany(req.body);
      res.status(201).json({ success: true, data: company });
    } catch (err) {
      next(err);
    }
  }
}

export const companyController = new CompanyController();
