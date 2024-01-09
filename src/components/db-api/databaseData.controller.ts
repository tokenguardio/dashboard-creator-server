import { Request, Response } from 'express';
import httpStatus from 'http-status';
import axios from 'axios';

/* TO DO: move it do .env, create docker compose including db-api */
const API_BASE_URL = 'http://host.docker.internal:3000';

export const getAllDatabases = async (req: Request, res: Response) => {
  try {
    console.log('url', `${API_BASE_URL}/databases`);
    const response = await axios.get(`${API_BASE_URL}/databases`);
    res.status(httpStatus.OK).send({ data: response.data.databases });
  } catch (error) {
    console.error('Error fetching databases:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'Error fetching databases' });
  }
};

export const getAllSchemas = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/schemas`);
    res.status(httpStatus.OK).send({ data: response.data });
  } catch (error) {
    console.error('Error fetching schemas:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'Error fetching schemas' });
  }
};

export const getAllTables = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/tables`);
    res.status(httpStatus.OK).send({ data: response.data });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'Error fetching tables' });
  }
};

export const getTableColumns = async (req: Request, res: Response) => {
  try {
    const { schemaName, tableName } = req.params;
    const response = await axios.get(
      `${API_BASE_URL}/tables/${encodeURIComponent(
        schemaName,
      )}/${encodeURIComponent(tableName)}/columns`,
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
    console.error('Error fetching table columns:', error);
    res.status(500).send({ message: 'Error fetching table columns' });
  }
};

export const generateChartData = async (req: Request, res: Response) => {
  try {
    const { schema, table } = req.params;
    const { dimension, measures, differential, filters } = req.body;

    const parsedMeasures = measures ? JSON.parse(measures) : [];
    const parsedFilters = filters ? JSON.parse(filters) : [];

    const payload = {
      groupByColumns: [{ columnName: dimension }],
      aggregateColumns: parsedMeasures,
      filters: parsedFilters,
    };

    if (differential) {
      payload.groupByColumns.push({ columnName: differential });
    }

    const url = `${API_BASE_URL}/group-by-operation/${schema}/${table}`;

    console.log('url', url);
    const response = await axios.post(url, payload);

    res.status(httpStatus.OK).send({ data: response.data });
  } catch (error) {
    console.error('Error generating chart data:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'Error generating chart data' });
  }
};
