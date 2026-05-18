import { Router } from 'express';
import authenticateToken from '../../../middlewares/auth.js';
import {
  getRecommendations,
  getLatestRecommendation,
  markRecommendationRead,
} from '../controller/recommendation-controller.js';

const router = Router();

// GET   /recommendations            — paginated list
router.get('/', authenticateToken, getRecommendations);

// GET   /recommendations/latest     — most recent recommendation
router.get('/latest', authenticateToken, getLatestRecommendation);

// PATCH /recommendations/:id/read   — mark as read
router.patch('/:id/read', authenticateToken, markRecommendationRead);

export default router;
