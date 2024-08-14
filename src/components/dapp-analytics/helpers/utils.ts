import { IInkAbi, IEvmAbi } from '../abi.interface';
import logger from '@core/utils/logger';

const isSubstrateAbi = (abi: any): boolean => {
  return (
    abi &&
    abi.spec &&
    Array.isArray(abi.spec.events) &&
    Array.isArray(abi.spec.messages)
  );
};

const isEvmAbi = (abi: any): boolean => {
  logger.debug(`isEvmAbi abi: ${JSON.stringify(abi)}`);
  abi.forEach((item) => {
    logger.debug(`isEvmAbi abi item.type: ${JSON.stringify(item.type)}`);
  });
  const isEvmAbi =
    abi &&
    Array.isArray(abi) &&
    abi.every((item) =>
      ['function', 'event', 'constructor', 'fallback', 'receive'].includes(
        item.type,
      ),
    );
  logger.debug(`isEvmAbi isEvmAbi: ${isEvmAbi}`);
  return isEvmAbi;
};

export { isSubstrateAbi, isEvmAbi };
