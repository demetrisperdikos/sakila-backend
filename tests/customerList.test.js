const request = require('supertest');
const server = require('../server');  
const { db } = require('../server');  

afterAll(done => {
    server.close(() => {
      db.end(done);  
    });
});

describe('GET /customers', () => {
  it('should return a list of customers', async () => {
    const response = await request(server).get('/customers');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
