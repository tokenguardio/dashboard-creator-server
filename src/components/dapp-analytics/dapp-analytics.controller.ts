import { Request, Response } from 'express';
import httpStatus from 'http-status';
import axios from 'axios';
import logger from '@core/utils/logger';
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
import { resolveType } from './substrate-types.mapping';
import { docker } from 'server';
import DAPP_ANALYTICS_NETWORKS from './../../config/dapp-analytics-networks';

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

export const startDappIndexer = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.body;
  const containerName = `indexer-${id}`;

  const { data: dappData, error: dappError } = await fetchDappById(id);
  if (dappError) {
    logger.error(`Failed to fetch DApp with id ${id}:`, dappError.message);
    return res.status(dappError.status).json({ message: dappError.message });
  }

  if (!DAPP_ANALYTICS_NETWORKS[dappData.blockchain]) {
    const message = `Blockchain network '${dappData.blockchain}' is not supported.`;
    logger.error(message);
    return res.status(httpStatus.BAD_REQUEST).json({ message });
  }

  const networkConfig = DAPP_ANALYTICS_NETWORKS[dappData.blockchain];
  const timestamp = new Date(dappData.created_at).getTime();

  const imageVersion =
    networkConfig.type === 'substrate'
      ? 'wasabi-substrate-latest'
      : 'wasabi-evm-latest';
  const image = `patternsjrojek/subsquid-squids:${imageVersion}`;

  try {
    let container;
    let message = '';
    try {
      container = await docker.getContainer(containerName);
      const containerInfo = await container.inspect();

      if (containerInfo.State.Status !== 'running') {
        await container.start();
        message = `Existing container started: ${containerName}`;
        logger.info(message);
      } else {
        message = `Container is already running: ${containerName}`;
        logger.info(message);
      }
    } catch (error) {
      if (error.statusCode === 404) {
        const containerOptions = {
          Image: image,
          name: containerName,
          Labels: {
            'managed-by': 'dapp-analytics',
            'dapp-id': id,
          },
          Env: [
            `DAPP_ID=${id}`,
            'DB_HOST=host.docker.internal',
            'DB_NAME=dapp_analytics',
            'DB_USER=squid',
            'DB_PASS=postgres',
            'DB_PORT=5432',
            `RPC_ENDPOINT=${networkConfig.rpcEndpoint}`,
            `SS58_NETWORK=${networkConfig.ss58Network}`,
            `GATEWAY_URL=${networkConfig.gatewayUrl}`,
            `RPC_INGESTION_DISABLED=${networkConfig.rpcIngestionDisabled}`,
            `CREATED_TIMESTAMP=${timestamp}`,
          ],
        };
        container = await docker.createContainer(containerOptions);
        await container.start();
        message = `New container created and started: ${containerName}`;
        logger.info(message);
      } else {
        logger.error('Error retrieving container:', error);
        throw error;
      }
    }

    return res.status(httpStatus.CREATED).json({
      message: message,
      containerId: container.id,
    });
  } catch (error) {
    logger.error(
      'Error in starting the indexer Docker container:',
      error.message,
    );
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to start indexer Docker container',
      error: error.message,
    });
  }
};

export const stopDappIndexer = async (req, res) => {
  const { id } = req.body;
  const containerName = `indexer-${id}`;

  try {
    const container = await docker.getContainer(containerName);
    const containerInfo = await container.inspect();

    if (containerInfo.State.Status === 'running') {
      await container.stop();
      logger.info(`Container stopped: ${containerName}`);
      return res.status(200).json({
        message: `Container ${containerName} has been successfully stopped`,
      });
    } else {
      return res.status(200).json({
        message: `Container ${containerName} is not running and did not need to be stopped`,
      });
    }
  } catch (error) {
    if (error.statusCode === 404) {
      logger.error(`Container ${containerName} not found:`, error);
      return res.status(404).json({
        message: `Container ${containerName} not found`,
      });
    } else {
      logger.error(`Error stopping container ${containerName}:`, error);
      return res.status(500).json({
        message: `Failed to stop container ${containerName}`,
        error: error.message,
      });
    }
  }
};

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
  const { data: dappData, error: dappError } = await fetchDappById(id);

  if (dappError) {
    return res.status(dappError.status).json({ message: dappError.message });
  } else {
    try {
      const filters = { label: [`managed-by=dapp-analytics`, `dapp-id=${id}`] };
      const containers = await docker.listContainers({
        all: true,
        filters: JSON.stringify(filters),
      });

      const relatedContainer = containers.find(
        (container) => container.Labels['dapp-id'] === id,
      );
      const responseData = {
        ...dappData,
        containerStatus: relatedContainer
          ? relatedContainer.State
          : 'not found',
      };

      if (responseData.containerStatus === 'not found') {
        return res.status(204).json({
          message: 'DApp found but no associated container.',
        });
      } else {
        return res.status(200).json(responseData);
      }
    } catch (error) {
      console.error('Error retrieving container status:', error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to retrieve container status',
        error: error.message,
      });
    }
  }
};

export async function fetchDappById(id) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dapp-analytics/dapp/${id}`,
    );
    if (response.status === 200) {
      return { data: response.data, error: null };
    }
    return {
      error: {
        status: response.status,
        message: response.data.message || 'DApp not found',
      },
    };
  } catch (error) {
    logger.error(`Error retrieving DApp with id ${id}:`, error);
    if (error.response) {
      return {
        error: {
          status: error.response.status,
          message: error.response.data.message || 'Error retrieving DApp',
        },
      };
    }
    return {
      error: { status: 500, message: 'Failed to connect to backend service' },
    };
  }
}

export const getAllDapps = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dapp-analytics/dapp/all`);
    if (response.status !== 200) {
      return res.status(response.status).json({
        message: response.data.message || 'No DApps found',
      });
    }
    const dApps = response.data;

    const filters = { label: ['managed-by=dapp-analytics'] };
    const containers = await docker.listContainers({
      all: true,
      filters: JSON.stringify(filters),
    });

    const dAppsWithStatus = dApps.map((dApp) => {
      const relatedContainer = containers.find(
        (container) =>
          container.Labels && container.Labels['dapp-id'] === dApp.id,
      );
      return {
        ...dApp,
        status: relatedContainer ? relatedContainer.State : 'not found',
      };
    });

    return res.status(200).json(dAppsWithStatus);
  } catch (error) {
    logger.error('Error retrieving all DApps:', error);
    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data.message || 'Error retrieving all DApps',
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
        { label: 'Transferred tokens', value: 'transferredTokens' },
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
      message: 'Failed to read dApp data',
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
