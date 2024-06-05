import { Router } from 'express';
import { getAllBlockchains, getBlockchainBySlug } from './blockchain.controller';
import validate from '../../middleware/joiValidate';
import {
  getAllBlockchainsValidation,
  getBlockchainBySlugValidation,
} from './blockchain.validation';

const router: Router = Router();

router.get(
  '/blockchain/all',
  validate(getAllBlockchainsValidation),
  getAllBlockchains,
);
router.get(
  '/blockchain/:slug',
  validate(getBlockchainBySlugValidation),
  getBlockchainBySlug,
);

export default router;
