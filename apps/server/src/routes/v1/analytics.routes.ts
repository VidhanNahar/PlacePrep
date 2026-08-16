import { Router } from 'express';
import { analyticsController } from '../../controllers/analytics.controller.js';

const router = Router();

router.get('/overview', analyticsController.getOverview);

export const analyticsRoutes = router;
