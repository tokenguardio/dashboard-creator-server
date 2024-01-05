import { Router } from 'express';
import {
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

export default router;
