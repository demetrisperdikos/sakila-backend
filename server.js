const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Newark123!', 
  database: 'sakila'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected...');
});


app.get('/top-5-rented-movies', (req, res) => {
  const query = `
  SELECT film.*, COUNT(rental.rental_id) as num_rentals, GROUP_CONCAT(DISTINCT category.name) as genres, GROUP_CONCAT(DISTINCT CONCAT(actor.first_name, ' ', actor.last_name)) as actors
FROM film
LEFT JOIN inventory ON film.film_id = inventory.film_id
LEFT JOIN rental ON inventory.inventory_id = rental.inventory_id
LEFT JOIN film_category ON film.film_id = film_category.film_id
LEFT JOIN category ON film_category.category_id = category.category_id
LEFT JOIN film_actor ON film.film_id = film_actor.film_id
LEFT JOIN actor ON film_actor.actor_id = actor.actor_id
GROUP BY film.film_id
ORDER BY num_rentals DESC
LIMIT 5

  `;

  db.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'An error occurred while fetching data' });
      return;
    }
    res.json(results);
  });
});



app.get('/top-actors', (req, res) => {
  const query = `
  SELECT actor.*, COUNT(film_actor.film_id) as num_films, GROUP_CONCAT(DISTINCT film.title) as movies
  FROM actor
  JOIN film_actor ON actor.actor_id = film_actor.actor_id
  JOIN film ON film_actor.film_id = film.film_id
  GROUP BY actor.actor_id
  ORDER BY num_films DESC
  LIMIT 5
  
  `;

  db.query(query, (error, results) => {
    if (error) {
      res.status(500).json({ error: 'An error occurred while fetching data' });
      return;
    }
    res.json(results);
  });
});


app.listen(3000, () => {
  console.log('Server started on port 3000');
});
// API endpoint to get all movies
app.get('/all-movies', (req, res) => {
  const query = 'SELECT * FROM film';  // gets all movies
  db.query(query, (error, results) => {
      if (error) {
          res.status(500).json({ error: 'An error occurred while fetching data' });
          return;
      }
      res.json(results);
  });
});
app.get('/movies', (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let searchTerm = req.query.search || '';
  const offset = (page - 1) * 20;

  let query = `
      SELECT DISTINCT film.*
      FROM film
      LEFT JOIN film_actor ON film.film_id = film_actor.film_id
      LEFT JOIN actor ON film_actor.actor_id = actor.actor_id
      LEFT JOIN film_category ON film.film_id = film_category.film_id
      LEFT JOIN category ON film_category.category_id = category.category_id
      WHERE film.title LIKE '%${searchTerm}%' 
      OR actor.first_name LIKE '%${searchTerm}%'
      OR actor.last_name LIKE '%${searchTerm}%'
      OR category.name LIKE '%${searchTerm}%'
      LIMIT 20 OFFSET ${offset}`;

  db.query(query, (error, results) => {
      if (error) {
          res.status(500).json({ error: 'An error occurred while fetching data' });
          return;
      }
      res.json(results);
  });
});
// API endpoint to get movie details
app.get('/movie-details/:film_id', (req, res) => {
  const film_id = req.params.film_id;
  const query = `
      SELECT film.*, GROUP_CONCAT(DISTINCT CONCAT(actor.first_name, ' ', actor.last_name)) as actors, GROUP_CONCAT(DISTINCT category.name) as genres
      FROM film
      LEFT JOIN film_actor ON film.film_id = film_actor.film_id
      LEFT JOIN actor ON film_actor.actor_id = actor.actor_id
      LEFT JOIN film_category ON film.film_id = film_category.film_id
      LEFT JOIN category ON film_category.category_id = category.category_id
      WHERE film.film_id = ?
      GROUP BY film.film_id
  `;

  db.query(query, [film_id], (error, results) => {
      if (error) {
          res.status(500).json({ error: 'An error occurred while fetching data' });
          return;
      }
      res.json(results[0]);
  });
});
// API endpoint to rent a film to a customer
app.post('/rent-film', (req, res) => {
  const { film_id, customer_id } = req.body;
  const rental_date = new Date();
  const query = `
      INSERT INTO rentals (film_id, customer_id, rental_date)
      VALUES (?, ?, ?)
  `;

  db.query(query, [film_id, customer_id, rental_date], (error, results) => {
      if (error) {
          res.status(500).json({ error: 'An error occurred while renting the film' });
          return;
      }
      res.json({ success: 'Film successfully rented', rentalId: results.insertId });
  });
});

app.post('/rent-movie', (req, res) => {
  const { film_id, customer_id } = req.body;
  
  const rental_date = new Date();
  const return_date = new Date();
  return_date.setDate(return_date.getDate() + 7); 
  
  const query = `
      INSERT INTO rental (rental_date, inventory_id, customer_id, return_date, staff_id)
      VALUES (?, 1, ?, ?, 1);
  `;

  db.query(query, [rental_date, customer_id, return_date], (error, results) => {
      if (error) {
          res.status(500).json({ error: 'An error occurred while renting the movie' });
          return;
      }
      res.json({ success: 'Movie successfully rented' });
  });
});

app.get('/customers', (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let searchTerm = req.query.search || '';
  const itemsPerPage = 20;
  const offset = (page - 1) * itemsPerPage;

  let query = `
      SELECT *
      FROM customer
      WHERE first_name LIKE '%${searchTerm}%' OR last_name LIKE '%${searchTerm}%' OR customer_id LIKE '%${searchTerm}%'
      LIMIT ${itemsPerPage} OFFSET ${offset}
  `;

  db.query(query, (error, results) => {
    if (error) {
        res.status(500).json({ error: 'An error occurred while fetching customers' });
        return;
    }
    res.json(results);
  });
});



// API endpoint to fetch individual customer details
app.get('/customer-details/:customer_id', (req, res) => {
  const customer_id = req.params.customer_id;
  const query = 'SELECT * FROM customer WHERE customer_id = ?';
  db.query(query, [customer_id], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'An error occurred while fetching data' });
      return;
    }
    res.json(results[0]);
  });
});

// API endpoint to add a new customer
app.post('/add-customer', (req, res) => {
  const { first_name, last_name, email, address } = req.body;
  const query = 'INSERT INTO customer (first_name, last_name, email, address) VALUES (?, ?, ?, ?)';
  db.query(query, [first_name, last_name, email, address], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'An error occurred while adding the customer' });
      return;
    }
    res.json({ success: 'Customer successfully added', customerId: results.insertId });
  });
});

// API endpoint to edit customer details
app.put('/edit-customer/:customer_id', (req, res) => {
  const customer_id = req.params.customer_id;
  const { first_name, last_name, email, address } = req.body;
  const query = 'UPDATE customer SET first_name = ?, last_name = ?, email = ?, address = ? WHERE customer_id = ?';
  db.query(query, [first_name, last_name, email, address, customer_id], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'An error occurred while editing the customer' });
      return;
    }
    res.json({ success: 'Customer successfully edited' });
  });
});

app.delete('/delete-customer/:customer_id', (req, res) => {
  const customer_id = req.params.customer_id;
  const query = 'DELETE FROM customer WHERE customer_id = ?';
  db.query(query, [customer_id], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'An error occurred while deleting the customer' });
      return;
    }
    res.json({ success: 'Customer successfully deleted' });
  });
});
