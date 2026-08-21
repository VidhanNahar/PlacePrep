import { Router } from 'express';
import { roundTypeController } from '../../controllers/roundType.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createRoundTypeSchema } from '@placeprep/shared';

const router = Router();

router.get('/', roundTypeController.list);
router.post('/', authenticate, validate({ body: createRoundTypeSchema }), roundTypeController.create);

export const roundTypeRoutes = router;
