require('dotenv').config();
const { Pool } = require('pg');

// Connexion PostgreSQL (Render)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log("✅ Connecté à PostgreSQL (Render)"))
  .catch(err => console.error("❌ Erreur de connexion :", err));

module.exports = pool;
