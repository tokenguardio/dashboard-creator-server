import { Router } from 'express';

// import protectedByApiKey from '@core/middlewares/apiKey.middleware';
// import validation from '@core/middlewares/validate.middleware';
import {
  createDashboardElementHandler,
  readDashboardElementHandler,
  updateDashboardElementHandler,
  deleteDashboardElementHandler,
} from './dashboard_element.controller';
// import createDashboardElementValidation from './createDashboardElement.validation';

const router: Router = Router();

// Assuming similar structure and middleware use as in User routes
router.post(
  '/dashboardElement/',
  //   [protectedByApiKey, validation(createDashboardElementValidation)],
  createDashboardElementHandler,
);
router.get('/dashboardElement/:id', readDashboardElementHandler);
router.put(
  '/dashboardElement/:id',
  //   [protectedByApiKey, validation(createDashboardElementValidation)],
  updateDashboardElementHandler,
);
router.delete(
  '/dashboardElement/:id',
  //   [protectedByApiKey],
  deleteDashboardElementHandler,
);

export default router;
