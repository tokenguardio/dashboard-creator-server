import { Router } from 'express';
import validate from 'middleware/joiValidate';
import {
  generateChartData,
  getAllDatabases,
  getAllSchemas,
  getAllTables,
  getTableColumns,
} from './databaseData.controller';
import {
  getTableColumnsValidation,
  generateChartDataValidation,
} from './databaseData.validation';

const router: Router = Router();

router.get('/database-data/databases', getAllDatabases);
router.get('/database-data/schemas', getAllSchemas);
router.get('/database-data/tables', getAllTables);
router.get(
  '/database-data/tables/:schemaName/:tableName/columns',
  validate(getTableColumnsValidation),
  getTableColumns,
);
router.post(
  '/database-data/generate-chart-data/:schema/:table',
  validate(generateChartDataValidation),
  generateChartData,
);

export default router;
