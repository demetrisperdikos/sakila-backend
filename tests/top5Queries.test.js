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

describe('Top 5 Movies', () => {
    it('should return the top 5 most rented movies', done => {
      const sql = `
        SELECT film.title, COUNT(rental.rental_id) AS rental_count
        FROM film
        JOIN inventory ON film.film_id = inventory.film_id
        JOIN rental ON inventory.inventory_id = rental.inventory_id
        GROUP BY film.film_id, film.title
        ORDER BY rental_count DESC
        LIMIT 5
      `;
  
      db.query(sql, (err, results) => {
        expect(err).toBeNull();
        expect(results.length).toBe(5); 
  
        done();
      });
    });
  });