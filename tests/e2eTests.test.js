

const request = require('supertest');
const server = require('../server');  
const { db } = require('../server');  

afterAll(done => {
    server.close(() => {
      db.end(done);  
    });
});



describe('End-to-End Tests', () => {
  it('should fetch customer details', async () => {
    const res = await request(server).get('/customer-details/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('first_name');
  });

  it('should search for movies', async () => {
    const res = await request(server).get('/movies?page=1&search=ACADEMY');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fetch a list of customers', async () => {
    const res = await request(server).get('/customers?page=1');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should search for customers', async () => {
    const res = await request(server).get('/customers?page=1&search=SMITH');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fetch movie details', async () => {
    const res = await request(server).get('/movie-details/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title');
  });

  it('should fetch top 5 movies', async () => {
    const res = await request(server).get('/top-5-rented-movies');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
  });


  
});