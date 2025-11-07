const express = require("express");
const mysql = require("mysql2");

const router = express.Router();

// Connexion à MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",          // ✅ adapte si ton user est différent
  password: "",          // ✅ mets ton mot de passe si besoin
  database: "gestion_materiel"  // ✅ ta base de données
});

// 📌 GET tous les stocks
router.get("/", (req, res) => {
  db.query("SELECT * FROM stocks", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// 📌 POST ajouter un stock
router.post("/", (req, res) => {
  const data = req.body;
  const sql = `INSERT INTO stocks 
    (identifiant, nom, description, quantite, quantite_min, quantite_max, unite, prix_unitaire, categorie, fournisseur, emplacement, statut, date_creation, derniere_modification) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), CURDATE())`;

  db.query(sql, [
    data.identifiant, data.nom, data.description, data.quantite,
    data.quantite_min, data.quantite_max, data.unite, data.prix_unitaire,
    data.categorie, data.fournisseur, data.emplacement, data.statut
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, ...data });
  });
});

// 📌 PUT modifier un stock
router.put("/:id", (req, res) => {
  const id = req.params.id;
  const data = req.body;

  const sql = `UPDATE stocks SET 
    identifiant=?, nom=?, description=?, quantite=?, quantite_min=?, quantite_max=?, 
    unite=?, prix_unitaire=?, categorie=?, fournisseur=?, emplacement=?, statut=?, derniere_modification=CURDATE()
    WHERE id=?`;

  db.query(sql, [
    data.identifiant, data.nom, data.description, data.quantite,
    data.quantite_min, data.quantite_max, data.unite, data.prix_unitaire,
    data.categorie, data.fournisseur, data.emplacement, data.statut, id
  ], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Stock mis à jour avec succès" });
  });
});

// 📌 DELETE supprimer un stock
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM stocks WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Stock supprimé avec succès" });
  });
});

module.exports = router;
