import { Request, Response } from 'express';
import httpStatus from 'http-status';
import axios from 'axios';
import logger from '@core/utils/logger';
// import Docker from 'dockerode';
import { IDAppData } from './dapp-analytics.interface';

// const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const { API_BASE_URL } = process.env;

export const saveDapp = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { name, logo, blockchain, website, fromBlock, addedBy, abis } =
      req.body as IDAppData;
    const response = await axios.post(`${API_BASE_URL}/dapp-analytics`, {
      name,
      logo,
      blockchain,
      website,
      fromBlock,
      addedBy,
      abis,
    });

    if (response.status === 201) {
      // const { id } = response.data.data;

      // // Define Docker container options
      // const container = await docker.createContainer({
      //   Image: 'yourimage:tag', // Specify your Docker image
      //   name: `dapp-${id}`,
      //   ExposedPorts: {
      //     '80/tcp': {}, // Define ports based on your application's requirements
      //   },
      //   HostConfig: {
      //     PortBindings: {
      //       '80/tcp': [{ HostPort: '8080' }], // Map internal ports to external
      //     },
      //   },
      //   Env: [`DAPP_ID=${id}`, `FROM_BLOCK=${fromBlock}`],
      // });

      // await container.start();

      // return res.status(httpStatus.CREATED).json({
      //   message: 'DApp and corresponding Docker container started successfully',
      //   dAppId: id,
      //   containerId: container.id,
      // });
      return res.status(httpStatus.CREATED);
    }

    return res.status(response.status).json({
      message: 'Failed to add dApp, no container was started',
      details: response.data,
    });
  } catch (error) {
    logger.error(
      'Error in adding new DApp and starting its Docker container:',
      error,
    );
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'Failed to add new DApp and start Docker container',
      error: error.message,
    });
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
    const response = await axios.patch(`${API_BASE_URL}/dapp-analytics/${id}`, {
      name,
      logo,
      blockchain,
      website,
      fromBlock,
      addedBy,
      abis: abis ? JSON.stringify(abis) : undefined,
    });

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
    const response = await axios.get(`${API_BASE_URL}/dapp-analytics/${id}`);

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
    const response = await axios.get(`${API_BASE_URL}/dapp-analytics`);

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
