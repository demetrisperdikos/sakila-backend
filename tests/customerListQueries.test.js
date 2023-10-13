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
describe('GET /customers', () => {
    it('should return a list of customers', done => {
      db.query('SELECT * FROM customer LIMIT 5', [], (err, results) => {
        expect(err).toBeNull();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThanOrEqual(1); // Assuming there is at least one customer
        expect(results[0]).toHaveProperty('customer_id');
        expect(results[0]).toHaveProperty('first_name');
        expect(results[0]).toHaveProperty('last_name');
        done();
      });
    });
  });