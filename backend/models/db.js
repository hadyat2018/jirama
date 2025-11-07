// backend/db.js
const { Pool } = require('pg');
let pool;

if (process.env.NODE_ENV === 'production') {
  // PostgreSQL en ligne (Render)
  pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });
} else {
  // Local XAMPP MySQL
  const mysql = require('mysql2');
  pool = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "ma_base"
  });
}
module.exports = pool;