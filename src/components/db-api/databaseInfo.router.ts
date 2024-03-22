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
router.get('/database-info/:dbname/schemas', getAllSchemas);
router.get('/database-info/:dbname/tables', getAllTables);
router.get(
  '/database-info/:dbname/tables/:schema/:table/columns',
  validate(getTableColumnsValidation),
  getTableColumns,
);
router.post(
  '/database-info/generate-chart-data/:dbname/:schema/:table',
  validate(generateChartDataValidation),
  generateChartData,
);

export default router;
