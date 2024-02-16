import { Router } from 'express';
import validate from 'middleware/joiValidate';
import {
  generateChartData,
  getAllDatabases,
  getAllSchemas,
  getAllTables,
  getTableColumns,
} from './databaseInfo.controller';
import {
  getTableColumnsValidation,
  generateChartDataValidation,
} from './databaseInfo.validation';

const router: Router = Router();

router.get('/database-info/databases', getAllDatabases);
router.get('/database-info/schemas', getAllSchemas);
router.get('/database-info/tables', getAllTables);
router.get(
  '/database-info/tables/:schemaName/:tableName/columns',
  validate(getTableColumnsValidation),
  getTableColumns,
);
router.post(
  '/database-info/generate-chart-data/:schema/:table',
  validate(generateChartDataValidation),
  generateChartData,
);

export default router;
