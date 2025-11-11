// config/database.js
const { Pool } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

const pool = new Pool(dbConfig);

// Test de connexion
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connexion à PostgreSQL réussie');
    client.release();
  } catch (error) {
    console.error('❌ Erreur de connexion PostgreSQL:', error.message);
  }
};

testConnection();

module.exports = pool;
