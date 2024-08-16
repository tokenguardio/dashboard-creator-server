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
  return (
    abi &&
    Array.isArray(abi) &&
    abi.every((item) =>
      ['function', 'event', 'constructor', 'fallback', 'receive'].includes(
        item.type,
      ),
    )
  );
};

export { isSubstrateAbi, isEvmAbi };
