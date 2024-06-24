import { Server } from 'http';
import app from '@app';
import config from '@config/config';
import logger from '@core/utils/logger';
import errorHandler from 'core/utils/errorHandler';
import Docker from 'dockerode';
import db from '@db';

const { port } = config;
export const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const server: Server = app.listen(port, async (): Promise<void> => {
  await db.connect();
  logger.info(`Application listens on PORT: ${port}`);
});

const exitHandler = (): void => {
  if (app) {
    server.close(() => {
      logger.info('Server closed');
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    });
  } else {
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: Error): void => {
  errorHandler.handleError(error);
  if (!errorHandler.isTrustedError(error)) {
    exitHandler();
  }
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', (reason: Error) => {
  throw reason;
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');

  const filters = {
    label: ['managed-by=dapp-analytics'],
  };

  try {
    const containers = await docker.listContainers({
      filters: JSON.stringify(filters),
    });
    for (const containerInfo of containers) {
      const container = docker.getContainer(containerInfo.Id);
      await container.stop();
    }
  } catch (error) {
    logger.error('Failed to stop containers:', error);
  }

  if (server) {
    server.close();
  }
});
