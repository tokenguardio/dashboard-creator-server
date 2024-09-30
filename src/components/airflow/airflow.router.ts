import { Router } from 'express';
import { triggerDagRun } from './airflow.controller';
import validate from '../../middleware/joiValidate';
import { triggerDagRunValidation } from './airflow.validation';

const router: Router = Router();

router.post(
  '/airflow/trigger-dag',
  validate(triggerDagRunValidation),
  triggerDagRun,
);

export default router;
