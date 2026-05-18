import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { createActivitySchema } from '../validator/schema.js';
import authenticateToken from '../../../middlewares/auth.js';
import {
  createActivity,
  getActivities,
  getActivityById,
  deleteActivity,
} from '../controller/activity-controller.js';

const router = Router();

// POST   /activities        — Submit daily activity (triggers ML prediction)
router.post('/', authenticateToken, validate(createActivitySchema), createActivity);

// GET    /activities        — List own activities (paginated via ?limit=&offset=)
router.get('/', authenticateToken, getActivities);

// GET    /activities/:id    — Get single activity detail
router.get('/:id', authenticateToken, getActivityById);

// DELETE /activities/:id    — Delete own activity
router.delete('/:id', authenticateToken, deleteActivity);

export default router;