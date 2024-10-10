import { Request, Response } from 'express';
import httpStatus, { OK } from 'http-status';
import axios from 'axios';
import { ethers } from 'ethers';
import logger from '@core/utils/logger';
import { IDAppData } from './dapp-analytics.interface';
import {
  IInkAbi,
  IInkAbiEvent,
  IInkAbiMessage,
  IInkAbiArg,
  IAbiEventsOutput,
  IAbiEventsOutputContract,
  IAbiEventsOutputContractEvent,
  IAbiCallsOutput,
  IAbiCallsOutputContract,
  IAbiCallsOutputContractCall,
  IEvmAbi,
  IEvmEventAbiItem,
  IEvmFunctionAbiItem,
} from './abi.interface';
import { resolveInkType, resolveEvmType } from './types.mapping';
import { docker, k8sApi } from 'server';
import { getCurrentBlock } from '@components/node-api/chainstate';
import { convertAndFormatNumbers } from './helpers/formatting';
import { isSubstrateAbi, isEvmAbi } from './helpers/utils';
import DAPP_ANALYTICS_NETWORKS from './../../config/dapp-analytics-networks';
import config from '@config/config';

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

export const startDappIndexerDocker = async (
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
            'managed-by': 'dapp-analytics-admin',
            'dapp-id': id,
          },
          Env: [
            `DAPP_ID=${id}`,
            `DB_HOST=${config.indexerDbHost}`,
            `DB_NAME=${config.indexerDbName}`,
            `DB_USER=${config.indexerDbUser}`,
            `DB_PASS=${config.indexerDbPass}`,
            `DB_PORT=${config.indexerDbPort}`,
            `RPC_ENDPOINT=${networkConfig.rpcEndpoint}`,
            `SS58_NETWORK=${networkConfig.ss58Network}`,
            `GATEWAY_URL=${networkConfig.gatewayUrl}`,
            `RPC_INGESTION_DISABLED=${networkConfig.rpcIngestionDisabled}`,
            `CREATED_TIMESTAMP=${timestamp}`,
            `DAPP_ADDRESSES=${dappData.abis
              .map((abi) => abi.address)
              .join(',')}`,
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

export const stopDappIndexerDocker = async (req, res) => {
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

export const startDappIndexerPod = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.body;
  const podName = `indexer-${id}`;

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

  const podManifest = {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: podName,
      labels: {
        'managed-by': 'dapp-analytics-admin',
        'dapp-id': id.toString(),
      },
    },
    spec: {
      serviceAccountName: 'dapp-analytics-admin',
      containers: [
        {
          name: podName,
          image: image,
          env: [
            { name: 'DAPP_ID', value: id.toString() },
            { name: 'DB_HOST', value: config.indexerDbHost },
            { name: 'DB_NAME', value: config.indexerDbName },
            { name: 'DB_USER', value: config.indexerDbUser },
            { name: 'DB_PASS', value: config.indexerDbPass },
            { name: 'DB_PORT', value: config.indexerDbPort.toString() },
            { name: 'RPC_ENDPOINT', value: networkConfig.rpcEndpoint },
            { name: 'SS58_NETWORK', value: networkConfig.ss58Network },
            { name: 'GATEWAY_URL', value: networkConfig.gatewayUrl },
            {
              name: 'RPC_INGESTION_DISABLED',
              value: networkConfig.rpcIngestionDisabled.toString(),
            },
            { name: 'CREATED_TIMESTAMP', value: timestamp.toString() },
            {
              name: 'DAPP_ADDRESSES',
              value: dappData.abis.map((abi) => abi.address).join(','),
            },
            { name: 'TRACES', value: networkConfig.traces.toString() },
          ],
        },
      ],
      restartPolicy: 'Always',
    },
  };

  try {
    console.log('Pod Manifest:', JSON.stringify(podManifest, null, 2));

    // Check if the pod already exists
    try {
      const { body: existingPod } = await k8sApi.readNamespacedPod(
        podName,
        'dapp-analytics',
      );

      if (
        existingPod &&
        existingPod.status &&
        existingPod.status.phase !== 'Running'
      ) {
        logger.info(
          `pod found but in ${existingPod.status.phase} state. delete and create new pod`,
        );
        await k8sApi.deleteNamespacedPod(podName, 'dapp-analytics');
        logger.info(`Pod deleted: ${podName}`);
        const { body: startedPod } = await k8sApi.createNamespacedPod(
          'dapp-analytics',
          podManifest,
        );
        logger.info(`Pod restarted: ${podName}`);
        return res.status(httpStatus.CREATED).json({
          message: `Pod restarted: ${podName}`,
          podName: startedPod.metadata?.name,
        });
      } else {
        logger.info(`Pod is already running: ${podName}`);
        return res.status(httpStatus.OK).json({
          message: `Pod is already running: ${podName}`,
        });
      }
    } catch (error) {
      if (error.response?.statusCode === 404) {
        logger.info('creating new pod');
        const { body: newPod } = await k8sApi.createNamespacedPod(
          'dapp-analytics',
          podManifest,
        );
        logger.info(`New pod created: ${podName}`);
        return res.status(httpStatus.CREATED).json({
          message: `New pod created: ${podName}`,
          podName: newPod.metadata?.name,
        });
      } else {
        logger.error('Error reading pod:', error);
        console.error('Error details:', error.response.body);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Failed to read Kubernetes pod',
          error: error.message,
        });
      }
    }
  } catch (error) {
    logger.error('Error managing Kubernetes pod:', error);
    console.error('Error details:', error.response.body);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to manage Kubernetes pod',
      error: error.message,
    });
  }
};

export const stopDappIndexerPod = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.body;
  const podName = `indexer-${id}`;

  try {
    await k8sApi.deleteNamespacedPod(podName, 'dapp-analytics'); // Corrected namespace
    logger.info(`Pod stopped (deleted): ${podName}`);
    return res.status(200).json({
      message: `Pod ${podName} has been successfully stopped (deleted)`,
    });
  } catch (error) {
    if (error.response?.statusCode === 404) {
      logger.error(`Pod ${podName} not found:`, error);
      return res.status(404).json({
        message: `Pod ${podName} not found`,
      });
    } else {
      logger.error(`Error stopping pod ${podName}:`, error);
      return res.status(500).json({
        message: `Failed to stop pod ${podName}`,
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
  }
  let indexingProgress = 0;
  let indexingMaxBlock = 0;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dapp-analytics/dapp/${id}/status`,
    );
    if (response.status === 200) {
      indexingProgress = response.data.output.status.height;
    }
    const nodeResponse = await getCurrentBlock(dappData.blockchain);
    if (nodeResponse) {
      indexingMaxBlock = nodeResponse;
    }
  } catch (error) {
    logger.error(`Error retrieving DApp status with id ${id}:`, error);
  }

  let containerStatus;
  if (config.deploymentMode === 'kubernetes') {
    containerStatus = await fetchKubernetesPodStatus(id);
  } else {
    containerStatus = await fetchDockerContainerStatus(id);
  }

  const responseData = {
    ...dappData,
    containerStatus: containerStatus || 'not found',
    indexingStatus: convertAndFormatNumbers(indexingProgress, indexingMaxBlock),
  };

  return res.status(200).json(responseData);
};

async function fetchDockerContainerStatus(id: string): Promise<string | null> {
  const filters = {
    label: [`managed-by=dapp-analytics-admin`, `dapp-id=${id}`],
  };
  const containers = await docker.listContainers({
    all: true,
    filters: JSON.stringify(filters),
  });
  const relatedContainer = containers.find(
    (container) => container.Labels && container.Labels['dapp-id'] === id,
  );
  return relatedContainer ? relatedContainer.State : null;
}

async function fetchKubernetesPodStatus(id: string): Promise<string | null> {
  const namespace = 'dapp-analytics';
  const labelSelector = `managed-by=dapp-analytics-admin,dapp-id=${id}`;
  const pods = await k8sApi.listNamespacedPod(
    namespace,
    undefined,
    undefined,
    undefined,
    undefined,
    labelSelector,
  );
  const relatedPod = pods.body.items.find(
    (pod) => pod.metadata.labels && pod.metadata.labels['dapp-id'] === id,
  );
  return relatedPod ? relatedPod.status.phase : null;
}

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

export async function fetchDappIndexingStatus(id: string) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dapp-analytics/dapp/${id}/status`,
    );
    return response.data;
  } catch (error) {
    return {
      error: { status: 500, message: 'Failed to connect to backend service' },
    };
  }
}

export const getAllDapps = async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dapp-analytics/dapp/all`);
    if (response.status !== 200) {
      return res.status(response.status).json({
        message: response.data.message || 'No DApps found',
      });
    }
    const dApps = response.data;
    if (req.query.simplified) {
      return res.status(200).json(dApps);
    }

    const dAppsWithIndexingStatus = await Promise.all(
      dApps.map(async (dApp) => {
        let indexingProgress = 0;
        let indexingMaxBlock = 0;
        let containerStatus = 'not found';
        try {
          const statusResponse = await axios.get(
            `${API_BASE_URL}/dapp-analytics/dapp/${dApp.id}/status`,
          );
          indexingProgress =
            statusResponse.status === 200
              ? statusResponse.data.output.status.height
              : 0;
          const nodeResponse = await getCurrentBlock(dApp.blockchain);
          if (nodeResponse) {
            indexingMaxBlock = nodeResponse;
          }
        } catch (error) {
          logger.error(
            `Error retrieving DApp status with id ${dApp.id}:`,
            error,
          );
        }
        return {
          ...dApp,
          indexingStatus: convertAndFormatNumbers(
            indexingProgress,
            indexingMaxBlock,
          ),
          containerStatus,
        };
      }),
    );

    let dAppsWithStatus = dAppsWithIndexingStatus;
    try {
      if (config.deploymentMode === 'kubernetes') {
        dAppsWithStatus = await checkKubernetesPodStatus(
          dAppsWithIndexingStatus,
        );
      } else {
        dAppsWithStatus = await checkDockerContainerStatus(
          dAppsWithIndexingStatus,
        );
      }
    } catch (error) {
      logger.error(
        `in config: ${config.deploymentMode} error checking container status:`,
        error,
      );
    }

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

async function checkDockerContainerStatus(dApps) {
  const filters = { label: ['managed-by=dapp-analytics-admin'] };
  const containers = await docker.listContainers({
    all: true,
    filters: JSON.stringify(filters),
  });

  return dApps.map((dApp) => {
    const relatedContainer = containers.find(
      (container) =>
        container.Labels && container.Labels['dapp-id'] === dApp.id,
    );
    return {
      ...dApp,
      containerStatus: relatedContainer ? relatedContainer.State : 'not found',
    };
  });
}

async function checkKubernetesPodStatus(dApps) {
  const namespace = 'dapp-analytics';
  const labelSelector = 'managed-by=dapp-analytics-admin';

  // Fetch pods in the dapp-analytics namespace
  const pods = await k8sApi.listNamespacedPod(
    namespace,
    undefined,
    undefined,
    undefined,
    undefined,
    labelSelector,
  );

  // Fetch all pods in the subsquid namespace
  const subsquidPods = await k8sApi.listNamespacedPod('subsquid');

  // Map over dApps to get their statuses
  return dApps.map((dApp) => {
    // Check for the related pod in dapp-analytics namespace
    const relatedPod = pods.body.items.find(
      (pod) =>
        pod.metadata.labels && pod.metadata.labels['dapp-id'] === dApp.id,
    );

    const relatedSubsquidPod = subsquidPods.body.items.find(
      (pod) =>
        pod.metadata.labels &&
        pod.metadata.labels['app'].startsWith('wasabi') &&
        pod.metadata.labels['app'].includes(
          dApp.slug === 'hydration' ? 'hydradx' : dApp.slug,
        ),
    );

    // Determine the container status
    const containerStatus = relatedPod
      ? relatedPod.status.phase
      : relatedSubsquidPod
      ? relatedSubsquidPod.status.phase
      : 'not found';

    return {
      ...dApp,
      containerStatus,
    };
  });
}

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

const extractInkAbiEvents = function (
  contractAbi: IInkAbi,
): IAbiEventsOutputContractEvent[] {
  // Extract events
  const events: IAbiEventsOutputContractEvent[] =
    contractAbi.spec.events.map((event: IInkAbiEvent) => ({
      name: event.label,
      args: event.args.map((arg: IInkAbiArg) => ({
        name: arg.label,
        type: resolveInkType(arg.type.type, contractAbi.types),
      })),
    })) || [];
  return events;
};

const extractEvmAbiEvents = function (
  abi: IEvmAbi,
): IAbiEventsOutputContractEvent[] {
  const events: IAbiEventsOutputContractEvent[] =
    abi
      .filter((item) => item.type === 'event')
      .map((event: IEvmEventAbiItem) => ({
        name: event.name!,
        args: event.inputs!.map((input) => ({
          name: input.name,
          type: resolveEvmType(input.type),
        })),
      })) || [];

  return events;
};

const extractInkAbiFunctions = function (
  contractAbi: IInkAbi,
): IAbiCallsOutputContractCall[] {
  // Extract messages (calls) that mutate the blockchain state
  const calls: IAbiCallsOutputContractCall[] =
    contractAbi.spec.messages
      .filter((message: IInkAbiMessage) => message.mutates)
      .map((message: IInkAbiMessage) => ({
        name: message.label,
        selector: message.selector,
        args: message.args.map((arg: IInkAbiArg) => ({
          name: arg.label,
          type: resolveInkType(arg.type.type, contractAbi.types),
        })),
      })) || [];
  return calls;
};

const extractEvmAbiFunctions = function (
  abi: IEvmAbi,
): IAbiCallsOutputContractCall[] {
  const calls: IAbiCallsOutputContractCall[] =
    abi
      .filter(
        (item) =>
          item.type === 'function' &&
          item.stateMutability !== 'view' &&
          item.stateMutability !== 'pure',
      )
      .map((func: IEvmFunctionAbiItem) => {
        const functionSignature = `${func.name}(${func
          .inputs!.map((input) => input.type)
          .join(',')})`;
        const selector = ethers
          .keccak256(ethers.toUtf8Bytes(functionSignature))
          .slice(0, 10);
        // TODO: jrojek, prevent selector calculation every time the method is called
        return {
          name: func.name!,
          selector: selector,
          args: func.inputs!.map((input) => ({
            name: input.name,
            type: resolveEvmType(input.type),
          })),
        };
      }) || [];

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
      const dapp = response.data;
      let dappEventsOutput: IAbiEventsOutput = { contracts: [] };

      for (const contract of dapp.abis) {
        if (isSubstrateAbi(contract.abi)) {
          const dAppContract: IAbiEventsOutputContract = {
            name: contract.name,
            address: contract.address,
            events: extractInkAbiEvents(contract.abi),
          };
          dappEventsOutput.contracts.push(dAppContract);
        } else if (isEvmAbi(contract.abi)) {
          const dAppContract: IAbiEventsOutputContract = {
            name: contract.name,
            address: contract.address,
            events: extractEvmAbiEvents(contract.abi),
          };
          dappEventsOutput.contracts.push(dAppContract);
        } else {
          return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: 'Unsupported ABI format' });
        }
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

// export const getDappAbiEvents = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   try {
//     const response = await axios.get(
//       `${API_BASE_URL}/dapp-analytics/dapp/${req.params.id}`,
//     );

//     if (response.status === 200) {
//       let dappEventsOutput: IAbiEventsOutput = { contracts: [] };
//       const dapp = response.data;
//       for (const contract of dapp.abis) {
//         const dAppContract: IAbiEventsOutputContract = {
//           name: contract.name,
//           address: contract.address,
//           events: extractInkAbiEvents(contract.abi),
//         };
//         dappEventsOutput.contracts.push(dAppContract);
//       }
//       return res.status(httpStatus.OK).json(dappEventsOutput);
//     }
//     return res.status(response.status).json({
//       message: response.data.message || 'No dApps found',
//     });
//   } catch (error) {
//     logger.error('Error retrieving dApps ABIs:', error);
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || 'Error retrieving dApps ABIs',
//       });
//     }
//     return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       message: 'Failed to connect to backend service',
//     });
//   }
// };

export const getDappAbiCalls = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dapp-analytics/dapp/${req.params.id}`,
    );

    if (response.status === 200) {
      const dapp = response.data;
      let dappCallsOutput: IAbiCallsOutput = { contracts: [] };

      for (const contract of dapp.abis) {
        if (isSubstrateAbi(contract.abi)) {
          const dAppContract: IAbiCallsOutputContract = {
            name: contract.name,
            address: contract.address,
            calls: extractInkAbiFunctions(contract.abi),
          };
          dappCallsOutput.contracts.push(dAppContract);
        } else if (isEvmAbi(contract.abi)) {
          const dAppContract: IAbiCallsOutputContract = {
            name: contract.name,
            address: contract.address,
            calls: extractEvmAbiFunctions(contract.abi),
          };
          dappCallsOutput.contracts.push(dAppContract);
        } else {
          return res
            .status(httpStatus.BAD_REQUEST)
            .json({ message: 'Unsupported ABI format' });
        }
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

// export const getDappAbiCalls = async (
//   req: Request,
//   res: Response,
// ): Promise<Response> => {
//   try {
//     const response = await axios.get(
//       `${API_BASE_URL}/dapp-analytics/dapp/${req.params.id}`,
//     );

//     if (response.status === 200) {
//       let dappCallsOutput: IAbiCallsOutput = { contracts: [] };
//       const dapp = response.data;

//       for (const contract of dapp.abis) {
//         const dAppContract: IAbiCallsOutputContract = {
//           name: contract.name,
//           address: contract.address,
//           calls: extractInkAbiFunctions(contract.abi),
//         };
//         dappCallsOutput.contracts.push(dAppContract);
//       }
//       return res.status(httpStatus.OK).json(dappCallsOutput);
//     }
//     return res.status(response.status).json({
//       message: response.data.message || 'No dApps found',
//     });
//   } catch (error) {
//     logger.error('Error retrieving dApps ABIs:', error);
//     if (error.response) {
//       return res.status(error.response.status).json({
//         message: error.response.data.message || 'Error retrieving dApps ABIs',
//       });
//     }
//     return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       message: 'Failed to connect to backend service',
//     });
//   }
// };

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
      message: response.data.message || 'Failed to read dApp data',
    });
  } catch (error) {
    logger.error('Error in extracting dApp metrics', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to connect to backend service',
    });
  }
};

export const getIndexerStatus = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { id } = req.params;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/dapp-analytics/dapp/${id}/status`,
    );
    if (response.status === 200) {
      return res
        .status(OK)
        .send({ message: 'dApp indexer status read', output: response.data });
    }
    return res.status(response.status).json({
      message: response.data.message || 'Failed to read dApp indexing status',
    });
  } catch (error) {
    logger.error('Failed to read dApp indexing status', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to connect to backend service',
    });
  }
};
