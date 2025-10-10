const mysql = require('mysql2/promise');


 
 
const pool = mysql.createPool({
  host: process.env.DB_HOST || '193.203.184.233',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'u207346834_WCadminAi',
  password: process.env.DB_PASSWORD || 't8=Lp[/TxBH',
  database: process.env.DB_NAME || 'u207346834_WCadminAi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


module.exports = pool;
