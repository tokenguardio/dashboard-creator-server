import { ApiPromise, WsProvider } from '@polkadot/api';
import { ethers } from 'ethers';

const rpcEndpoints: { [key: string]: string } = {
  polkadot: process.env.WSS_POLKADOT || 'wss://rpc.polkadot.io',
  kusama: process.env.WSS_KUSAMA || 'wss://kusama-rpc.polkadot.io',
  'aleph-zero': process.env.WSS_ALEPH_ZERO || 'wss://rpc.azero.dev',
  moonbeam:
    process.env.WSS_MOONBEAM || 'wss://moonbeam.api.onfinality.io/public-ws',
  'arbitrum-one':
    process.env.RPC_ARBITRUM_ONE || 'https://arb1.arbitrum.io/rpc',
  'arbitrum-nova':
    process.env.RPC_ARBITRUM_NOVA || 'https://nova.arbitrum.io/rpc',
  avalanche: process.env.RPC_AVALANCHE || 'https://avalanche.api.onfinality.io/public/ext/bc/C/rpc',
  ethereum: process.env.RPC_ETHEREUM || 'https://eth.api.onfinality.io/public',
  optimism:
    process.env.RPC_OPTIMISM || 'https://optimism.api.onfinality.io/public',
  bifrost: process.env.WSS_BIFROST || 'wss://bifrost-rpc.dwellir.com',
  hydration: process.env.WSS_HYDRATION || 'wss://hydradx-rpc.dwellir.com',
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
