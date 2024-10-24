export interface IDAppData {
  name: string;
  logo: string;
  blockchain: string;
  website: string;
  fromBlock: number;
  addedBy: string;
  abis: any;
  airdropContract?: string;
  airdropCurrencyContract?: string;
}
