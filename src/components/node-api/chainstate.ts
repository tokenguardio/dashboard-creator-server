import { ApiPromise, WsProvider } from '@polkadot/api';
import { ethers } from 'ethers';

const rpcEndpoints: { [key: string]: string } = {
  polkadot: 'wss://rpc.polkadot.io',
  kusama: 'wss://kusama-rpc.polkadot.io',
  'aleph-zero': 'wss://rpc.azero.dev',
  moonbeam: 'wss://moonbeam.api.onfinality.io/public-ws',
  'arbitrum-one': 'https://arb1.arbitrum.io/rpc',
  'arbitrum-nova': 'https://nova.arbitrum.io/rpc',
  optimism: 'https://optimism.api.onfinality.io/public',
  bifrost: 'wss://bifrost-rpc.dwellir.com',
  hydration: 'wss://hydradx-rpc.dwellir.com',
};

export async function getCurrentBlock(chain: string): Promise<number> {
  const endpoint = rpcEndpoints[chain];
  if (!endpoint) {
    throw new Error(`RPC endpoint for chain ${chain} not found`);
  }

  if (
    [
      'polkadot',
      'kusama',
      'aleph-zero',
      'moonbeam',
      'bifrost',
      'hydration',
    ].includes(chain)
  ) {
    // Substrate-based chains
    const wsProvider = new WsProvider(endpoint);
    const api = await ApiPromise.create({ provider: wsProvider });
    const currentBlock = await api.rpc.chain.getHeader();
    return currentBlock.number.toNumber();
  } else if (['arbitrum-one', 'arbitrum-nova', 'optimism'].includes(chain)) {
    // Ethereum-compatible chains (e.g., Arbitrum)
    const provider = new ethers.JsonRpcProvider(endpoint);
    const currentBlockNumber = await provider.getBlockNumber();
    return currentBlockNumber;
  } else {
    throw new Error(`Chain ${chain} is not supported`);
  }
}
