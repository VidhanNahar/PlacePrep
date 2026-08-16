import { Router } from 'express';
import { commentController } from '../../controllers/comment.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createCommentSchema } from '@placeprep/shared';

const router = Router();

router.get('/experience/:experienceId', commentController.getByExperience);
router.post('/experience/:experienceId', authenticate, validate({ body: createCommentSchema }), commentController.create);
router.delete('/:id', authenticate, commentController.delete);

export const commentRoutes = router;
