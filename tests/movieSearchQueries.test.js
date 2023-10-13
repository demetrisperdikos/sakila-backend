const mysql = require('mysql');
let db;

beforeAll(() => {
  db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Newark123!', 
    database: 'sakila'
  });
  db.connect();
});

afterAll(done => {
  db.end(done);
});

describe('Search Movie by Name', () => {
    it('should return movies by name', done => {
      db.query('SELECT * FROM film WHERE title = ?', ['ACADEMY DINOSAUR'], (err, results) => {
        expect(err).toBeNull();
        expect(results[0].title.toUpperCase()).toBe('ACADEMY DINOSAUR');
        done();
      });
    });
  });
  

  describe('Search Movie by Actor', () => {
    it('should return movies by actor ID', done => {
      db.query('SELECT * FROM film_actor WHERE actor_id = ?', [1], (err, results) => {
        expect(err).toBeNull();
        expect(results[0].actor_id).toBe(1);
        done();
      });
    });
  });
  

  describe('Search Movie by Genre', () => {
    it('should return movies by genre ID', done => {
      db.query('SELECT * FROM film_category WHERE category_id = ?', [1], (err, results) => {
        expect(err).toBeNull();
        expect(results[0].category_id).toBe(1);
        done();
      });
    });
  });