import { Router } from 'express';
import { getDashboardStats, getWorkOrderReport } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authenticate, getDashboardStats);
router.get('/reports/work-orders', authenticate, getWorkOrderReport);

export default router;
