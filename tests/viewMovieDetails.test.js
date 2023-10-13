
const request = require('supertest');
const server = require('../server');
const { db } = require('../server');

afterAll(done => {
    server.close(() => {
        db.end(done);
    });
});

describe('GET /movie-details/:film_id', () => {

    it('should return details of a film', async () => {
        const filmId = 1; 
        const response = await request(server).get(`/movie-details/${filmId}`);
        expect(response.status).toBe(200);
        expect(response.body.film_id).toBe(filmId);
    });

});
