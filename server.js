const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');

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


app.get('/generate-customer-report', (req, res) => {
  const doc = new PDFDocument();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=customerReport.pdf');

  doc.pipe(res);

  const query = `
  SELECT c.customer_id, c.first_name, c.last_name, COUNT(r.rental_id) as total_rentals
  FROM customer c
  JOIN rental r ON c.customer_id = r.customer_id
  GROUP BY c.customer_id, c.first_name, c.last_name;
  
  
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.log('Error fetching customer report data:', error);
      return;
    }

    results.forEach((row) => {
      doc.text(`Customer ID: ${row.customer_id}, Name: ${row.first_name} ${row.last_name}, ...`);
    });

    doc.end();
  });
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
  const { customer_id, film_id } = req.body;
  const rental_date = new Date();
  const insertQuery = `
    INSERT INTO rental (rental_date, inventory_id, customer_id, return_date, staff_id)
    VALUES (?, 
    (SELECT inventory_id FROM inventory WHERE film_id = ? LIMIT 1),
    ?, NULL, 1)
  `;

  db.query(insertQuery, [rental_date, film_id, customer_id], (error, results) => {
    if (error) {
      console.error('Error in rent-movie:', error);
      res.status(500).json({ success: false });
    } else {
      res.json({ success: true });
    }
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
app.get('/customer-details/:customer_id', (req, res) => {
  const customer_id = req.params.customer_id;
  let customerDetails = {};

  const customerQuery = 'SELECT * FROM customer WHERE customer_id = ?';
  db.query(customerQuery, [customer_id], (error, results) => {
    if (error) {
      res.status(500).json({ error: 'An error occurred while fetching data' });
      return;
    }

    customerDetails = results[0];
const rentedMoviesQuery = `SELECT 
film.title,
rental.return_date, -- Include return_date in the result set
CASE
    WHEN rental.return_date IS NULL THEN 'Rented'
    ELSE 'Returned'
END AS rental_status
FROM rental
JOIN inventory ON rental.inventory_id = inventory.inventory_id
JOIN film ON inventory.film_id = film.film_id
WHERE rental.customer_id = ?
`;

db.query(rentedMoviesQuery, [customer_id], (error, movies) => {
  if (error) {
    res.status(500).json({ error: 'An error occurred while fetching rented movies' });
    return;
  }
  
  const rentedMovies = movies.filter(movie => movie.return_date === null).map(movie => movie.title);
  const returnedMovies = movies.filter(movie => movie.return_date !== null).map(movie => movie.title);

  customerDetails.rentedMovies = rentedMovies;
  customerDetails.returnedMovies = returnedMovies;

  res.json(customerDetails);
  
    });
  });
});
app.put('/edit-customer-rented-movies/:customer_id', (req, res) => {
  const customer_id = req.params.customer_id;
  const { rentedMovies } = req.body; 

  const deleteQuery = `
    DELETE rental FROM rental
    JOIN inventory ON rental.inventory_id = inventory.inventory_id
    WHERE rental.customer_id = ? AND rental.return_date IS NULL
  `;

  db.query(deleteQuery, [customer_id], (error) => {
    if (error) {
      console.error("Error in deleteQuery:", error); 
      res.status(500).json({ error: 'An error occurred while deleting existing rented movies' });
      return;
    }

    const rental_date = new Date();
    const insertQueries = rentedMovies.map(film_id => {
      return `
        INSERT INTO rental (rental_date, inventory_id, customer_id, return_date, staff_id)
        VALUES ('${rental_date.toISOString().slice(0, 19).replace('T', ' ')}', 
        (SELECT inventory_id FROM inventory WHERE film_id = ${film_id} LIMIT 1),
        ${customer_id}, NULL, 1)
      `;
    });

    Promise.all(insertQueries.map(q => {
      return new Promise((resolve, reject) => {
        db.query(q, (error, results) => {
          if (error) {
            console.error("Error in insertQuery:", error); 
            reject(error);
          }
          else resolve(results);
        });
      });
    }))
    .then(() => {
      res.json({ success: true });
    })
    .catch(error => {
      console.error("Error in Promise.all:", error); 
      res.status(500).json({ error: 'An error occurred while adding new rented movies' });
    });
  });
});

app.put('/edit-customer-returned-movies/:customer_id', (req, res) => {
  const customer_id = req.params.customer_id;
  const { returnedMovies } = req.body; 
  console.log(`Received customer_id: ${customer_id}`);
  console.log(`Received returnedMovies: ${JSON.stringify(returnedMovies)}`);

  const currentDate = new Date();
  const fetchAndUpdateQueries = returnedMovies.map(film_id => {
      return new Promise((resolve, reject) => {
          const fetchQuery = `
              SELECT rental.rental_id FROM rental
              JOIN inventory ON rental.inventory_id = inventory.inventory_id
              WHERE rental.customer_id = ? AND inventory.film_id = ? AND rental.return_date IS NULL
          `;
          db.query(fetchQuery, [customer_id, film_id], (error, results) => {
              if (error) {
                  console.error(`Error in fetchQuery: ${error}`);
                  reject(error);
              } else {
                  if (results.length > 0) {
                      const rental_id = results[0].rental_id;
                      const updateQuery = `
                          UPDATE rental
                          SET return_date = ?
                          WHERE rental_id = ?
                      `;
                      db.query(updateQuery, [currentDate.toISOString().slice(0, 19).replace('T', ' '), rental_id], (error) => {
                          if (error) {
                              console.error(`Error in updateQuery: ${error}`);
                              reject(error);
                          } else {
                              resolve();
                          }
                      });
                  } else {
                      resolve();
                  }
              }
          });
      });
  });

  Promise.all(fetchAndUpdateQueries)
      .then(() => {
          res.json({ success: true });
      })
      .catch(error => {
          console.error(`Error in Promise.all: ${error}`);
          res.status(500).json({ error: 'An error occurred while updating returned movies' });
      });
});


app.put('/edit-customer/:customer_id', (req, res) => {
  const customer_id = req.params.customer_id;
  const { first_name, last_name, email } = req.body;
  let query = 'UPDATE customer SET ';
  let queryParams = [];
  let first = true;

  if (first_name !== undefined) {
    query += (first ? '' : ', ') + 'first_name = ?';
    queryParams.push(first_name);
    first = false;
  }

  if (last_name !== undefined) {
    query += (first ? '' : ', ') + 'last_name = ?';
    queryParams.push(last_name);
    first = false;
  }

  if (email !== undefined) {
    query += (first ? '' : ', ') + 'email = ?';
    queryParams.push(email);
    first = false;
  }

  if (first) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  query += ' WHERE customer_id = ?';
  queryParams.push(customer_id);

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Debug: SQL Error:', error);
      res.status(500).json({ error: 'An error occurred while editing the customer' });
      return;
    }
    res.json({ success: 'Customer successfully edited' });
  });
});

app.delete('/delete-customer/:customer_id', (req, res) => {
  const customer_id = req.params.customer_id;
  
  const deleteQuery = 'DELETE FROM customer WHERE customer_id = ?';
  db.query(deleteQuery, [customer_id], (error) => {
    if (error) {
      res.status(500).json({ error: 'An error occurred while deleting the customer' });
      return;
    }
    res.json({ success: 'Customer deleted successfully' });
  });
});

app.post('/add-customer', (req, res) => {
  const { first_name, last_name, email } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const defaultStoreId = 1;
  const defaultAddressId = 1;

  const query = 'INSERT INTO customer (first_name, last_name, email, store_id, address_id) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [first_name, last_name, email, defaultStoreId, defaultAddressId], (error, results) => {
    if (error) {
      console.error('Error adding customer:', error);
      return res.status(500).json({ error: 'An error occurred while adding the customer' });
    }
    res.json({ success: 'Customer successfully added', customerId: results.insertId });
  });
});

app.put('/updateCustomerEmail/:id', (req, res) => {
  const customerId = req.params.id;
  const { email } = req.body;
  const query = `UPDATE customer SET email = ? WHERE customer_id = ?`;
  
  db.query(query, [email, customerId], (err, result) => {
    if (err) {
      console.log(err);
      res.json({ success: false, message: 'Failed to update email' });
    } else {
      res.json({ success: true, message: 'Email updated successfully' });
    }
  });
});






app.put('/updateCustomerFirstName/:id', (req, res) => {
  const customerId = req.params.id;
  const { first_name } = req.body;
  const query = `UPDATE customer SET first_name = ? WHERE customer_id = ?`;
  
  db.query(query, [first_name, customerId], (err, result) => {
    if (err) {
      console.log(err);
      res.json({ success: false, message: 'Failed to update first name' });
    } else {
      res.json({ success: true, message: 'First name updated successfully' });
    }
  });
});



app.listen(3000, () => {
  console.log('Server started on port 3000');
});