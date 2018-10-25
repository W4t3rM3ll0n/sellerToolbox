// Dependencies
require('dotenv').config();

// Instantiate Container
const db = {};

db.getDbConnectionString = function() {
  return { 
    database: process.env.DB_ROUTE, 
    secret: process.env.DB_SECRET
  }
}

module.exports = db;
