const express = require("express");
const mysql = require("mysql2");
const router = express.Router();

// Connexion MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // ⚠️ adapte selon ton utilisateur
  password: "",       // ⚠️ ton mot de passe MySQL
  database: "gestion_materiel"
});

// ✅ Récupérer toutes les réclamations
router.get("/", (req, res) => {
  db.query("SELECT * FROM reclamations ORDER BY date_creation DESC", (err, results) => {
    if (err) {
      console.error("Erreur MySQL:", err);
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// ✅ Récupérer une réclamation par ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM reclamations WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Erreur MySQL:", err);
      return res.status(500).json({ error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Réclamation non trouvée" });
    }
    res.json(results[0]);
  });
});

// ✅ Créer une nouvelle réclamation
router.post("/", (req, res) => {
  const {
    numero,
    date_reclamation,
    materiel_concerne,
    employe_demandeur,
    departement,
    type_reclamation,
    priorite,
    statut,
    technicien_assigne,
    description_probleme,
    date_creation,
    date_resolution
  } = req.body;

  const sql = `
    INSERT INTO reclamations
    (numero, date_reclamation, materiel_concerne, employe_demandeur, departement, type_reclamation, priorite, statut, technicien_assigne, description_probleme, date_creation, date_resolution)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      numero,
      date_reclamation,
      materiel_concerne,
      employe_demandeur,
      departement,
      type_reclamation,
      priorite,
      statut,
      technicien_assigne,
      description_probleme,
      date_creation,
      date_resolution,
    ],
    (err, result) => {
      if (err) {
        console.error("Erreur MySQL:", err);
        return res.status(500).json({ error: err });
      }
      res.json({ id: result.insertId, ...req.body });
    }
  );
});

// ✅ Modifier une réclamation
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  db.query("UPDATE reclamations SET ? WHERE id = ?", [fields, id], (err, result) => {
    if (err) {
      console.error("Erreur MySQL:", err);
      return res.status(500).json({ error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Réclamation non trouvée" });
    }
    res.json({ message: "Réclamation mise à jour avec succès" });
  });
});

// ✅ Supprimer une réclamation
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM reclamations WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erreur MySQL:", err);
      return res.status(500).json({ error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Réclamation non trouvée" });
    }
    res.json({ message: "Réclamation supprimée avec succès" });
  });
});

module.exports = router;