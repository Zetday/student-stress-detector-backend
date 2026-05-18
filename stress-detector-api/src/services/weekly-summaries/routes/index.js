import { Router } from 'express';
import authenticateToken from '../../../middlewares/auth.js';
import {
  getWeeklySummaries,
  getLatestWeeklySummary,
  generateWeeklySummary,
} from '../controller/weekly-summary-controller.js';

const router = Router();

// GET  /weekly-summaries            — paginated list
router.get('/', authenticateToken, getWeeklySummaries);

// GET  /weekly-summaries/latest     — current week's summary
router.get('/latest', authenticateToken, getLatestWeeklySummary);

// POST /weekly-summaries/generate   — aggregate this week + call ML for insight
router.post('/generate', authenticateToken, generateWeeklySummary);

export default router;
