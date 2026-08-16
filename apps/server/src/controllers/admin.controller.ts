import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { SubmissionStatus, ReportStatus, UserRole } from '@placeprep/shared';

export class AdminController {
  async listSubmissions(req: Request, res: Response, next: NextFunction) {
    try {
      const status = (req.query.status as SubmissionStatus) || 'PENDING_REVIEW';
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await adminService.listSubmissions(status, page, limit);
      res.json({
        success: true,
        data: result.submissions,
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

  async reviewSubmission(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, rejectionReason } = req.body;
      const updated = await adminService.reviewSubmission(
        req.params.id,
        req.user!.id,
        status,
        rejectionReason
      );
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const status = (req.query.status as ReportStatus) || 'OPEN';
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await adminService.listReports(status, page, limit);
      res.json({
        success: true,
        data: result.reports,
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

  async resolveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, resolutionNotes, action } = req.body;
      const report = await adminService.resolveReport(
        req.params.id,
        req.user!.id,
        status,
        resolutionNotes,
        action
      );
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  async submitReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await adminService.submitReport(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        data: report,
        message: 'Thank you for reporting. Our moderation team will investigate.',
      });
    } catch (err) {
      next(err);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const result = await adminService.getAuditLogs(page, limit);
      res.json({
        success: true,
        data: result.logs,
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

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await adminService.updateUserRole(req.params.id, req.body.role as UserRole);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
