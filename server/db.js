const mysql = require('mysql2/promise');

const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
requiredVars.forEach((key) => {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
});

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


module.exports = pool;
