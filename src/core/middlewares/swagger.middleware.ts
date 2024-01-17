import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import swaggerUi from 'swagger-ui-express';
import deepmerge from 'deepmerge';
//
// You might need to install this package

import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import consts from '@config/consts';
import swaggerDocument1 from '../../swagger/swagger.json';
import swaggerDocument2 from '../../swagger/dashboard-swagger.json';

const swaggerForbidden = () => {
  logger.error('Trying to access swagger docs on production');
  throw new AppError(
    httpStatus.FORBIDDEN,
    'API docs are not available on production',
  );
};

const mergeSwaggerDocuments = () => {
  // Merge the two Swagger documents into one
  return deepmerge(swaggerDocument1, swaggerDocument2);
};

const swaggerBasePath = (req: Request, res: Response, next: NextFunction) => {
  const basePath: string = req.originalUrl.replace(consts.API_DOCS_PATH, '');
  const mergedSwaggerDocument = mergeSwaggerDocuments();
  mergedSwaggerDocument.basePath = basePath;
  swaggerUi.setup(mergedSwaggerDocument)(req, res, () => {
    next();
  });
};

export { swaggerBasePath, swaggerForbidden };
