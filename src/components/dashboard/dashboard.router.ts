import { Router } from 'express';
// Import any necessary middlewares and validations
import {
  createDashboard,
  readDashboard,
  getAllDashboards,
  updateDashboard,
  deleteDashboard,
  addDashboardElement,
  getDashboardElement,
  deleteDashboardElement,
  updateDashboardElement,
  getDashboardElementData,
  addDashboardFilter,
  getDashboardFilter,
  getDashboardFilterByName,
  deleteDashboardFilter,
  updateDashboardFilter,
  getDashboardFilterData,
  getDashboardElementByQueryId,
  addDashboardLayoutItem,
  getDashboardLayoutItems,
  updateDashboardLayoutItem,
  deleteDashboardLayoutItem,
} from './dashboard.controller';
// Import any necessary validations for dashboard and dashboard elements

const router: Router = Router();

router.post('/dashboard/', createDashboard);
router.get('/dashboard/all', getAllDashboards);
router.get('/dashboard/:id', readDashboard);
router.put('/dashboard/:id', updateDashboard);
router.delete('/dashboard/:id', deleteDashboard);

// Dashboard elements
router.post('/dashboard/:dashboardId/element', addDashboardElement);
router.get('/dashboard/:dashboardId/element/:elementId', getDashboardElement);
router.delete(
  '/dashboard/:dashboardId/element/:elementId',
  deleteDashboardElement,
);
router.put(
  '/dashboard/:dashboardId/element/:elementId',
  updateDashboardElement,
);
router.post(
  '/dashboard/:dashboardId/element/:elementId/exec',
  getDashboardElementData,
);
router.get(
  '/dashboard/:dashboardId/element/query/:queryId',
  getDashboardElementByQueryId,
);

// Filters
router.post('/dashboard/:dashboardId/filter', addDashboardFilter);
router.get('/dashboard/:dashboardId/filter/:filterId', getDashboardFilter);
router.get(
  '/dashboard/:dashboardId/filterByName/:filterName',
  getDashboardFilterByName,
);
router.delete(
  '/dashboard/:dashboardId/filter/:filterId',
  deleteDashboardFilter,
);
router.put('/dashboard/:dashboardId/filter/:filterId', updateDashboardFilter);

router.post(
  '/dashboard/:dashboardId/filter/:filterId/exec',
  getDashboardFilterData,
);

// Layouts
router.post('/dashboard/:dashboardId/layout', addDashboardLayoutItem);
router.get('/dashboard/:dashboardId/layout', getDashboardLayoutItems);
router.put(
  '/dashboard/:dashboardId/layout/:layoutItemId',
  updateDashboardLayoutItem,
);
router.delete(
  '/dashboard/:dashboardId/layout/:layoutItemId',
  deleteDashboardLayoutItem,
);

export default router;
