const db = require('../config/database');

class Materiel {
  static async getAll() {
    try {
      const [rows] = await db.execute(`
        SELECT 
          m.id,
          m.code,
          m.type,
          m.marque_modele,
          m.numero_serie,
          COALESCE(CONCAT(e.prenom, ' ', e.nom), 'Non assigné') as employe,
          COALESCE(d.nom, 'Aucun département') as departement,
          m.etat
        FROM materiels m
        LEFT JOIN employes e ON m.employe_id = e.id
        LEFT JOIN departements d ON e.departement_id = d.id
        ORDER BY m.date_creation DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.execute(`
        SELECT 
          m.*,
          COALESCE(CONCAT(e.prenom, ' ', e.nom), 'Non assigné') as employe,
          COALESCE(d.nom, 'Aucun département') as departement
        FROM materiels m
        LEFT JOIN employes e ON m.employe_id = e.id
        LEFT JOIN departements d ON e.departement_id = d.id
        WHERE m.id = ?
      `, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(materielData) {
    try {
      const { code, type, marque_modele, numero_serie, employe_id, etat } = materielData;
      const [result] = await db.execute(`
        INSERT INTO materiels (code, type, marque_modele, numero_serie, employe_id, etat)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [code, type, marque_modele, numero_serie, employe_id, etat]);
      
      return this.getById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  static async markAsRepaired(id) {
    try {
      await db.execute(`
        UPDATE materiels 
        SET etat = 'Fonctionnel', date_modification = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [id]);
      
      return this.getById(id);
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.execute('DELETE FROM materiels WHERE id = ?', [id]);
      return result