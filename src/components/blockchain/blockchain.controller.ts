import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { getAll, getById, getBySlug } from './blockchain.service';
import { IBlockchain } from './blockchain.interface';

const getAllBlockchains = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const queryFilters = { ...req.query };
  if (!Object.prototype.hasOwnProperty.call(queryFilters, 'active'))
    queryFilters.active = 'true';
  try {
    const blockchains = await getAll(queryFilters as unknown as IBlockchain);
    return res
      .status(httpStatus.OK)
      .send({ message: 'Blockchains Read', output: blockchains });
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

const getBlockchainById = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const blockchain = await getById(req.params.id);
    return res
      .status(httpStatus.OK)
      .send({ message: 'Blockchain Read', output: blockchain });
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

const getBlockchainBySlug = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const blockchain = await getBySlug(req.params.slug);
    return res
      .status(httpStatus.OK)
      .send({ message: 'Blockchain Read', output: blockchain });
  } catch (err) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: err.message });
  }
};

export { getAllBlockchains, getBlockchainById, getBlockchainBySlug };
