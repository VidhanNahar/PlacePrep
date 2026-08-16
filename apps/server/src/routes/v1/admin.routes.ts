import { Router } from 'express';
import { adminController } from '../../controllers/admin.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { reviewSubmissionSchema, reportContentSchema } from '@placeprep/shared';

const router = Router();

// Public / Authenticated reporting
router.post('/reports', authenticate, validate({ body: reportContentSchema }), adminController.submitReport);

// Moderator & Admin Endpoints
router.get('/submissions', authenticate, requireRole(['MODERATOR', 'ADMIN']), adminController.listSubmissions);
router.patch('/submissions/:id/review', authenticate, requireRole(['MODERATOR', 'ADMIN']), validate({ body: reviewSubmissionSchema }), adminController.reviewSubmission);

router.get('/reports', authenticate, requireRole(['MODERATOR', 'ADMIN']), adminController.listReports);
router.patch('/reports/:id/resolve', authenticate, requireRole(['MODERATOR', 'ADMIN']), adminController.resolveReport);

// Super Admin Only
router.get('/audit-logs', authenticate, requireRole(['ADMIN']), adminController.getAuditLogs);
router.patch('/users/:id/role', authenticate, requireRole(['ADMIN']), adminController.updateUserRole);

export const adminRoutes = router;
