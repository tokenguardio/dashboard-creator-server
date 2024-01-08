import { agent as request } from 'supertest';
import httpStatus from 'http-status';

import app from '@app';

describe('Database Data API', () => {
  describe('GET /api/databases', () => {
    test('should return 200 status and a list of databases', async () => {
      const res = await request(app).get('/api/databases').send();
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
  });

  describe('GET /api/schemas', () => {
    test('should return 200 status and a list of schemas', async () => {
      const res = await request(app).get('/api/schemas').send();
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
  });

  describe('GET /api/tables', () => {
    test('should return 200 status and a list of tables', async () => {
      const res = await request(app).get('/api/tables').send();
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
  });

  describe('GET /api/tables/:schemaName/:tableName/columns', () => {
    test('should return 200 status and a list of columns for a specific table', async () => {
      const schemaName = 'public';
      const tableName = 'your_table_name';
      const res = await request(app)
        .get(`/api/tables/${schemaName}/${tableName}/columns`)
        .send();
      expect(res.status).toBe(httpStatus.OK);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBeTruthy();
    });
  });
});
