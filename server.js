// server.js
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = { pool };

const homeRouter = require('./routes/home');
const recipesRouter = require('./routes/recipes');
const favoritesRouter = require('./routes/favorites');

app.use('/', homeRouter);
app.use('/recipes', recipesRouter);
app.use('/favorites', favoritesRouter);

// التأكد من الاتصال بالداتا وإطلاق السيرفر
pool.connect()
  .then(client => {
    return client.query('SELECT current_database(), current_user')
      .then(res => {
        client.release();
        const dbName = res.rows[0].current_database;
        const dbUser = res.rows[0].current_user;
        console.log(`Connected to ${dbName} as user ${dbUser}`);
      });
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});