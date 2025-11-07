// config/db.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",       // adapte à ton MySQL
  password: "",       // ton mot de passe
  database: "gestion_materiel",  // ta base
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
