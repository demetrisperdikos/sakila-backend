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

describe('Customer Queries', () => {
  it('should return a customer by ID', done => {
    db.query('SELECT * FROM customer WHERE customer_id = ?', [1], (err, results) => {
      expect(err).toBeNull();
      expect(results[0].customer_id).toBe(1);
      done();
    });
  });

  it('should return customers by first name', done => {
    db.query('SELECT * FROM customer WHERE first_name = ?', ['JOHN'], (err, results) => {
      expect(err).toBeNull();
      expect(results[0].first_name.toUpperCase()).toBe('JOHN');
      done();
    });
  });
});


describe('Search Customers', () => {
    it('should return customers by last name', done => {
      db.query('SELECT * FROM customer WHERE last_name = ?', ['SMITH'], (err, results) => {
        expect(err).toBeNull();
        expect(results[0].last_name.toUpperCase()).toBe('SMITH');
        done();
      });
    });
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
  
  describe('View Details of the Film', () => {
    it('should return details of a film by film ID', done => {
      db.query('SELECT * FROM film WHERE film_id = ?', [1], (err, results) => {
        expect(err).toBeNull();
        expect(results[0].film_id).toBe(1);
        done();
      });
    });
  });
  