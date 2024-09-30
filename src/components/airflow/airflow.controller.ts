import { Request, Response } from 'express';
import httpStatus from 'http-status';
import axios from 'axios';
import logger from '@core/utils/logger';
import config from '@config/config';

const { AIRFLOW_URL, AIRFLOW_USERNAME, AIRFLOW_PASSWORD } = process.env;

export const triggerDagRun = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { dagId, conf } = req.body;

    const auth = {
      username: AIRFLOW_USERNAME,
      password: AIRFLOW_PASSWORD,
    };

    const response = await axios.post(
      `${AIRFLOW_URL}/dags/${dagId}/dagRuns`,
      { conf },
      { auth },
    );

    logger.info(`DAG ${dagId} triggered successfully`, response.data);

    if (response.status === 200) {
      return res.status(httpStatus.OK).send({
        message: 'DAG triggered successfully',
        data: response.data,
      });
    }

    return res.status(response.status).json({
      message: 'Failed to trigger DAG',
      details: response.data,
    });
  } catch (error) {
    logger.error('Error in triggering DAG run', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: 'Failed to trigger DAG',
      error: error.message,
    });
  }
};

export const checkDagRunStatus = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  const { dagId } = req.params;
  const { dagRunId } = req.query;

  try {
    const response = await axios.get(
      `${AIRFLOW_URL}/dags/${dagId}/dagRuns/${dagRunId}`,
      {
        auth: {
          username: AIRFLOW_USERNAME as string,
          password: AIRFLOW_PASSWORD as string,
        },
      },
    );

    if (response.status === 200) {
      return res.status(httpStatus.OK).json({
        message: 'DAG run status retrieved successfully',
        data: response.data,
      });
    } else {
      return res.status(response.status).json({
        message: 'Failed to retrieve DAG run status',
        details: response.data,
      });
    }
  } catch (error) {
    logger.error('Error retrieving DAG run status', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Error retrieving DAG run status',
      error: error.message,
    });
  }
};
