import { Router } from 'express';
import {
  saveDapp,
  updateDapp,
  getDapp,
  getAllDapps,
  // startDappIndexer,
  getDappUnits,
  getDappAbiEvents,
  getDappAbiCalls,
} from './dapp-analytics.controller';
import validate from '../../middleware/joiValidate';
import {
  saveDappValidation,
  getDappByIdValidation,
  updateDappValidation,
  runIndexerValidation,
  getDappAbiEventsValidation,
  getDappAbiCallsValidation,
} from './dapp-analytics.validation';

const router: Router = Router();

router.post('/dapp-analytics/dapp', validate(saveDappValidation), saveDapp);
router.get('/dapp-analytics/dapp/all', getAllDapps);

router.get(
  '/dapp-analytics/dapp/:id',
  validate(getDappByIdValidation),
  getDapp,
);
router.patch(
  '/dapp-analytics/dapp/:id',
  validate(updateDappValidation),
  updateDapp,
);

router.get('/dapp-analytics/units', getDappUnits);

router.get(
  '/dapp-analytics/dapp/:id/abi/events',
  validate(getDappAbiEventsValidation),
  getDappAbiEvents,
);
router.get(
  '/dapp-analytics/dapp/:id/abi/calls',
  validate(getDappAbiCallsValidation),
  getDappAbiCalls,
);

// router.post('/start-indexer', validate(runIndexerValidation), startDappIndexer);

export default router;
