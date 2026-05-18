import { Router } from 'express';
import authenticateToken from '../../../middlewares/auth.js';
import { getPredictions, getLatestPrediction } from '../controller/prediction-controller.js';

const router = Router();

// GET /predictions          — paginated prediction history
router.get('/', authenticateToken, getPredictions);

// GET /predictions/latest   — most recent prediction
router.get('/latest', authenticateToken, getLatestPrediction);

export default router;
