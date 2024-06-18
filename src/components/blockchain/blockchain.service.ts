import httpStatus from 'http-status';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import {
  BlockchainModel,
} from './blockchain.model';
import { IBlockchain } from './blockchain.interface';

const create = async (blockchainData: IBlockchain): Promise<IBlockchain> => {
  try {
    const newBlockchain = await BlockchainModel.create(blockchainData);
    return await newBlockchain.save();
  } catch (err) {
    logger.error(`Blockchain create error: %O`, err.message);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Blockchain was not created!',
    );
  }
};

const upsert = async (blockchainData: IBlockchain): Promise<IBlockchain> => {
  try {
    const newBlockchain = await BlockchainModel.findOneAndUpdate(
      { name: blockchainData.name, network: blockchainData.network },
      blockchainData,
      { upsert: true, new: true },
    );
    return newBlockchain;
  } catch (err) {
    logger.error(`Blockchain upsert error: %O`, err.message);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Blockchain was not upserted!',
    );
  }
}

const getAll = async (queryFilters: IBlockchain): Promise<IBlockchain[]> => {
  try {
    return await BlockchainModel.find(queryFilters).lean();
  } catch (err) {
    logger.error(`Blockchain getAll error: %O`, err.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'Blockchain was not found!');
  }
};

const getById = async (id: string): Promise<IBlockchain> => {
  try {
    return await BlockchainModel.findOne({id: id}).lean();
  } catch (err) {
    logger.error(`Blockchain getById error: %O`, err.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'Blockchain was not found!');
  }
}

const getByNameAndNetwork = async (name: string, network: string): Promise<IBlockchain> => {
  try {
    return await BlockchainModel.findOne({name: name, network: network}).lean();
  } catch (err) {
    logger.error(`Blockchain getByNameAndNetwork error: %O`, err.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'Blockchain was not found!');
  }
}

const getBySlug = async (slug: string): Promise<IBlockchain> => {
  try {
    return await BlockchainModel.findOne({slug: slug}).lean();
  } catch (err) {
    logger.error(`Blockchain getBySlug error: %O`, err.message);
    throw new AppError(httpStatus.BAD_REQUEST, 'Blockchain was not found!');
  }
}

export { create, upsert, getAll, getById, getByNameAndNetwork, getBySlug }
