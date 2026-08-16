import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { companyRoutes } from './company.routes.js';
import { experienceRoutes } from './experience.routes.js';
import { questionRoutes } from './question.routes.js';
import { commentRoutes } from './comment.routes.js';
import { adminRoutes } from './admin.routes.js';
import { analyticsRoutes } from './analytics.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/experiences', experienceRoutes);
router.use('/questions', questionRoutes);
router.use('/comments', commentRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);

export const v1Router = router;
