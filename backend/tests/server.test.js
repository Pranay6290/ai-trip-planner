import request from 'supertest';
import app from '../server-simple.js';

describe('AI Trip Planner Backend', () => {
  describe('Health Endpoints', () => {
    test('GET /health should return server status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });

    test('GET /api/status should return API information', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('Trip Generation', () => {
    test('POST /api/trips/generate should validate input', async () => {
      const invalidInput = {
        destination: '',
        duration: 0,
        travelers: 0,
        budget: 0
      };

      const response = await request(app)
        .post('/api/trips/generate')
        .send(invalidInput)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid input');
      expect(response.body).toHaveProperty('details');
    });

    test('POST /api/trips/generate should generate trip with valid input', async () => {
      const validInput = {
        destination: 'Delhi',
        duration: 3,
        travelers: 2,
        budget: 15000,
        interests: ['culture', 'food']
      };

      const response = await request(app)
        .post('/api/trips/generate')
        .send(validInput)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('tripSummary');
      expect(response.body.data).toHaveProperty('hotels');
      expect(response.body.data).toHaveProperty('itinerary');
    }, 30000); // 30 second timeout for AI generation
  });

  describe('Places Search', () => {
    test('GET /api/places/search should require query parameter', async () => {
      const response = await request(app)
        .get('/api/places/search')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/places/search should return places for valid query', async () => {
      const response = await request(app)
        .get('/api/places/search?query=Delhi')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Nearby Places', () => {
    test('GET /api/places/nearby should require coordinates', async () => {
      const response = await request(app)
        .get('/api/places/nearby')
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/places/nearby should return places for valid coordinates', async () => {
      const response = await request(app)
        .get('/api/places/nearby?lat=28.6139&lng=77.2090')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('Should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });
});
