import { Router } from 'express';
import {
  saveDapp,
  updateDapp,
  getDapp,
  getAllDapps,
  startDappIndexer,
  getDappUnits,
  getDappAbiEvents,
  getDappAbiCalls,
  getDappDataMetrics,
  stopDappIndexer,
  getIndexerStatus,
} from './dapp-analytics.controller';
import validate from '../../middleware/joiValidate';
import {
  saveDappValidation,
  getDappByIdValidation,
  updateDappValidation,
  runIndexerValidation,
  getDappAbiEventsValidation,
  getDappAbiCallsValidation,
  dappDataMetricsValidation,
  stopIndexerValidation,
  getIndexerStatusValidation,
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

router.post(
  '/dapp-analytics/data/:id/:metric',
  validate(dappDataMetricsValidation),
  getDappDataMetrics,
);

router.post(
  '/dapp-analytics/start-indexer',
  validate(runIndexerValidation),
  startDappIndexer,
);

router.post(
  '/dapp-analytics/stop-indexer',
  validate(stopIndexerValidation),
  stopDappIndexer,
);

router.get(
  '/dapp-analytics/indexer-status/:dAppId',
  validate(getIndexerStatusValidation),
  getIndexerStatus,
);

export default router;
