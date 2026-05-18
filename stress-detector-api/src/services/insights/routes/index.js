import { Router } from 'express';
import authenticateToken from '../../../middlewares/auth.js';
import { getInsights, getLatestInsight } from '../controller/insight-controller.js';

const router = Router();

// GET /insights         — paginated insight history
router.get('/', authenticateToken, getInsights);

// GET /insights/latest  — most recent insight
router.get('/latest', authenticateToken, getLatestInsight);

export default router;
