const mysql = require('mysql2');
require('dotenv').config();

// Create a pool of connections for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'buganda_heritage'
});

module.exports = pool.promise(); // Use promises for async/await
