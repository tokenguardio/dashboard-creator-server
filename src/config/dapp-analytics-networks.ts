const DAPP_ANALYTICS_NETWORKS = {
  'aleph-zero': {
    type: 'substrate',
    rpcEndpoint: 'https://aleph-zero.api.onfinality.io/public',
    ss58Network: 'substrate',
    gatewayUrl: 'https://v2.archive.subsquid.io/network/aleph-zero',
    rpcIngestionDisabled: 'true',
  },
  'arbitrum-one': {
    type: 'evm',
    rpcEndpoint: 'not found yet',
    ss58Network: 'irrelevant',
    gatewayUrl: 'https://v2.archive.subsquid.io/network/arbitrum-one',
    rpcIngestionDisabled: 'true',
  },
  'arbitrum-nova': {
    type: 'evm',
    rpcEndpoint: 'not found yet',
    ss58Network: 'irrelevant',
    gatewayUrl: 'https://v2.archive.subsquid.io/network/arbitrum-nova',
    rpcIngestionDisabled: 'true',
  },
  astar: {
    type: 'substrate',
    rpcEndpoint: 'https://astar.api.onfinality.io/public',
    ss58Network: 'astar',
    gatewayUrl: 'https://v2.archive.subsquid.io/network/astar-substrate',
    rpcIngestionDisabled: 'true',
  },
  avalanche: {
    type: 'evm',
    rpcEndpoint: 'not found yet',
    ss58Network: 'irrelevant',
    gatewayUrl: 'https://v2.archive.subsquid.io/network/avalanche-mainnet',
    rpcIngestionDisabled: 'true',
  },
  moonbeam: {
    type: 'evm',
    rpcEndpoint: 'https://moonbeam.api.onfinality.io/public',
    ss58Network: 'irrelevant',
    gatewayUrl: 'https://v2.archive.subsquid.io/network/moonbeam-mainnet',
    rpcIngestionDisabled: 'true',
  },
  optimism: {
    type: 'evm',
    rpcEndpoint: 'not found yet',
    ss58Network: 'irrelevant',
    gatewayUrl: 'https://v2.archive.subsquid.io/network/optimism-mainnet',
    rpcIngestionDisabled: 'true',
  },
};

export default DAPP_ANALYTICS_NETWORKS;
