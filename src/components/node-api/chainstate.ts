import { ApiPromise, WsProvider } from '@polkadot/api';

const rpcEndpoints: { [key: string]: string } = {
  polkadot: 'wss://rpc.polkadot.io',
  kusama: 'wss://kusama-rpc.polkadot.io',
  'aleph-zero': 'wss://rpc.azero.dev',
};

export async function getCurrentBlock(chain: string) {
  const endpoint = rpcEndpoints[chain];
  if (!endpoint) {
    throw new Error(`RPC endpoint for chain ${chain} not found`);
  }

  const wsProvider = new WsProvider(endpoint);
  const api = await ApiPromise.create({ provider: wsProvider });

  const currentBlock = await api.rpc.chain.getHeader();
  return currentBlock.number.toNumber();
}
