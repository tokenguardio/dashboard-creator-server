import { agent as request } from 'supertest';
import axios from 'axios';
import httpStatus from 'http-status';
import { jest } from '@jest/globals';
import app from '@app';

import mockData from '../components/db-api/mocks/dashboardData.json';
import queryResponses from '../components/db-api/mocks/queryResponses.json';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Database Data API', () => {
  describe('GET /api/databases', () => {
    test('should return 200 status and a list of databases', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockData.databases });
      const res = await request(app).get('/api/database-info/databases');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data).toEqual(mockData.databases);
    });
  });

  describe('GET /api/:dbname/schemas', () => {
    test('should return 200 status and a list of schemas', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockData.schemas });
      const res = await request(app).get(`/api/database-info/${mockData.dbname}/schemas`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toEqual(mockData.schemas);
    });
  });

  describe('GET /api/tables', () => {
    test('should return 200 status and a list of tables', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockData.tables });
      const res = await request(app).get(
        `/api/database-info/${mockData.dbname}/tables`,
      );

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data).toEqual(mockData.tables);
    });
  });

  describe('GET /api/:dbname/tables/:schemaName/:tableName/columns', () => {
    test('should return 200 status and a list of columns for a specific table', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockData.columns.request });
      const res = await request(app).get(
        `/api/database-info/${mockData.dbname}/tables/${mockData.schema_name}/${mockData.table_name}/columns`,
      );
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data).toEqual(mockData.columns.response);
    });
  });

  describe('POST /api/database-info/generate-chart-data/db1/public/market_data', () => {
    test('should handle request with one measure', async () => {
      const payload = {
        dimension: 'timestamp',
        measures: [
          { columnName: 'market_cap', operator: 'SUM' },
        ],
        filters: [
          {
            columnName: 'timestamp',
            filterValue: {
              start: '2023-06-28 00:00:00',
              end: '2023-06-29 00:00:00',
            },
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: queryResponses.responseForOneMeasure,
      });
      const res = await request(app)
        .post('/api/database-info/generate-chart-data/db1/public/market_data')
        .send(payload);

      expect(res.status).toBe(httpStatus.OK);
      // Additional assertions...
    });

    test('should handle request with two measures', async () => {
      const payload = {
        dimension: 'timestamp',
        measures: [
          { columnName: 'price', operator: 'AVG' },
          { columnName: 'market_cap', operator: 'SUM' },
        ],
        filters: [
          {
            columnName: 'timestamp',
            filterValue: {
              start: '2023-06-28 00:00:00',
              end: '2023-06-29 00:00:00',
            },
          },
        ],
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: queryResponses.responseForTwoMeasures,
      });
      const res = await request(app)
        .post('/api/database-info/generate-chart-data/db1/public/market_data')
        .send(payload);

      expect(res.status).toBe(httpStatus.OK);
      // Additional assertions...
    });

    test('should handle request with differential', async () => {
      const payload = {
        dimension: 'timestamp',
        measures: [
          { columnName: 'market_cap', operator: 'SUM' },
        ],
        filters: [
          {
            columnName: 'timestamp',
            filterValue: {
              start: '2023-06-28 00:00:00',
              end: '2023-06-29 00:00:00',
            },
          },
        ],
        differential: 'ticker',
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: queryResponses.responseForDifferential,
      });
      const res = await request(app)
        .post('/api/database-info/generate-chart-data/db1/public/market_data')
        .send(payload);

      expect(res.status).toBe(httpStatus.OK);
      // Additional assertions...
    });
  });
});
