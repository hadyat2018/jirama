// server.js
const express = require('express');
const cors = require('cors');
const materielsRoutes = require('./routes/materielsRoutes');
const employeRoutes = require('./routes/routeEmployer');
const panneRoutes = require('./routes/panneRoute');
const reclamationRoutes = require('./routes/reclamationRoute');
const stocksRoutes = require('./routes/stocksRoutes');
const historiqueRoutes = require('./routes/historiqueRoute');
const tableBordRoutes = require('./routes/tableBordRoute');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000; // Utilise le port fourni par Render

// Middleware
app.use(cors());
app.use(express.json());

// Route test base
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // PostgreSQL
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur base de données');
  }
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'API Gestion Matériel - Serveur en cours d\'exécution',
    endpoints: {
      'Matériels': { 'GET /api/materiels': 'Récupérer tous les matériels' },
      'Employés': { 'GET /api/employes': 'Récupérer tous les employés' },
      'Pannes': { 'GET /api/pannes': 'Récupérer toutes les pannes' },
      'Réclamations': { 'GET /api/reclamations': 'Récupérer toutes les réclamations' },
      'Historique': { 'GET /api/historique': 'Récupérer toutes les interventions' },
      'Tableau de Bord': { 'GET /api/tableau-bord/test': 'Tester la connexion du tableau de bord' }
    }
  });
});

// Routes
app.use('/api/materiels', materielsRoutes);
app.use('/api/employes', employeRoutes);
app.use('/api', panneRoutes);
app.use('/api/reclamations', reclamationRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/historique', historiqueRoutes);
app.use('/api/tableau-bord', tableBordRoutes);

// Middleware erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err.stack);
  res.status(500).json({
    error: 'Une erreur interne du serveur s\'est produite',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
  });
});

// Middleware 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    message: 'La route demandée n\'existe pas'
  });
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
