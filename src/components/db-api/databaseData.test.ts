import { agent as request } from 'supertest';
import axios from 'axios';
import httpStatus from 'http-status';
import mockAxios from 'jest-mock-axios';
import { jest } from '@jest/globals';

import app from '@app';

jest.mock('axios');

describe('Database Data API', () => {
  afterEach(() => {
    mockAxios.reset(); // Reset the mock after each test
  });
  describe('GET /api/databases', () => {
    test('should return 200 status and a list of databases', async () => {
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      const mockDatabasesData = { databases: ['db1', 'db2', 'db3'] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockDatabasesData });

      const res = await request(app).get('/api/databases');

      // Assertions
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data).toEqual(mockDatabasesData.databases);
    });
  });

  describe('GET /api/schemas', () => {
    test('should return 200 status and a list of schemas', async () => {
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      const mockResponseData = [
        { schema_name: 'pg_catalog' },
        { schema_name: 'information_schema' },
        { schema_name: 'public' },
        { schema_name: 'growth_index' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponseData });

      const res = await request(app).get('/api/database-data/schemas');

      // Assertions
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toEqual(mockResponseData);
    });
  });

  describe('GET /api/tables', () => {
    test.only('should return 200 status and a list of tables', async () => {
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      const mockTablesData = [
        { table_schema: 'public', table_name: 'tokens_dict' },
        { table_schema: 'public', table_name: 'market_data' },
        { table_schema: 'growth_index', table_name: 'weekly_growth_index_old' },
        { table_schema: 'public', table_name: 'artemis_raw_data' },
        { table_schema: 'growth_index', table_name: 'weekly_growth_index' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockTablesData });

      const res = await request(app).get('/api/database-data/tables');

      // Assertions
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
      expect(res.body.data).toEqual(mockTablesData);
    });
  });

  // describe('GET /api/tables/:schemaName/:tableName/columns', () => {
  //   test('should return 200 status and a list of columns for a specific table', async () => {
  //     const schemaName = 'public';
  //     const tableName = 'your_table_name';
  //     const res = await request(app)
  //       .get(`/api/tables/${schemaName}/${tableName}/columns`)
  //       .send();
  //     expect(res.status).toBe(httpStatus.OK);
  //     expect(res.body).toHaveProperty('data');
  //     expect(Array.isArray(res.body.data)).toBeTruthy();
  //   });
  // });
});
