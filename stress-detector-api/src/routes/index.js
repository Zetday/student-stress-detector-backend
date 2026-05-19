import { Router } from 'express';
import users from '../services/users/routes/index.js';
import authentications from '../services/authentications/routes/index.js';
import profiles from '../services/profiles/routes/index.js';
import activities from '../services/activities/routes/index.js';
import predictions from '../services/predictions/routes/index.js';
import weeklySummaries from '../services/weekly-summaries/routes/index.js';
import insights from '../services/insights/routes/index.js';
import recommendations from '../services/recommendations/routes/index.js';
import dashboard from '../services/dashboard/routes/index.js';
import exportsRouter from '../services/exports/routes/index.js';

const router = Router();

router.use('/users', users);
router.use('/authentications', authentications);
router.use('/profiles', profiles);
router.use('/activities', activities);
router.use('/predictions', predictions);
router.use('/weekly-summaries', weeklySummaries);
router.use('/insights', insights);
router.use('/recommendations', recommendations);
router.use('/dashboard', dashboard);
router.use('/exports', exportsRouter);

export default router;
