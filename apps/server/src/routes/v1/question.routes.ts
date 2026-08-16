import { Router } from 'express';
import { questionController } from '../../controllers/question.controller.js';

const router = Router();

router.get('/', questionController.list);
router.get('/categories', questionController.getCategories);

export const questionRoutes = router;
