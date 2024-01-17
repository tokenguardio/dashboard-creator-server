import { Router } from 'express';
// Import any necessary middlewares and validations
import {
  createDashboard,
  readDashboard,
  getAllDashboards,
  updateDashboard,
  deleteDashboard,
  addDashboardElement,
  deleteDashboardElement,
  updateDashboardElement,
} from './dashboard.controller';
// Import any necessary validations for dashboard and dashboard elements

const router: Router = Router();

// Assuming you have similar middlewares and validations for dashboard
router.post(
  '/dashboard/',
  [
    /* Middleware and Validation */
  ],
  createDashboard,
);
router.get('/dashboard/all', getAllDashboards);
router.get('/dashboard/:id', readDashboard);
router.put(
  '/dashboard/:id',
  [
    /* Middleware and Validation */
  ],
  updateDashboard,
);
router.delete('/dashboard/:id', deleteDashboard);

router.post(
  '/dashboard/:dashboardId/element',
  [
    /* Middleware and Validation */
  ],
  addDashboardElement,
);
router.delete(
  '/dashboard/:dashboardId/element/:elementId',
  deleteDashboardElement,
);
router.put(
  '/dashboard/:dashboardId/element/:elementId',
  [
    /* Middleware and Validation */
  ],
  updateDashboardElement,
);

export default router;
