import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { exportStressReportSchema } from '../validator/schema.js';
import authenticateToken from '../../../middlewares/auth.js';
import {
  exportDailyPrediction,
  exportWeeklySummary,
} from '../controller/exports-controller.js';

const router = Router();

// POST /exports/daily-prediction
router.post('/daily-prediction', authenticateToken, validate(exportStressReportSchema), exportDailyPrediction);

// POST /exports/weekly-summary
router.post('/weekly-summary', authenticateToken, validate(exportStressReportSchema), exportWeeklySummary);

export default router;
