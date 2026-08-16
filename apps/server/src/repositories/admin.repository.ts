import { prisma } from '../db/client.js';
import { SubmissionStatus, ReportStatus } from '@placeprep/shared';

export class AdminRepository {
  async getSubmissions(status: SubmissionStatus, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { status };

    const [submissions, total] = await Promise.all([
      prisma.interviewExperience.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
          user: true,
          rounds: {
            include: {
              questions: { include: { category: true } },
            },
            orderBy: { roundNumber: 'asc' },
          },
        },
      }),
      prisma.interviewExperience.count({ where }),
    ]);

    return {
      submissions,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async reviewSubmission(
    id: string,
    reviewerId: string,
    status: SubmissionStatus,
    rejectionReason?: string
  ) {
    return prisma.$transaction(async (tx) => {
      const exp = await tx.interviewExperience.update({
        where: { id },
        data: {
          status,
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        },
        include: { company: true },
      });

      // If approved, increment company's total experiences count
      if (status === 'APPROVED') {
        await tx.company.update({
          where: { id: exp.companyId },
          data: { totalExperiencesCount: { increment: 1 } },
        });
      }

      // Log moderation audit
      await tx.auditLog.create({
        data: {
          actorId: reviewerId,
          action: status === 'APPROVED' ? 'APPROVE_EXPERIENCE' : 'REJECT_EXPERIENCE',
          targetEntity: 'interview_experiences',
          targetId: id,
          metadata: { rejectionReason },
        },
      });

      return exp;
    });
  }

  async getReports(status: ReportStatus, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where = { status };

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: true,
          experience: { include: { company: true } },
          comment: true,
        },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      reports,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async resolveReport(
    id: string,
    resolverId: string,
    status: ReportStatus,
    resolutionNotes?: string,
    action?: 'DELETE_CONTENT' | 'DISMISS'
  ) {
    return prisma.$transaction(async (tx) => {
      const report = await tx.report.update({
        where: { id },
        data: {
          status,
          resolvedById: resolverId,
          resolutionNotes,
          resolvedAt: new Date(),
        },
      });

      if (action === 'DELETE_CONTENT') {
        if (report.commentId) {
          await tx.comment.update({
            where: { id: report.commentId },
            data: { isDeleted: true, content: '[This comment was removed by a moderator]' },
          });
        } else if (report.experienceId) {
          await tx.interviewExperience.update({
            where: { id: report.experienceId },
            data: { status: 'ARCHIVED' },
          });
        }
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          actorId: resolverId,
          action: 'RESOLVE_REPORT',
          targetEntity: 'reports',
          targetId: id,
          metadata: { action, resolutionNotes },
        },
      });

      return report;
    });
  }

  async createReport(
    reporterId: string,
    data: { experienceId?: string; commentId?: string; reason: string; details?: string }
  ) {
    return prisma.report.create({
      data: {
        reporterId,
        experienceId: data.experienceId || null,
        commentId: data.commentId || null,
        reason: data.reason,
        details: data.details || null,
      },
    });
  }

  async getAuditLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { actor: true },
      }),
      prisma.auditLog.count(),
    ]);

    return {
      logs,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

export const adminRepository = new AdminRepository();
