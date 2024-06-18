import { Request, Response } from 'express';
import httpStatus from 'http-status';
import axios from 'axios';
import logger from '@core/utils/logger';
import * as chartDataGenerator from './helper/chartDataGenerator';

const { API_BASE_URL } = process.env;

export const getAllDatabases = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/databases`);
    res.status(httpStatus.OK).send({ data: response.data });
  } catch (error) {
    logger.error('Error fetching databases:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'Error fetching databases' });
  }
};

export const getAllSchemas = async (req: Request, res: Response) => {
  try {
    const { dbname } = req.params;
    const response = await axios.get(
      `${API_BASE_URL}/database/${encodeURIComponent(dbname)}/schemas`,
    );
    res.status(httpStatus.OK).send({ data: response.data });
  } catch (error) {
    logger.error('Error fetching schemas:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'Error fetching schemas' });
  }
};

export const getAllTables = async (req: Request, res: Response) => {
  try {
    const { dbname } = req.params;
    const response = await axios.get(
      `${API_BASE_URL}/database/${encodeURIComponent(dbname)}/tables`,
    );
    res.status(httpStatus.OK).send({ data: response.data });
  } catch (error) {
    logger.error('Error fetching tables:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'Error fetching tables' });
  }
};

export const getTableColumns = async (req: Request, res: Response) => {
  try {
    const { dbname, schema, table } = req.params;
    const response = await axios.get(
      `${API_BASE_URL}/database/${encodeURIComponent(
        dbname,
      )}/tables/${encodeURIComponent(schema)}/${encodeURIComponent(
        table,
      )}/columns`,
    );

    const processedColumns = response.data.map((column) => {
      // Assuming column data_type or a similar field is part of the response
      const dataType = column.data_type.toLowerCase();
      const isStringDateOrTimestamp = [
        'character varying',
        'varchar',
        'text',
        'date',
        'timestamp',
        'timestamp with time zone',
        'timestamp without time zone',
      ].includes(dataType);
      const isNumeric = [
        'integer',
        'bigint',
        'numeric',
        'real',
        'double precision',
        'smallint',
        'decimal',
      ].includes(dataType);

      return {
        ...column,
        isMeasure: isNumeric,
        isDimension: isStringDateOrTimestamp,
      };
    });

    res.status(200).send({ data: processedColumns });
  } catch (error) {
    logger.error('Error fetching table columns:', error);
    res.status(500).send({ message: 'Error fetching table columns' });
  }
};

export const generateChartData = async (req: Request, res: Response) => {
  try {
    const { dbname, schema, table } = req.params;
    const { dimension, measures, differential, filters } = req.body;

    logger.debug('measures', measures);
    const parsedMeasures = Array.isArray(measures)
      ? measures
      : JSON.parse(measures || '[]');
    const parsedFilters = Array.isArray(filters)
      ? filters
      : JSON.parse(filters || '[]');

    const payload = chartDataGenerator.createChartDataPayload({
      dimension,
      parsedMeasures,
      differential,
      parsedFilters,
    });

    const url = `${API_BASE_URL}/group-by-operation/${encodeURIComponent(
      dbname,
    )}/${encodeURIComponent(schema)}/${encodeURIComponent(table)}`;
    const response = await axios.post(url, payload);

    const mappedData = chartDataGenerator.formatChartDataResponse(
      response.data,
      {
        dimension,
        differential,
        parsedMeasures,
      },
    );

    res.status(httpStatus.OK).send({ data: mappedData });
  } catch (error) {
    logger.error('Error generating chart data:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'Error generating chart data' });
  }
};
