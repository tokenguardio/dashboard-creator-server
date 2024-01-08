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
    res.status(httpStatus.OK).send({ data: response.data });
  } catch (error) {
    console.error('Error fetching table columns:', error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .send({ message: 'Error fetching table columns' });
  }
};
