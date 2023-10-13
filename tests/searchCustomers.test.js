const request = require('supertest');
const server = require('../server');  
const { db } = require('../server');  

afterAll(done => {
    server.close(() => {
      db.end(done);  
    });
});


describe('GET /customers', () => {

  it('should return customers filtered by first name', async () => {
    const firstName = "MARY"; 
    const response = await request(server).get(`/customers?firstName=${firstName}`);
    expect(response.status).toBe(200);
    expect(response.body[0].first_name).toBe(firstName);
  });

  it('should return customers filtered by last name', async () => {
    const lastName = "SMITH";
    const response = await request(server).get(`/customers?lastName=${lastName}`);
    expect(response.status).toBe(200);
    expect(response.body[0].last_name).toBe(lastName);
  });
});
