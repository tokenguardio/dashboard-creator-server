import logger from '@core/utils/logger';

import AppError from './appError';
import { ApiError } from './../../middleware/joiValidate';

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["handleError", "isTrustedError"] }] */
class ErrorHandler {
  public handleError(error: Error): void {
    logger.error(error);
  }

  public isTrustedError(error: Error): boolean {
    if (error instanceof AppError || error instanceof ApiError) {
      return error.isOperational;
    }
    return false;
  }
}

export default new ErrorHandler();
