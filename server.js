const express = require('express');
const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Health check endpoint
app.get('/health-check', (req, res) => {
    res.send('Hello World');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const mysql = require('mysql');

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
    console.log('Connected to the database.');
});

app.get('/films', (req, res) => {
    const query = 'SELECT title FROM film';

    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send({ error: 'Database query failed' });
            return;
        }
        res.send(results);
    });
});
