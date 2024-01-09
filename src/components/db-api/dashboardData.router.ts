import { Router } from 'express';
import {
  generateChartData,
  getAllDatabases,
  getAllSchemas,
  getAllTables,
  getTableColumns,
} from './databaseData.controller';

const router: Router = Router();

router.get('/databases', getAllDatabases);
router.get('/schemas', getAllSchemas);
router.get('/tables', getAllTables);
router.get('/tables/:schemaName/:tableName/columns', getTableColumns);
router.post('/generate-chart-data', generateChartData);

export default router;
