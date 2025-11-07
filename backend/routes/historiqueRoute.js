const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// ✅ Connexion MySQL directement ici
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // identifiant XAMPP par défaut
  password: '',      // mot de passe vide si tu n’en as pas mis
  database: 'gestion_materiel'
});

// Test connexion
db.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion MySQL:', err);
  } else {
    console.log('✅ Connecté à MySQL (XAMPP) [Historique]');
  }
});

// 📌 Récupérer toutes les interventions
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM interventions ORDER BY date_intervention DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Erreur SELECT interventions:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
});

// 📌 Ajouter une intervention
router.post('/', (req, res) => {
  const data = req.body;
  const sql = `
    INSERT INTO interventions 
    (date_intervention, materiel, type_intervention, technicien, duree, statut, cout, description, pieces_utilisees)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.date_intervention,
    data.materiel,
    data.type_intervention,
    data.technicien,
    data.duree,
    data.statut || 'Terminé',
    data.cout || 0,
    data.description || '',
    data.pieces_utilisees || ''
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Erreur INSERT intervention:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(201).json({ id: result.insertId, ...data });
  });
});

// 📌 Modifier une intervention
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const sql = `
    UPDATE interventions 
    SET date_intervention=?, materiel=?, type_intervention=?, technicien=?, duree=?, statut=?, cout=?, description=?, pieces_utilisees=?
    WHERE id=?
  `;
  const values = [
    data.date_intervention,
    data.materiel,
    data.type_intervention,
    data.technicien,
    data.duree,
    data.statut,
    data.cout || 0,
    data.description || '',
    data.pieces_utilisees || '',
    id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Erreur UPDATE intervention:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Intervention non trouvée' });
    }
    res.json({ id, ...data });
  });
});

// 📌 Supprimer une intervention
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM interventions WHERE id=?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('❌ Erreur DELETE intervention:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Intervention non trouvée' });
    }
    res.json({ message: '✅ Intervention supprimée' });
  });
});

module.exports = router;
