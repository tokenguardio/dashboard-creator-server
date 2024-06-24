import { Document } from 'mongoose';

interface IBlockchain {
  id: string;
  name: string;
  network: string;
  slug: string;
  logo: string;
  active: boolean;
  growthindex: boolean;
  dappgrowth: boolean;
  database: string;
}

export { IBlockchain };
