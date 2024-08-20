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
      [
        'function',
        'event',
        'constructor',
        'fallback',
        'receive',
        'error',
      ].includes(item.type),
    )
  );
};

export { isSubstrateAbi, isEvmAbi };
