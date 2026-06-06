import { Router } from 'express';
import authenticateToken from '../../../middlewares/auth.js';
import {
  getWeeklySummaries,
  getLatestWeeklySummary,
} from '../controller/summary-controller.js';

const router = Router();

// GET  /weekly-summaries            — paginated list
router.get('/', authenticateToken, getWeeklySummaries);

// GET  /weekly-summaries/latest     — current week's summary
router.get('/latest', authenticateToken, getLatestWeeklySummary);

export default router;
