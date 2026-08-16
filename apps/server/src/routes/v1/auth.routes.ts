import { Router } from 'express';
import { authController } from '../../controllers/auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { syncProfileSchema, updateProfileSchema } from '@placeprep/shared';

const router = Router();

router.get('/me', authenticate, authController.getMe);
router.post('/sync-profile', authenticate, validate({ body: syncProfileSchema }), authController.syncProfile);
router.patch('/me', authenticate, validate({ body: updateProfileSchema }), authController.updateProfile);

export const authRoutes = router;
