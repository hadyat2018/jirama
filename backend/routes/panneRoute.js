const express = require("express");
const mysql = require("mysql2");

const router = express.Router();

// Connexion MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",     // ⚠️ adapte avec ton utilisateur MySQL
  password: "",     // ⚠️ adapte avec ton mot de passe MySQL
  database: "gestion_materiel"
});

// ✅ Récupérer toutes les pannes
router.get("/pannes", (req, res) => {
  db.query("SELECT * FROM pannes ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// ✅ Récupérer une panne par ID
router.get("/pannes/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM pannes WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Panne non trouvée" });
    res.json(result[0]);
  });
});

// ✅ Ajouter une panne
router.post("/pannes", (req, res) => {
  const {
    identifiant, materiel, taper, employe,
    departement, description, panne_de_dattes,
    priorite, statut, technicien
  } = req.body;

  const sql = `
    INSERT INTO pannes 
    (identifiant, materiel, taper, employe, departement, description, panne_de_dattes, priorite, statut, technicien)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [identifiant, materiel, taper, employe, departement, description, panne_de_dattes, priorite, statut, technicien],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId, message: "Panne ajoutée avec succès" });
    });
});

// ✅ Modifier une panne
router.put("/pannes/:id", (req, res) => {
  const { id } = req.params;
  const {
    materiel, taper, employe, departement,
    description, panne_de_dattes, priorite, statut, technicien
  } = req.body;

  const sql = `
    UPDATE pannes SET 
      materiel=?, taper=?, employe=?, departement=?, description=?, panne_de_dattes=?, priorite=?, statut=?, technicien=?
    WHERE id=?
  `;

  db.query(sql, [materiel, taper, employe, departement, description, panne_de_dattes, priorite, statut, technicien, id],
    (err) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "Panne modifiée avec succès" });
    });
});

// ✅ Supprimer une panne
router.delete("/pannes/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM pannes WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Panne supprimée avec succès" });
  });
});

module.exports = router;
