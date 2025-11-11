/// config/db.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,       // Render fournit le host
  user: process.env.DB_USER,       // ton user PostgreSQL
  password: process.env.DB_PASSWORD, // mot de passe PostgreSQL
  database: process.env.DB_NAME,   // nom de la base
  port: process.env.DB_PORT || 5432, // port par défaut PostgreSQL
  max: 10,                         // nombre max de connexions
  idleTimeoutMillis: 30000,        // temps avant fermeture d'une connexion inactive
  connectionTimeoutMillis: 2000    // timeout pour nouvelle connexion
});

pool.on('connect', () => {
  console.log('✅ Connexion à PostgreSQL réussie');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion PostgreSQL:', err);
});

module.exports = pool;


