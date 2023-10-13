const request = require('supertest');
const server = require('../server');  
const { db } = require('../server');  

afterAll(done => {
    server.close(() => {
      db.end(done);  
    });
});

describe('GET /top-5-rented-movies', () => {
    it('should return the top 5 rented movies', async () => {
      const response = await request(server).get('/top-5-rented-movies');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(5);
    });
  });