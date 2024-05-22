import { Router } from 'express';

import healthCheck from '@components/healthcheck/healthCheck.router';
import user from '@components/user/user.router';
import dashboard from '@components/dashboard/dashboard.router';
import databaseInfo from '@components/db-api/databaseInfo.router';
import dappAnalytics from '@components/dapp-analytics/dapp-analytics.router';

const router: Router = Router();
router.use(healthCheck);
router.use(user);
router.use(databaseInfo);
router.use(dashboard);
router.use(dappAnalytics);

export default router;
