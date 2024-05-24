import { Router } from 'express';
import {
  saveDapp,
  updateDapp,
  getDapp,
  getAllDapps,
  // startDappIndexer,
} from './dapp-analytics.controller';
import validate from '../../middleware/joiValidate';
import {
  saveDappValidation,
  getDappByIdValidation,
  updateDappValidation,
  runIndexerValidation,
} from './dapp-analytics.validation';

const router: Router = Router();

router.post('/dapp-analytics/', validate(saveDappValidation), saveDapp);

router.get('/dapp-analytics/:id', validate(getDappByIdValidation), getDapp);

router.get('/dapp-analytics', getAllDapps);

router.patch('/dapp-analytics/:id', validate(updateDappValidation), updateDapp);

// router.post('/start-indexer', validate(runIndexerValidation), startDappIndexer);

export default router;
