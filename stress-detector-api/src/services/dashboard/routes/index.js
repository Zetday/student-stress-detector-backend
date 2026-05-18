import { Router } from 'express';
import authenticateToken from '../../../middlewares/auth.js';
import { getDashboard, getStressTrend } from '../controller/dashboard-controller.js';

const router = Router();

// GET /dashboard        — aggregated: latest prediction + summary + insight + recommendation
router.get('/', authenticateToken, getDashboard);

// GET /dashboard/trend  — time-series stress scores for chart (query: ?days=30)
router.get('/trend', authenticateToken, getStressTrend);

export default router;
