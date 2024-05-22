import { Router } from 'express';
import {
  saveDapp,
  updateDapp,
  getDapp,
  getAllDapps,
} from './dapp-analytics.controller';
import validate from '../../middleware/joiValidate';
import {
  saveDappValidation,
  getDappByIdValidation,
  updateDappValidation,
} from './dapp-analytics.validation';

const router: Router = Router();

router.post('/dapp-analytics/', validate(saveDappValidation), saveDapp);

router.get('/dapp-analytics/:id', validate(getDappByIdValidation), getDapp);

router.get('/dapp-analytics', getAllDapps);

router.patch('/dapp-analytics/:id', validate(updateDappValidation), updateDapp);

export default router;
