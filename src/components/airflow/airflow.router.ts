import { Router } from 'express';
import { triggerDagRun, checkDagRunStatus } from './airflow.controller';
import validate from '../../middleware/joiValidate';
import {
  triggerDagRunValidation,
  checkDagRunStatusQueryValidation,
} from './airflow.validation';

const router: Router = Router();

router.post(
  '/airflow/trigger-dag',
  validate(triggerDagRunValidation),
  triggerDagRun,
);

router.get(
  '/airflow/check-dag-status/:dagId',
  validate(checkDagRunStatusQueryValidation),
  checkDagRunStatus,
);

export default router;
