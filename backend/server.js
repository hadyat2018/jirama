const express = require('express');
const cors = require('cors');
const materielsRoutes = require('./routes/materielsRoutes');
const employeRoutes = require('./routes/routeEmployer');
const panneRoutes = require('./routes/panneRoute');
const reclamationRoutes = require('./routes/reclamationRoute');
const stocksRoutes = require('./routes/stocksRoutes');
const historiqueRoutes = require('./routes/historiqueRoute');
const tableBordRoutes = require('./routes/tableBordRoute'); // ✅ Ajout du tableau de bord
const pool = require('./db');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Route de test
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // PostgreSQL
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur base de données');
  }
});
app.get('/', (req, res) => {
  res.json({
    message: 'API Gestion Matériel - Serveur en cours d\'exécution',
    endpoints: {
      'Matériels': {
        'GET /api/materiels': 'Récupérer tous les matériels'
      },
      'Employés': {
        'GET /api/employes': 'Récupérer tous les employés',
        'GET /api/employes/:id': 'Récupérer un employé par ID',
        'POST /api/employes': 'Créer un nouvel employé',
        'PUT /api/employes/:id': 'Mettre à jour un employé',
        'DELETE /api/employes/:id': 'Supprimer un employé',
        'GET /api/employes/config/data': 'Récupérer les données de configuration'
      },
      'Pannes': {
        'GET /api/pannes': 'Récupérer toutes les pannes',
        'GET /api/pannes/:id': 'Récupérer une panne par ID',
        'POST /api/pannes': 'Créer une nouvelle panne',
        'PUT /api/pannes/:id': 'Mettre à jour une panne',
        'DELETE /api/pannes/:id': 'Supprimer une panne',
        'GET /api/techniciens': 'Récupérer tous les techniciens',
        'GET /api/pannes/stats/dashboard': 'Récupérer les statistiques des pannes'
      },
      'Réclamations': {
        'GET /api/reclamations': 'Récupérer toutes les réclamations',
        'POST /api/reclamations': 'Créer une nouvelle réclamation',
        'PUT /api/reclamations/:id': 'Mettre à jour une réclamation',
        'DELETE /api/reclamations/:id': 'Supprimer une réclamation'
      },
      'Historique Interventions': {
        'GET /api/historique': 'Récupérer toutes les interventions',
        'POST /api/historique': 'Créer une nouvelle intervention',
        'PUT /api/historique/:id': 'Mettre à jour une intervention',
        'DELETE /api/historique/:id': 'Supprimer une intervention'
      },
      'Tableau de Bord': { // ✅ Nouvelle section
        'GET /api/tableau-bord/materiels': 'Récupérer tous les matériels pour le tableau de bord',
        'GET /api/tableau-bord/stats': 'Récupérer les statistiques générales',
        'GET /api/tableau-bord/materiels/by-etat/:etat': 'Récupérer les matériels par état',
        'GET /api/tableau-bord/materiels/employes-mixtes': 'Récupérer les matériels des employés mixtes',
        'GET /api/tableau-bord/materiels/by-departement/:departement': 'Récupérer les matériels par département',
        'GET /api/tableau-bord/departements': 'Récupérer la liste des départements',
        'GET /api/tableau-bord/test': 'Tester la connexion du tableau de bord'
      }
    }
  });
});

// Routes spécifiques
app.use('/api/materiels', materielsRoutes);
app.use('/api/employes', employeRoutes);
app.use('/api', panneRoutes);
app.use('/api/reclamations', reclamationRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/historique', historiqueRoutes);
app.use('/api/tableau-bord', tableBordRoutes); // ✅ Ajout de la route tableau de bord

// Middleware de gestion d'erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err.stack);
  res.status(500).json({
    error: 'Une erreur interne du serveur s\'est produite',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
  });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
    message: 'La route demandée n\'existe pas'
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`🚀 Serveur démarré sur http://localhost:${port}`);
  console.log(`📊 Tableau de bord disponible sur http://localhost:${port}/api/tableau-bord/test`);
  console.log('🔗 Routes disponibles:');
  console.log('   - Matériels: /api/materiels');
  console.log('   - Employés: /api/employes');
  console.log('   - Pannes: /api/pannes');
  console.log('   - Réclamations: /api/reclamations');
  console.log('   - Stocks: /api/stocks');
  console.log('   - Historique: /api/historique');
  console.log('   - Tableau de bord: /api/tableau-bord'); // ✅ Log de la nouvelle route
});
