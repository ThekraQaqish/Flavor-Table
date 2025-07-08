const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const axios = require('axios');
require('dotenv').config();

const port =process.env.PORT || 3000;

const pg = require('pg');
app.use(express.json()); // حتى نقرأ body من POST/PUT

const pool = require('./db');




app.use(express.json());
app.use(express.static('public'));

const homeRouter=require('./routes/home')
app.use('/',homeRouter);

const recipesRouter=require('./routes/recipes')
app.use('/recipes',recipesRouter);

const auth =require('./routes/auth')
app.use('/user',auth);




//start the datadbase server 
pool
.connect()
.then(() => {
  console.log('Connected to the databas');
  // Start the node.js server
  app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
})
.catch((error) => {
  console.error('Error connecting to the database:', error);
});

// const result =pool.query('SELECT * FROM rec')
//   .then((result)=> {
//     console.log(result.rows[0]); // البيانات اللي رجعت من قاعدة البيانات
//   })
//   .catch(error => {
//     console.error('Error while querying the database:', error);
//   });