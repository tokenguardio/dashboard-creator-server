import { Router } from 'express';
import {
  generateChartData,
  getAllDatabases,
  getAllSchemas,
  getAllTables,
  getTableColumns,
} from './databaseData.controller';

const router: Router = Router();

router.get('/database-data/databases', getAllDatabases);
router.get('/database-data/schemas', getAllSchemas);
router.get('/database-data/tables', getAllTables);
router.get(
  '/database-data/tables/:schemaName/:tableName/columns',
  getTableColumns,
);
router.post(
  '/database-data/generate-chart-data/:schema/:table',
  generateChartData,
);

export default router;
