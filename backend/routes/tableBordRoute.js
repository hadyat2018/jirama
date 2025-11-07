const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'root', // Remplacez par votre nom d'utilisateur MySQL
  password: '', // Remplacez par votre mot de passe MySQL
  database: 'gestion_materiel',
  charset: 'utf8mb4'
};

// Pool de connexions pour une meilleure performance
let pool;

try {
  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('Pool de connexions créé avec succès pour le tableau de bord');
} catch (error) {
  console.error('Erreur lors de la création du pool de connexions:', error);
}

// Route GET : Récupérer tous les matériels pour le tableau de bord
router.get('/materiels', async (req, res) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    const query = `
      SELECT 
        id,
        code,
        type,
        marque,
        modele,
        numero_serie,
        employe,
        departement,
        etat,
        caracteristique,
        fonction,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as date_creation,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as date_modification
      FROM materiels 
      ORDER BY created_at DESC
    `;
    
    const [rows] = await connection.execute(query);
    
    res.json(rows);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des matériels:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des matériels',
      details: error.message 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Route GET : Récupérer les statistiques générales
router.get('/stats', async (req, res) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total_materiels,
        SUM(CASE WHEN etat = 'Fonctionnel' THEN 1 ELSE 0 END) as fonctionnels,
        SUM(CASE WHEN etat = 'En panne' THEN 1 ELSE 0 END) as en_panne,
        SUM(CASE WHEN etat = 'En maintenance' THEN 1 ELSE 0 END) as en_maintenance,
        COUNT(DISTINCT employe) as total_employes,
        COUNT(DISTINCT departement) as total_departements
      FROM materiels
    `;
    
    const [statsRows] = await connection.execute(statsQuery);
    
    // Récupérer les employés ayant des matériels fonctionnels ET en panne
    const employesMixtesQuery = `
      SELECT employe
      FROM materiels 
      WHERE etat IN ('Fonctionnel', 'En panne')
      GROUP BY employe
      HAVING COUNT(DISTINCT etat) = 2
    `;
    
    const [employesMixtesRows] = await connection.execute(employesMixtesQuery);
    
    const stats = {
      ...statsRows[0],
      employes_fonctionnel_et_panne: employesMixtesRows.length
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques',
      details: error.message 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Route GET : Récupérer les matériels par état
router.get('/materiels/by-etat/:etat', async (req, res) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    const { etat } = req.params;
    
    // Valider l'état
    const etatsValides = ['Fonctionnel', 'En panne', 'En maintenance', 'Hors service'];
    if (!etatsValides.includes(etat)) {
      return res.status(400).json({ 
        error: 'État non valide',
        etats_valides: etatsValides 
      });
    }
    
    const query = `
      SELECT 
        id,
        code,
        type,
        marque,
        modele,
        numero_serie,
        employe,
        departement,
        etat,
        caracteristique,
        fonction,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as date_creation,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as date_modification
      FROM materiels 
      WHERE etat = ?
      ORDER BY created_at DESC
    `;
    
    const [rows] = await connection.execute(query, [etat]);
    
    res.json(rows);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des matériels par état:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des matériels par état',
      details: error.message 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Route GET : Récupérer les matériels des employés ayant des matériels fonctionnels ET en panne
router.get('/materiels/employes-mixtes', async (req, res) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    // Première requête pour trouver les employés ayant des matériels fonctionnels ET en panne
    const employesMixtesQuery = `
      SELECT employe
      FROM materiels 
      WHERE etat IN ('Fonctionnel', 'En panne')
      GROUP BY employe
      HAVING COUNT(DISTINCT etat) = 2
    `;
    
    const [employesMixtesRows] = await connection.execute(employesMixtesQuery);
    const employesMixtes = employesMixtesRows.map(row => row.employe);
    
    if (employesMixtes.length === 0) {
      return res.json([]);
    }
    
    // Deuxième requête pour récupérer tous les matériels de ces employés
    const placeholders = employesMixtes.map(() => '?').join(',');
    const materielsQuery = `
      SELECT 
        id,
        code,
        type,
        marque,
        modele,
        numero_serie,
        employe,
        departement,
        etat,
        caracteristique,
        fonction,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as date_creation,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as date_modification
      FROM materiels 
      WHERE employe IN (${placeholders})
      ORDER BY employe, etat DESC, created_at DESC
    `;
    
    const [materielsRows] = await connection.execute(materielsQuery, employesMixtes);
    
    res.json(materielsRows);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des matériels des employés mixtes:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des matériels des employés mixtes',
      details: error.message 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Route GET : Récupérer les matériels par département
router.get('/materiels/by-departement/:departement', async (req, res) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    const { departement } = req.params;
    
    const query = `
      SELECT 
        id,
        code,
        type,
        marque,
        modele,
        numero_serie,
        employe,
        departement,
        etat,
        caracteristique,
        fonction,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as date_creation,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as date_modification
      FROM materiels 
      WHERE departement = ?
      ORDER BY created_at DESC
    `;
    
    const [rows] = await connection.execute(query, [departement]);
    
    res.json(rows);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des matériels par département:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des matériels par département',
      details: error.message 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Route GET : Récupérer la liste des départements
router.get('/departements', async (req, res) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    const query = `
      SELECT 
        departement,
        COUNT(*) as nombre_materiels
      FROM materiels 
      GROUP BY departement
      ORDER BY departement
    `;
    
    const [rows] = await connection.execute(query);
    
    res.json(rows);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des départements:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des départements',
      details: error.message 
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Route de test de connexion
router.get('/test', async (req, res) => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM materiels');
    
    res.json({
      message: 'Connexion réussie au tableau de bord',
      nombre_materiels: rows[0].count,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur lors du test de connexion:', error);
    res.status(500).json({
      error: 'Erreur lors du test de connexion',
      details: error.message
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;