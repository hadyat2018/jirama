const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gestion_materiel',
  charset: 'utf8mb4'
};

// Créer une connexion à la base de données
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    throw error;
  }
}

// GET - Récupérer tous les employés
router.get('/', async (req, res) => {
  try {
    const connection = await getConnection();
    const { search, departement } = req.query;
    
    let query = 'SELECT * FROM employes WHERE 1=1';
    let params = [];
    
    // Recherche par matricule ou nom complet
    if (search) {
      query += ' AND (matricule LIKE ? OR nom_complet LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }
    
    // Filtrage par département
    if (departement) {
      query += ' AND departement = ?';
      params.push(departement);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query, params);
    await connection.end();
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des employés:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des employés',
      error: error.message
    });
  }
});

// GET - Récupérer un employé par ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const { id } = req.params;
    
    const [rows] = await connection.execute(
      'SELECT * FROM employes WHERE id = ?',
      [id]
    );
    await connection.end();
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'employé',
      error: error.message
    });
  }
});

// POST - Créer un nouvel employé
router.post('/', async (req, res) => {
  try {
    const connection = await getConnection();
    const {
      matricule,
      nom_complet,
      fonction,
      departement,
      site,
      email,
      statut
    } = req.body;
    
    // Validation des champs obligatoires
    if (!matricule || !nom_complet || !fonction || !departement || !site) {
      return res.status(400).json({
        success: false,
        message: 'Les champs matricule, nom complet, fonction, département et site sont obligatoires'
      });
    }
    
    // Vérifier si le matricule existe déjà
    const [existingEmployee] = await connection.execute(
      'SELECT id FROM employes WHERE matricule = ?',
      [matricule]
    );
    
    if (existingEmployee.length > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        message: 'Ce matricule existe déjà'
      });
    }
    
    const [result] = await connection.execute(
      `INSERT INTO employes 
       (matricule, nom_complet, fonction, departement, site, email, statut) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [matricule, nom_complet, fonction, departement, site, email, statut || 'Actif']
    );
    
    // Récupérer l'employé créé
    const [newEmployee] = await connection.execute(
      'SELECT * FROM employes WHERE id = ?',
      [result.insertId]
    );
    
    await connection.end();
    
    res.status(201).json({
      success: true,
      message: 'Employé créé avec succès',
      data: newEmployee[0]
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'employé',
      error: error.message
    });
  }
});

// PUT - Mettre à jour un employé
router.put('/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const { id } = req.params;
    const {
      matricule,
      nom_complet,
      fonction,
      departement,
      site,
      email,
      statut
    } = req.body;
    
    // Validation des champs obligatoires
    if (!matricule || !nom_complet || !fonction || !departement || !site) {
      return res.status(400).json({
        success: false,
        message: 'Les champs matricule, nom complet, fonction, département et site sont obligatoires'
      });
    }
    
    // Vérifier si l'employé existe
    const [existingEmployee] = await connection.execute(
      'SELECT id FROM employes WHERE id = ?',
      [id]
    );
    
    if (existingEmployee.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }
    
    // Vérifier si le matricule existe déjà pour un autre employé
    const [duplicateMatricule] = await connection.execute(
      'SELECT id FROM employes WHERE matricule = ? AND id != ?',
      [matricule, id]
    );
    
    if (duplicateMatricule.length > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        message: 'Ce matricule existe déjà pour un autre employé'
      });
    }
    
    await connection.execute(
      `UPDATE employes 
       SET matricule = ?, nom_complet = ?, fonction = ?, 
           departement = ?, site = ?, email = ?, statut = ?
       WHERE id = ?`,
      [matricule, nom_complet, fonction, departement, site, email, statut, id]
    );
    
    // Récupérer l'employé mis à jour
    const [updatedEmployee] = await connection.execute(
      'SELECT * FROM employes WHERE id = ?',
      [id]
    );
    
    await connection.end();
    
    res.json({
      success: true,
      message: 'Employé mis à jour avec succès',
      data: updatedEmployee[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'employé',
      error: error.message
    });
  }
});

// DELETE - Supprimer un employé
router.delete('/:id', async (req, res) => {
  try {
    const connection = await getConnection();
    const { id } = req.params;
    
    // Vérifier si l'employé existe
    const [existingEmployee] = await connection.execute(
      'SELECT matricule FROM employes WHERE id = ?',
      [id]
    );
    
    if (existingEmployee.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Employé non trouvé'
      });
    }
    
    await connection.execute('DELETE FROM employes WHERE id = ?', [id]);
    await connection.end();
    
    res.json({
      success: true,
      message: 'Employé supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'employé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'employé',
      error: error.message
    });
  }
});

// GET - Récupérer les données de configuration (fonctions, sites)
router.get('/config/data', async (req, res) => {
  try {
    const connection = await getConnection();
    
    // Récupérer les fonctions uniques
    const [fonctions] = await connection.execute(
      'SELECT DISTINCT fonction FROM employes WHERE fonction IS NOT NULL ORDER BY fonction'
    );
    
    // Récupérer les sites uniques
    const [sites] = await connection.execute(
      'SELECT DISTINCT site FROM employes WHERE site IS NOT NULL ORDER BY site'
    );
    
    await connection.end();
    
    // Sites par défaut de Madagascar
    const defaultSites = ['Antananarivo', 'Mahajanga', 'Toamasina', 'Antsirabe', 'Fianarantsoa', 'Toliara', 'Antsiranana', 'Morondava'];
    
    // Fonctions par défaut
    const defaultFonctions = ['Développeur', 'Gestionnaire RH', 'Commercial', 'Comptable', 'Chef de projet'];
    
    res.json({
      success: true,
      data: {
        fonctions: [...new Set([...defaultFonctions, ...fonctions.map(f => f.fonction)])],
        sites: [...new Set([...defaultSites, ...sites.map(s => s.site)])]
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données de configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des données de configuration',
      error: error.message
    });
  }
});

module.exports = router;