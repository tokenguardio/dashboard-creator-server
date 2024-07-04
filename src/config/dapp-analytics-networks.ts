const DAPP_ANALYTICS_NETWORKS = {
  'aleph-zero': {
    type: 'substrate',
    rpcEndpoint: 'https://aleph-zero.api.onfinality.io/public',
    ss58Network: 'substrate',
    gatewayUrl: 'https://v2.archive.subsquid.io/network/aleph-zero',
    rpcIngestionDisabled: 'true',
  },
  astar: {
    type: 'substrate',
    rpcEndpoint: 'https://astar.api.onfinality.io/public',
    ss58Network: 'astar',
    gatewayUrl: 'https://v2.archive.subsquid.io/network/astar-substrate',
    rpcIngestionDisabled: 'true',
  },
};

export default DAPP_ANALYTICS_NETWORKS;
