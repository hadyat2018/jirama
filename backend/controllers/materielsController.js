const db = require('../config/database');

// Obtenir tous les matériels
const getAllMateriels = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT id, code, type, marque, modele, numero_serie, employe, 
             departement, etat, caracteristique, fonction, 
             DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
      FROM materiels 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des matériels:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir un matériel par ID
const getMaterielById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute(`
      SELECT id, code, type, marque, modele, numero_serie, employe, 
             departement, etat, caracteristique, fonction, 
             DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
      FROM materiels 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Matériel non trouvé' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur lors de la récupération du matériel:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un nouveau matériel
const createMateriel = async (req, res) => {
  const { 
    code, 
    type, 
    marque, 
    modele, 
    numero_serie, 
    employe, 
    departement, 
    etat, 
    caracteristique, 
    fonction 
  } = req.body;

  // Validation des champs requis
  if (!code || !type || !marque || !modele || !numero_serie || !employe || !departement) {
    return res.status(400).json({ 
      message: 'Tous les champs obligatoires doivent être renseignés' 
    });
  }

  try {
    // Vérifier si le numéro de série existe déjà
    const [existingMateriel] = await db.execute(
      'SELECT id FROM materiels WHERE numero_serie = ?',
      [numero_serie]
    );

    if (existingMateriel.length > 0) {
      return res.status(400).json({ 
        message: 'Ce numéro de série existe déjà' 
      });
    }

    const [result] = await db.execute(`
      INSERT INTO materiels (
        code, type, marque, modele, numero_serie, employe, 
        departement, etat, caracteristique, fonction, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      code, 
      type, 
      marque, 
      modele, 
      numero_serie, 
      employe, 
      departement, 
      etat || 'Fonctionnel', 
      caracteristique || null, 
      fonction || null
    ]);

    res.status(201).json({
      message: 'Matériel créé avec succès',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erreur lors de la création du matériel:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un matériel
const updateMateriel = async (req, res) => {
  const { id } = req.params;
  const { 
    code, 
    type, 
    marque, 
    modele, 
    numero_serie, 
    employe, 
    departement, 
    etat, 
    caracteristique, 
    fonction 
  } = req.body;

  // Validation des champs requis
  if (!code || !type || !marque || !modele || !numero_serie || !employe || !departement) {
    return res.status(400).json({ 
      message: 'Tous les champs obligatoires doivent être renseignés' 
    });
  }

  try {
    // Vérifier si le matériel existe
    const [existingMateriel] = await db.execute(
      'SELECT id FROM materiels WHERE id = ?',
      [id]
    );

    if (existingMateriel.length === 0) {
      return res.status(404).json({ message: 'Matériel non trouvé' });
    }

    // Vérifier si le numéro de série existe déjà pour un autre matériel
    const [duplicateSerial] = await db.execute(
      'SELECT id FROM materiels WHERE numero_serie = ? AND id != ?',
      [numero_serie, id]
    );

    if (duplicateSerial.length > 0) {
      return res.status(400).json({ 
        message: 'Ce numéro de série existe déjà pour un autre matériel' 
      });
    }

    await db.execute(`
      UPDATE materiels SET 
        code = ?, 
        type = ?, 
        marque = ?, 
        modele = ?, 
        numero_serie = ?, 
        employe = ?, 
        departement = ?, 
        etat = ?, 
        caracteristique = ?, 
        fonction = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
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
      id
    ]);

    res.json({ message: 'Matériel mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du matériel:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un matériel
const deleteMateriel = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Vérifier si le matériel existe
    const [existingMateriel] = await db.execute(
      'SELECT id FROM materiels WHERE id = ?',
      [id]
    );

    if (existingMateriel.length === 0) {
      return res.status(404).json({ message: 'Matériel non trouvé' });
    }

    await db.execute('DELETE FROM materiels WHERE id = ?', [id]);
    
    res.json({ message: 'Matériel supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du matériel:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Rechercher des matériels
const searchMateriels = async (req, res) => {
  const { q, type, etat, departement } = req.query;
  
  try {
    let query = `
      SELECT id, code, type, marque, modele, numero_serie, employe, 
             departement, etat, caracteristique, fonction, 
             DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at,
             DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') as updated_at
      FROM materiels 
      WHERE 1=1
    `;
    const params = [];

    if (q) {
      query += ` AND (
        code LIKE ? OR 
        marque LIKE ? OR 
        modele LIKE ? OR 
        employe LIKE ? OR 
        caracteristique LIKE ? OR 
        fonction LIKE ?
      )`;
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }

    if (etat) {
      query += ` AND etat = ?`;
      params.push(etat);
    }

    if (departement) {
      query += ` AND departement = ?`;
      params.push(departement);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Obtenir les statistiques des matériels
const getMaterielsStats = async (req, res) => {
  try {
    const [totalCount] = await db.execute(
      'SELECT COUNT(*) as total FROM materiels'
    );

    const [statusStats] = await db.execute(`
      SELECT etat, COUNT(*) as count 
      FROM materiels 
      GROUP BY etat
    `);

    const [typeStats] = await db.execute(`
      SELECT type, COUNT(*) as count 
      FROM materiels 
      GROUP BY type 
      ORDER BY count DESC 
      LIMIT 10
    `);

    const [departmentStats] = await db.execute(`
      SELECT departement, COUNT(*) as count 
      FROM materiels 
      GROUP BY departement 
      ORDER BY count DESC
    `);

    res.json({
      total: totalCount[0].total,
      statusStats,
      typeStats,
      departmentStats
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getAllMateriels,
  getMaterielById,
  createMateriel,
  updateMateriel,
  deleteMateriel,
  searchMateriels,
  getMaterielsStats
};