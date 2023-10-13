
const request = require('supertest');
const server = require('../server');
const { db } = require('../server');

afterAll(done => {
    server.close(() => {
        db.end(done);
    });
});

describe('GET /movies', () => {

    it('should return movies filtered by film name', async () => {
        const filmName = "ACADEMY DINOSAUR";  
        const response = await request(server).get(`/movies?search=${filmName}`);
        expect(response.status).toBe(200);
        expect(response.body[0].title).toBe(filmName);
    });

 

});
