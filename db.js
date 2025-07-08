const { Pool } = require('pg');
const pg = require('pg');

//Create a new pool with the specified configuration
//way 1

// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'thekraqaqish',
//   host: 'localhost',
//   database: 'flavor2',
//   password: '0000',
//   port: 5432,
// });

//way2
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL}) ;


module.exports = pool;
