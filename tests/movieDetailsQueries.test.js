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



describe('View Details of the Film', () => {
    it('should return details of a film by film ID', done => {
      db.query('SELECT * FROM film WHERE film_id = ?', [1], (err, results) => {
        expect(err).toBeNull();
        expect(results[0].film_id).toBe(1);
        done();
      });
    });
  });
  