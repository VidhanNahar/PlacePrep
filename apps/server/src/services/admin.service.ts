import { adminRepository } from '../repositories/admin.repository.js';
import { SubmissionStatus, ReportStatus, UserRole } from '@placeprep/shared';
import { userRepository } from '../repositories/user.repository.js';

export class AdminService {
  async listSubmissions(status: SubmissionStatus = 'PENDING_REVIEW', page = 1, limit = 20) {
    return adminRepository.getSubmissions(status, page, limit);
  }

  async reviewSubmission(
    id: string,
    reviewerId: string,
    status: SubmissionStatus,
    rejectionReason?: string
  ) {
    return adminRepository.reviewSubmission(id, reviewerId, status, rejectionReason);
  }

  async listReports(status: ReportStatus = 'OPEN', page = 1, limit = 20) {
    return adminRepository.getReports(status, page, limit);
  }

  async resolveReport(
    id: string,
    resolverId: string,
    status: ReportStatus,
    resolutionNotes?: string,
    action?: 'DELETE_CONTENT' | 'DISMISS'
  ) {
    return adminRepository.resolveReport(id, resolverId, status, resolutionNotes, action);
  }

  async submitReport(
    reporterId: string,
    data: { experienceId?: string; commentId?: string; reason: string; details?: string }
  ) {
    return adminRepository.createReport(reporterId, data);
  }

  async getAuditLogs(page = 1, limit = 50) {
    return adminRepository.getAuditLogs(page, limit);
  }

  async updateUserRole(userId: string, role: UserRole) {
    return userRepository.updateRole(userId, role);
  }
}

export const adminService = new AdminService();
