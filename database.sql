-- Création de la base de données
CREATE DATABASE IF NOT EXISTS gestion_materiel;
USE gestion_materiel;

-- Création de la table materiels
CREATE TABLE IF NOT EXISTS materiels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    marque_modele VARCHAR(100) NOT NULL,
    numero_serie VARCHAR(100) NOT NULL UNIQUE,
    employe VARCHAR(100) NOT NULL,
    departement VARCHAR(100) NOT NULL,
    etat ENUM('Fonctionnel', 'En panne', 'En maintenance', 'Hors service') NOT NULL DEFAULT 'Fonctionnel',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertion de quelques données d'exemple
INSERT INTO materiels (code, type, marque_modele, numero_serie, employe, departement, etat) VALUES
('CPU-001', 'processeur', 'Dell OptiPlex 7090', 'DL7090001', 'RAKOTO Jean', 'IL', 'Fonctionnel'),
('PTB-001', 'PTB', 'HP EliteBook 840', 'HPB40001', 'RABE Marie', 'FINANCE', 'En panne'),
('IMP-001', 'imprimante', 'Canon Pixma MX922', 'CPX922001', 'RANDRIA Paul', 'RH', 'Fonctionnel'),
('ECR-001', 'écran', 'Samsung 24" LED', 'SAM24001', 'RASOAMALALA Lisa', 'COMPTABILITE', 'En maintenance'),
('SOU-001', 'souris', 'Logitech MX Master 3', 'LOG003001', 'ANDRIANTSOA Michel', 'IL', 'Fonctionnel');

-- Création d'un index sur les colonnes souvent utilisées pour la recherche
CREATE INDEX idx_materiel_search ON materiels(code, marque_modele, employe, departement);
CREATE INDEX idx_materiel_type ON materiels(type);
CREATE INDEX idx_materiel_etat ON materiels(etat);