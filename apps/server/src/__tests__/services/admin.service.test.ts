import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '../../services/admin.service.js';
import { prisma } from '../../db/client.js';
import { SubmissionStatus, ReportStatus, UserRole } from '@placeprep/shared';
import { NotFoundError } from '../../errors/AppError.js';

vi.mock('../../db/client.js', () => ({
  prisma: {
    interviewExperience: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    company: {
      update: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    report: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    comment: {
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('Admin Service & Repository Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list pending submissions for review', async () => {
    (prisma.interviewExperience.findMany as any).mockResolvedValueOnce([
      { id: 'exp-1', status: 'PENDING_REVIEW', createdAt: new Date() },
    ]);
    (prisma.interviewExperience.count as any).mockResolvedValueOnce(1);

    const result = await adminService.listSubmissions('PENDING_REVIEW', 1, 20);
    expect(result.submissions).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should approve submission and increment company totalExperiencesCount', async () => {
    (prisma.interviewExperience.findUnique as any).mockResolvedValueOnce({
      id: 'exp-1',
      status: 'PENDING_REVIEW',
      companyId: 'comp-1',
    });
    (prisma.interviewExperience.update as any).mockResolvedValueOnce({
      id: 'exp-1',
      status: 'APPROVED',
      companyId: 'comp-1',
      company: { name: 'Google' },
    });
    (prisma.company.update as any).mockResolvedValueOnce({});
    (prisma.auditLog.create as any).mockResolvedValueOnce({});

    const result = await adminService.reviewSubmission('exp-1', 'admin-id', 'APPROVED');

    expect(result.status).toBe('APPROVED');
    expect(prisma.company.update).toHaveBeenCalledWith({
      where: { id: 'comp-1' },
      data: { totalExperiencesCount: { increment: 1 } },
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: 'admin-id',
        action: 'APPROVE_EXPERIENCE',
      }),
    });
  });

  it('should reject submission with reason and log audit action', async () => {
    (prisma.interviewExperience.findUnique as any).mockResolvedValueOnce({
      id: 'exp-1',
      status: 'PENDING_REVIEW',
      companyId: 'comp-1',
    });
    (prisma.interviewExperience.update as any).mockResolvedValueOnce({
      id: 'exp-1',
      status: 'REJECTED',
      rejectionReason: 'Needs more detail',
    });
    (prisma.auditLog.create as any).mockResolvedValueOnce({});

    const result = await adminService.reviewSubmission(
      'exp-1',
      'admin-id',
      'REJECTED',
      'Needs more detail'
    );

    expect(result.status).toBe('REJECTED');
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'REJECT_EXPERIENCE',
        metadata: { rejectionReason: 'Needs more detail' },
      }),
    });
  });

  it('should resolve report with DELETE_CONTENT action on comment', async () => {
    (prisma.report.findUnique as any).mockResolvedValueOnce({
      id: 'rep-1',
      commentId: 'com-1',
      experienceId: null,
    });
    (prisma.report.update as any).mockResolvedValueOnce({
      id: 'rep-1',
      status: 'RESOLVED',
      commentId: 'com-1',
    });
    (prisma.comment.update as any).mockResolvedValueOnce({});
    (prisma.auditLog.create as any).mockResolvedValueOnce({});

    await adminService.resolveReport(
      'rep-1',
      'admin-id',
      'RESOLVED',
      'Abusive comment removed',
      'DELETE_CONTENT'
    );

    expect(prisma.comment.update).toHaveBeenCalledWith({
      where: { id: 'com-1' },
      data: { isDeleted: true, content: '[This comment was removed by a moderator]' },
    });
  });

  it('should update user role (e.g. promote to MODERATOR)', async () => {
    (prisma.user.update as any).mockResolvedValueOnce({
      id: 'u-1',
      authId: 'a-1',
      email: 'student@thapar.edu',
      fullName: 'Aarav',
      collegeName: 'Thapar',
      graduationYear: 2025,
      branch: 'CSE',
      role: 'MODERATOR',
      isVerified: true,
      createdAt: new Date(),
    });

    const user = await adminService.updateUserRole('u-1', UserRole.MODERATOR);
    expect(user.role).toBe(UserRole.MODERATOR);
  });
});
