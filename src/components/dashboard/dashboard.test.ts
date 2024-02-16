import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { agent as request } from 'supertest';
import httpStatus from 'http-status';
import app from '@app';

describe('Dashboard Tests', () => {
  let mongoServer;

  beforeEach(async () => {
    await mongoose.disconnect();
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /api/dashboard/', () => {
    it('should create a new dashboard and return status CREATED', async () => {
      const dashboardData = {
        title: 'Test Dashboard',
        theme: {
          bgColor: '#fff',
          itemGridRadius: '5px',
          itemGridBgColor: '#eee',
          // Other theme-related properties
        },
      };

      const res = await request(app)
        .post('/api/dashboard/')
        .send(dashboardData);

      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body).toHaveProperty('message', 'Dashboard Created');
    });

    describe('GET /api/dashboard/all', () => {
      it('should retrieve all dashboards', async () => {
        await request(app)
          .post('/api/dashboard/')
          .send({
            title: 'Dashboard 1',
            theme: {
              bgColor: '#abc',
              itemGridRadius: '4px',
              itemGridBgColor: '#def',
            },
          });

        await request(app)
          .post('/api/dashboard/')
          .send({
            title: 'Dashboard 2',
            theme: {
              bgColor: '#123',
              itemGridRadius: '6px',
              itemGridBgColor: '#456',
            },
          });

        const res = await request(app).get('/api/dashboard/all');

        expect(res.status).toBe(httpStatus.OK);
        expect(res.body).toHaveProperty('message', 'Dashboards Read');
        expect(res.body.output).toHaveLength(2);
      });
    });

    describe('GET /api/dashboard/:id', () => {
      let createdDashboardId;

      beforeEach(async () => {
        const dashboardData = {
          title: 'Test Dashboard for Read',
          theme: {
            bgColor: '#fff',
            itemGridRadius: '5px',
            itemGridBgColor: '#eee',
          },
        };

        const createRes = await request(app)
          .post('/api/dashboard/')
          .send(dashboardData);

        createdDashboardId = createRes.body.output._id;
      });

      it('should retrieve a specific dashboard', async () => {
        const res = await request(app).get(
          `/api/dashboard/${createdDashboardId}`,
        );

        // Assert the successful response
        expect(res.status).toBe(httpStatus.OK);
        expect(res.body).toHaveProperty('message', 'Dashboard Read');
        expect(res.body.output._id).toBe(createdDashboardId);
      });

      it('should return an error for a non-existent dashboard', async () => {
        const res = await request(app).get(`/api/dashboard/nonexistentid`);

        expect(res.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
        expect(res.body).toHaveProperty('message');
      });
    });

    describe('PUT /api/dashboard/:id', () => {
      let createdDashboardId;

      beforeEach(async () => {
        const dashboardData = {
          title: 'Original Dashboard',
          theme: {
            bgColor: '#fff',
            itemGridRadius: '5px',
            itemGridBgColor: '#eee',
          },
        };

        const createRes = await request(app)
          .post('/api/dashboard/')
          .send(dashboardData);

        createdDashboardId = createRes.body.output._id;
      });

      it('should update a dashboard and return the updated data', async () => {
        const updatedData = {
          title: 'Updated Dashboard',
          theme: {
            bgColor: '#000',
            itemGridRadius: '10px',
            itemGridBgColor: '#111',
          },
        };

        const res = await request(app)
          .put(`/api/dashboard/${createdDashboardId}`)
          .send(updatedData);

        expect(res.status).toBe(httpStatus.OK);
        expect(res.body).toHaveProperty('message', 'Dashboard Updated');
        expect(res.body.output).toHaveProperty('_id', createdDashboardId);
        expect(res.body.output.title).toBe('Updated Dashboard');
      });

      it('should handle error for updating a non-existent dashboard', async () => {
        const nonExistentUpdate = {
          title: 'Non-existent Dashboard',
        };

        const res = await request(app)
          .put(`/api/dashboard/nonexistentid`)
          .send(nonExistentUpdate);

        expect(res.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
        expect(res.body).toHaveProperty('message');
      });
    });

    describe('DELETE /api/dashboard/:id', () => {
      let createdDashboardId;

      beforeEach(async () => {
        const dashboardData = {
          title: 'Dashboard to Delete',
          theme: {
            bgColor: '#fff',
            itemGridRadius: '5px',
            itemGridBgColor: '#eee',
          },
        };

        const createRes = await request(app)
          .post('/api/dashboard/')
          .send(dashboardData);

        createdDashboardId = createRes.body.output._id;
      });

      it('should delete a specific dashboard', async () => {
        const res = await request(app).delete(
          `/api/dashboard/${createdDashboardId}`,
        );

        expect(res.status).toBe(httpStatus.ACCEPTED);
        expect(res.body).toHaveProperty('message', 'Dashboard Removed');
      });

      it('should return an error for a non-existent dashboard', async () => {
        const res = await request(app).delete(`/api/dashboard/nonexistentid`);

        expect(res.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
        expect(res.body).toHaveProperty('message');
      });
    });

    describe('DELETE /api/dashboard/:id', () => {
      let createdDashboardId;

      beforeEach(async () => {
        // Create a new dashboard to test deletion
        const dashboardData = {
          title: 'Dashboard to Delete',
          theme: {
            bgColor: '#fff',
            itemGridRadius: '5px',
            itemGridBgColor: '#eee',
            // Other theme-related properties
          },
        };

        const createRes = await request(app)
          .post('/api/dashboard/')
          .send(dashboardData);

        createdDashboardId = createRes.body.output._id; // Assuming the created dashboard ID is returned
      });

      it('should delete a specific dashboard', async () => {
        // Make the DELETE request for the created dashboard
        const res = await request(app).delete(
          `/api/dashboard/${createdDashboardId}`,
        );

        // Assert the successful response
        expect(res.status).toBe(httpStatus.ACCEPTED);
        expect(res.body).toHaveProperty('message', 'Dashboard Removed');

        // Optionally, verify that the dashboard is indeed deleted
        // by trying to fetch it and expecting a 404 response
      });

      it('should return an error for a non-existent dashboard', async () => {
        // Make the DELETE request for a non-existent dashboard
        const res = await request(app).delete(`/api/dashboard/nonexistentid`);

        // Assert the error response
        expect(res.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
        expect(res.body).toHaveProperty('message');
      });
    });

    describe('POST /api/dashboard/:dashboardId/element', () => {
      let createdDashboardId;

      beforeEach(async () => {
        // Create a new dashboard to test deletion
        const dashboardData = {
          title: 'Dashboard to Delete',
          theme: {
            bgColor: '#fff',
            itemGridRadius: '5px',
            itemGridBgColor: '#eee',
            // Other theme-related properties
          },
        };

        const createRes = await request(app)
          .post('/api/dashboard/')
          .send(dashboardData);

        createdDashboardId = createRes.body.output._id; // Assuming the created dashboard ID is returned
      });

      it('should add an element to a dashboard', async () => {
        const elementData = {
          title: 'New Element',
          dimension: 'Dimension Value',
          differential: 'Differential Value',
          measures: ['Measure1', 'Measure2'],
        };

        const res = await request(app)
          .post(`/api/dashboard/${createdDashboardId}/element`)
          .send(elementData);

        // Assert the successful response
        expect(res.status).toBe(httpStatus.CREATED);
        expect(res.body).toHaveProperty(
          'message',
          'Element Added to Dashboard',
        );

        // Optionally, verify that the element is indeed added to the dashboard
        // by fetching the dashboard and checking its elements
      });

      it('should return an error for adding an element to a non-existent dashboard', async () => {
        const elementData = {
          title: 'New Element',
          // Other element properties
        };

        const res = await request(app)
          .post(`/api/dashboard/nonexistentid/element`)
          .send(elementData);

        // Assert the error response
        expect(res.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
        expect(res.body).toHaveProperty('message');
      });

      // Additional tests for other failure scenarios, like invalid element data
    });

    describe('DELETE /api/dashboard/:dashboardId/element/:elementId', () => {
      let createdDashboardId;
      let createdElementId;

      beforeEach(async () => {
        // Create a dashboard and an element for testing deletion
        // Assuming you have a method to create and return an element ID
        // createdDashboardId = await createTestDashboard();

        const dashboardData = {
          title: 'Dashboard to Delete',
          theme: {
            bgColor: '#fff',
            itemGridRadius: '5px',
            itemGridBgColor: '#eee',
            // Other theme-related properties
          },
        };

        const createRes = await request(app)
          .post('/api/dashboard/')
          .send(dashboardData);

        createdDashboardId = createRes.body.output._id;
        // createdElementId = await createTestElement(createdDashboardId);

        const elementData = {
          title: 'New Element',
          dimension: 'Dimension Value',
          differential: 'Differential Value',
          measures: ['Measure1', 'Measure2'],
        };

        const res = await request(app)
          .post(`/api/dashboard/${createdDashboardId}/element`)
          .send(elementData);

        createdElementId = res.body.output._id;
      });

      it('should remove an element from a dashboard', async () => {
        const res = await request(app).delete(
          `/api/dashboard/${createdDashboardId}/element/${createdElementId}`,
        );

        // Assert the successful response
        expect(res.status).toBe(httpStatus.ACCEPTED);
        expect(res.body).toHaveProperty(
          'message',
          'Element Removed from Dashboard',
        );
      });

      it('should return an error for removing a non-existent element', async () => {
        const res = await request(app).delete(
          `/api/dashboard/${createdDashboardId}/element/nonexistentElementId`,
        );

        // Assert the error response
        expect(res.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
        expect(res.body).toHaveProperty('message');
      });

      // More tests...
    });

    describe('PUT /api/dashboard/:dashboardId/element/:elementId', () => {
      let createdDashboardId;
      let createdElementId;

      beforeEach(async () => {
        // Create a dashboard and an element for testing deletion
        // Assuming you have a method to create and return an element ID
        // createdDashboardId = await createTestDashboard();

        const dashboardData = {
          title: 'Dashboard to Delete',
          theme: {
            bgColor: '#fff',
            itemGridRadius: '5px',
            itemGridBgColor: '#eee',
            // Other theme-related properties
          },
        };

        const createRes = await request(app)
          .post('/api/dashboard/')
          .send(dashboardData);

        createdDashboardId = createRes.body.output._id;
        // createdElementId = await createTestElement(createdDashboardId);

        const elementData = {
          title: 'New Element',
          dimension: 'Dimension Value',
          differential: 'Differential Value',
          measures: ['Measure1', 'Measure2'],
        };

        const res = await request(app)
          .post(`/api/dashboard/${createdDashboardId}/element`)
          .send(elementData);

        createdElementId = res.body.output._id;
      });

      it('should update an element in a dashboard', async () => {
        const updatedElementData = {
          title: 'Updated Element',
          dimension: 'Updated Dimension',
          // Other updated properties
        };

        const res = await request(app)
          .put(
            `/api/dashboard/${createdDashboardId}/element/${createdElementId}`,
          )
          .send(updatedElementData);

        // Assert the successful response
        expect(res.status).toBe(httpStatus.OK);
        expect(res.body).toHaveProperty('message', 'Dashboard Element Updated');
      });

      it('should return an error for updating a non-existent element', async () => {
        const updatedElementData = {
          title: 'Updated Element',
          // Other properties
        };

        const res = await request(app)
          .put(
            `/api/dashboard/${createdDashboardId}/element/nonexistentElementId`,
          )
          .send(updatedElementData);

        // Assert the error response
        expect(res.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
        expect(res.body).toHaveProperty('message');
      });

      it('should return an error for updating an element in a non-existent dashboard', async () => {
        const updatedElementData = {
          title: 'Updated Element',
          dimension: 'Updated Dimension',
          // Other updated properties
        };

        const nonExistentDashboardId = 'nonexistentDashboardId';
        const res = await request(app)
          .put(
            `/api/dashboard/${nonExistentDashboardId}/element/${createdElementId}`,
          )
          .send(updatedElementData);

        // Assert the error response
        expect(res.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
        expect(res.body).toHaveProperty('message');
      });

      // More tests...
    });
  });

  // More test suites...
});
