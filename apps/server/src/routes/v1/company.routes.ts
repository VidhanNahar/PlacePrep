import { Router } from 'express';
import { companyController } from '../../controllers/company.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createCompanySchema } from '@placeprep/shared';

const router = Router();

router.get('/', companyController.list);
router.get('/:slug', companyController.getBySlug);
router.post('/', authenticate, validate({ body: createCompanySchema }), companyController.create);

export const companyRoutes = router;
