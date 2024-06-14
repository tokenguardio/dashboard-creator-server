import { Request, Response } from 'express';
import httpStatus from 'http-status';
import axios from 'axios';
import logger from '@core/utils/logger';
import Docker from 'dockerode';
import { IDAppData } from './dapp-analytics.interface';
import {
  IAbi,
  IAbiEvent,
  IAbiMessage,
  IAbiArg,
  IAbiEventsOutput,
  IAbiEventsOutputContract,
  IAbiEventsOutputContractEvent,
  IAbiCallsOutput,
  IAbiCallsOutputContract,
  IAbiCallsOutputContractCall,
} from './abi.interface';
import { resolve } from 'path';
import { resolveType } from './substrate-types.mapping';

// const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const { API_BASE_URL } = process.env;

export const saveDapp = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { name, logo, blockchain, website, fromBlock, addedBy, abis } =
      req.body as IDAppData;
    const response = await axios.post(`${API_BASE_URL}/dapp-analytics/dapp`, {
      name,
      logo,
      blockchain,
      website,
      fromBlock,
      addedBy,
      abis,
    });
    logger.info('Response:', response.status, response.data);
    if (response.status === 201) {
      return res.status(httpStatus.CREATED).send({
        message: 'DApp added successfully',
        output: { id: response.data.data },
      });
    }

    return res.status(response.status).json({
      message: 'Failed to add dApp',
      details: response.data,
    });
  } catch (error) {
    logger.error('Error in adding new DApp', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'Failed to add new DApp',
      error: error.message,
    });
  }
};

// export const startDappIndexer = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   const { id, fromBlock } = req.body;

//   try {
//     const container = await docker.createContainer({
//       Image: 'yourindexerimage:latest',
//       name: `indexer-${id}`,
//       ExposedPorts: {
//         '80/tcp': {},
//       },
//       HostConfig: {
//         PortBindings: {
//           '80/tcp': [{ HostPort: '8080' }],
//         },
//       },
//       Env: [`DAPP_ID=${id}`, `FROM_BLOCK=${fromBlock}`],
//     });

//     await container.start();

//     return res.status(httpStatus.CREATED).json({
//       message: 'Indexer container started successfully',
//       containerId: container.id,
//     });
//   } catch (error) {
//     logger.error('Error in starting the indexer Docker container:', error);
//     return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       message: 'Failed to start indexer Docker container',
//       error: error.message,
//     });
//   }
// };

export const updateDapp = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  const { name, logo, blockchain, website, fromBlock, addedBy, abis } =
    req.body;

  try {
    const response = await axios.patch(
      `${API_BASE_URL}/dapp-analytics/dapp/${id}`,
      {
        name,
        logo,
        blockchain,
        website,
        fromBlock,
        addedBy,
        abis: abis ? JSON.stringify(abis) : undefined,
      },
    );

    if (response.status === 200) {
      return res.status(httpStatus.OK).json(response.data);
    }
    return res.status(response.status).json({
      message: response.data.message || 'Unexpected error occurred',
    });
  } catch (error) {
    logger.error(`Error updating DApp with id ${id}:`, error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'Failed to forward update DApp request',
    });
  }
};

export const getDapp = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dapp-analytics/dapp/${id}`,
    );

    if (response.status === 200) {
      return res.status(httpStatus.OK).json(response.data);
    }
    return res.status(response.status).json({
      message: response.data.message || 'DApp not found',
    });
  } catch (error) {
    logger.error(`Error retrieving DApp with id ${id}:`, error);
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || 'Error retrieving DApp',
      });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to connect to backend service',
    });
  }
};

export const getAllDapps = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dapp-analytics/dapp/all`);

    if (response.status === 200) {
      return res.status(httpStatus.OK).json(response.data);
    }
    return res.status(response.status).json({
      message: response.data.message || 'No dApps found',
    });
  } catch (error) {
    logger.error('Error retrieving all dApps:', error);
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || 'Error retrieving all dApps',
      });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to connect to backend service',
    });
  }
};

export const getDappUnits = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  return res.status(httpStatus.OK).json({
    message: 'Units read',
    output: {
      units: [
        { label: 'Wallets', value: 'wallets' },
        { label: 'Transferred tokens', value: 'transferred-tokens' },
        { label: 'Number of interactions', value: 'interactions' },
      ],
    },
  });
};

const extractAbiEvents = function (
  contractAbi: IAbi,
): IAbiEventsOutputContractEvent[] {
  contractAbi.spec.events.map((event: IAbiMessage) => {
    logger.info(event.label);
  });
  logger.info(`Events: ${contractAbi.spec.events.length}`);
  // Extract events
  const events: IAbiEventsOutputContractEvent[] = contractAbi.spec.events.map(
    (event: IAbiEvent) => ({
      name: event.label,
      args: event.args.map((arg: IAbiArg) => ({
        name: arg.label,
        type: resolveType(arg.type.type, contractAbi.types),
      })),
    }),
  );
  return events;
};

const extractAbiFunctions = function (
  contractAbi: IAbi,
): IAbiCallsOutputContractCall[] {
  // Extract messages (calls)
  logger.info(JSON.stringify(contractAbi.types, null, 2));
  const calls: IAbiCallsOutputContractCall[] = contractAbi.spec.messages.map(
    (message: IAbiMessage) => ({
      name: message.label,
      selector: message.selector,
      args: message.args.map((arg: IAbiArg) => ({
        name: arg.label,
        type: resolveType(arg.type.type, contractAbi.types),
      })),
    }),
  );
  return calls;
};

export const getDappAbiEvents = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dapp-analytics/dapp/${req.params.id}`,
    );

    if (response.status === 200) {
      let dappEventsOutput: IAbiEventsOutput = { contracts: [] };
      const dapp = response.data;
      logger.info(`DApp: ${dapp.name} abis available: ${dapp.abis.length}`);
      for (const contract of dapp.abis) {
        const dAppContract: IAbiEventsOutputContract = {
          name: contract.name,
          address: contract.address,
          events: extractAbiEvents(contract.abi),
        };
        dappEventsOutput.contracts.push(dAppContract);
      }
      return res.status(httpStatus.OK).json(dappEventsOutput);
    }
    return res.status(response.status).json({
      message: response.data.message || 'No dApps found',
    });
  } catch (error) {
    logger.error('Error retrieving dApps ABIs:', error);
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || 'Error retrieving dApps ABIs',
      });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to connect to backend service',
    });
  }
};

export const getDappAbiCalls = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dapp-analytics/dapp/${req.params.id}`,
    );

    if (response.status === 200) {
      let dappCallsOutput: IAbiCallsOutput = { contracts: [] };
      const dapp = response.data;
      logger.info(`DApp: ${dapp.name} abis available: ${dapp.abis.length}`);

      for (const contract of dapp.abis) {
        const dAppContract: IAbiCallsOutputContract = {
          name: contract.name,
          address: contract.address,
          calls: extractAbiFunctions(contract.abi),
        };
        dappCallsOutput.contracts.push(dAppContract);
      }
      return res.status(httpStatus.OK).json(dappCallsOutput);
    }
    return res.status(response.status).json({
      message: response.data.message || 'No dApps found',
    });
  } catch (error) {
    logger.error('Error retrieving dApps ABIs:', error);
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || 'Error retrieving dApps ABIs',
      });
    }
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to connect to backend service',
    });
  }
};

export const getDappDataMetrics = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id, metric } = req.params;
  try {
    const response = await axios.post(
      `${API_BASE_URL}/dapp-analytics/data/${id}/${metric}`,
      req.body,
    );
    logger.info('Response:', response.status, response.data);
    if (response.status === 200) {
      return res.status(httpStatus.OK).send({
        message: 'DApp data read',
        output: response.data,
      });
    }

    return res.status(response.status).json({
      message: 'Failed to add dApp',
      details: response.data,
    });
  } catch (error) {
    logger.error('Error in adding new DApp', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'Failed to add new DApp',
      error: error.message,
    });
  }
};
