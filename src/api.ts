import { Router } from 'express';

import healthCheck from '@components/healthcheck/healthCheck.router';
import user from '@components/user/user.router';
import databaseData from '@components/db-api/dashboardData.router';

const router: Router = Router();
router.use(healthCheck);
router.use(user);
router.use(databaseData);

export default router;
