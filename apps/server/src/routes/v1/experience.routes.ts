import { Router } from 'express';
import { experienceController } from '../../controllers/experience.controller.js';
import { authenticate, optionalAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { submissionRateLimiter } from '../../middleware/rateLimiter.middleware.js';
import { createExperienceSchema } from '@placeprep/shared';

const router = Router();

router.get('/', optionalAuth, experienceController.list);
router.get('/:id', optionalAuth, experienceController.getById);
router.post(
  '/',
  authenticate,
  submissionRateLimiter,
  validate({ body: createExperienceSchema }),
  experienceController.submit
);
router.post('/:id/upvote', authenticate, experienceController.toggleUpvote);
router.post('/:id/bookmark', authenticate, experienceController.toggleBookmark);

export const experienceRoutes = router;
