const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err) => {
  if (err) {
    console.error("❌ Erreur de connexion PostgreSQL :", err);
  } else {
    console.log("✅ Connexion PostgreSQL réussie");
  }
});

module.exports = pool;
