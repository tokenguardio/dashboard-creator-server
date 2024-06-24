import db from '@db';
import logger from '@core/utils/logger';
import blockchains from '@preload-data/blockchains.json';
import { upsert } from './blockchain.service';
import { IBlockchain } from './blockchain.interface';


async function loadBlockchains() {
  logger.info(`Initializing blockchains in database`);
  for (const chain of blockchains) {
    try {
      await upsert(chain as IBlockchain);
    } catch (error) {
      logger.error(
        `Error adding ${chain.name} ${chain.network} to database: ${error.message}`,
      );
    }
  }
}

async function main() {
  try {
    logger.info('Loading blockchains to the database');
    await db.connect();
    await loadBlockchains();
    logger.info('Blockchains loaded successfully.');
  } catch (error) {
    logger.error('Error loading blockchains:', error);
  } finally {
    await db.disconnect();
    process.exit(0);
  }
}

main();
