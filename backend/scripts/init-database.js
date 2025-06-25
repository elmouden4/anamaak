const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configuration de connexion pour créer la base
const createDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 3306
};

const DATABASE_NAME = process.env.DB_NAME || 'anamak_db';

async function initDatabase() {
  let connection;
  
  try {
    console.log('🚀 Initialisation de la base de données AnaMaaK...\n');

    // Connexion sans spécifier la base de données
    connection = await mysql.createConnection(createDbConfig);

    // Créer la base de données si elle n'existe pas
    console.log('📦 Création de la base de données...');
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${DATABASE_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.execute(`USE ${DATABASE_NAME}`);
    console.log(`✅ Base de données "${DATABASE_NAME}" créée avec succès\n`);

    // Table des utilisateurs
    console.log('👥 Création de la table des utilisateurs...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        nom VARCHAR(255) NOT NULL,
        role ENUM('citoyen', 'admin') DEFAULT 'citoyen',
        points INT DEFAULT 0,
        date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        derniere_connexion TIMESTAMP NULL,
        actif BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table utilisateurs créée\n');

    // Table des signalements
    console.log('📋 Création de la table des signalements...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS signalements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code_suivi VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(255) NOT NULL,
        autre_type VARCHAR(255) NULL,
        description TEXT NOT NULL,
        localisation VARCHAR(500) NOT NULL,
        quartier VARCHAR(100) NOT NULL,
        latitude DECIMAL(10, 8) NULL,
        longitude DECIMAL(11, 8) NULL,
        photo VARCHAR(255) NULL,
        statut ENUM('soumise', 'en_traitement', 'resolu') DEFAULT 'soumise',
        points_attribues INT DEFAULT 10,
        utilisateur_id INT NULL,
        admin_assigne_id INT NULL,
        commentaire_admin TEXT NULL,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        date_resolution TIMESTAMP NULL,
        priorite ENUM('basse', 'normale', 'haute', 'urgente') DEFAULT 'normale',
        visible_public BOOLEAN DEFAULT TRUE,
        INDEX idx_code_suivi (code_suivi),
        INDEX idx_statut (statut),
        INDEX idx_quartier (quartier),
        INDEX idx_type (type),
        INDEX idx_date_creation (date_creation),
        INDEX idx_utilisateur_id (utilisateur_id),
        FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
        FOREIGN KEY (admin_assigne_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table signalements créée\n');

    // Table d'historique des statuts
    console.log('📊 Création de la table d\'historique des statuts...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS historique_statuts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        signalement_id INT NOT NULL,
        ancien_statut ENUM('soumise', 'en_traitement', 'resolu') NULL,
        nouveau_statut ENUM('soumise', 'en_traitement', 'resolu') NOT NULL,
        commentaire TEXT NULL,
        admin_id INT NULL,
        date_changement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_signalement_id (signalement_id),
        INDEX idx_date_changement (date_changement),
        FOREIGN KEY (signalement_id) REFERENCES signalements(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES utilisateurs(id) ON DELETE SET NULL
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table historique_statuts créée\n');

    // Table des sessions (optionnel pour JWT blacklist)
    console.log('🔐 Création de la table des sessions...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS sessions_blacklist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token_hash VARCHAR(255) NOT NULL,
        date_expiration TIMESTAMP NOT NULL,
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token_hash (token_hash),
        INDEX idx_date_expiration (date_expiration)
      ) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Table sessions_blacklist créée\n');

    // Insertion des données d'exemple
    console.log('📝 Insertion des données d\'exemple...');

    // Hasher les mots de passe
    const motDePasseCitoyen = await bcrypt.hash('123456', 12);
    const motDePasseAdmin = await bcrypt.hash('admin123', 12);

    // Créer les utilisateurs d'exemple
    await connection.execute(`
      INSERT IGNORE INTO utilisateurs (email, mot_de_passe, nom, role, points, date_inscription) VALUES
      ('citoyen@marrakech.ma', ?, 'Ahmed Benali', 'citoyen', 150, '2024-01-15 10:00:00'),
      ('admin@marrakech.ma', ?, 'Fatima El Mansouri', 'admin', 0, '2023-12-01 09:00:00'),
      ('test@marrakech.ma', ?, 'Youssef Alami', 'citoyen', 75, '2024-01-20 14:30:00')
    `, [motDePasseCitoyen, motDePasseAdmin, motDePasseCitoyen]);

    // Récupérer les IDs des utilisateurs créés
    const [users] = await connection.execute('SELECT id, email FROM utilisateurs');
    const citoyenId = users.find(u => u.email === 'citoyen@marrakech.ma')?.id;
    const adminId = users.find(u => u.email === 'admin@marrakech.ma')?.id;
    const testUserId = users.find(u => u.email === 'test@marrakech.ma')?.id;

    // Créer des signalements d'exemple
    await connection.execute(`
      INSERT IGNORE INTO signalements (
        code_suivi, type, description, localisation, quartier, statut, 
        utilisateur_id, date_creation, points_attribues
      ) VALUES
      ('SIG-2024-0001', 'Voirie', 'Grand trou dangereux sur la route principale', 'Avenue Mohammed V', 'Gueliz', 'en_traitement', ?, '2024-01-15 10:30:00', 10),
      ('SIG-2024-0002', 'Éclairage public', 'Lampadaire cassé depuis une semaine', 'Rue de la Liberté', 'Medina', 'soumise', ?, '2024-01-16 15:20:00', 10),
      ('SIG-2024-0003', 'Propreté', 'Dépôt sauvage de déchets près de l école', 'Boulevard Zerktouni', 'Gueliz', 'resolu', ?, '2024-01-14 09:15:00', 15)
    `, [citoyenId, testUserId, citoyenId]);

    // Créer l'historique des statuts pour les signalements
    const [signalements] = await connection.execute('SELECT id, code_suivi, statut FROM signalements');
    
    for (const signalement of signalements) {
      await connection.execute(`
        INSERT INTO historique_statuts (signalement_id, ancien_statut, nouveau_statut, admin_id, commentaire) VALUES
        (?, NULL, 'soumise', NULL, 'Signalement initial')
      `, [signalement.id]);

      if (signalement.statut === 'en_traitement') {
        await connection.execute(`
          INSERT INTO historique_statuts (signalement_id, ancien_statut, nouveau_statut, admin_id, commentaire) VALUES
          (?, 'soumise', 'en_traitement', ?, 'Prise en charge par l équipe technique')
        `, [signalement.id, adminId]);
      }

      if (signalement.statut === 'resolu') {
        await connection.execute(`
          INSERT INTO historique_statuts (signalement_id, ancien_statut, nouveau_statut, admin_id, commentaire) VALUES
          (?, 'soumise', 'en_traitement', ?, 'Prise en charge par l équipe technique'),
          (?, 'en_traitement', 'resolu', ?, 'Problème résolu avec succès')
        `, [signalement.id, adminId, signalement.id, adminId]);
      }
    }

    console.log('✅ Données d\'exemple insérées\n');

    // Afficher un résumé
    const [countUsers] = await connection.execute('SELECT COUNT(*) as count FROM utilisateurs');
    const [countSignalements] = await connection.execute('SELECT COUNT(*) as count FROM signalements');
    const [countHistorique] = await connection.execute('SELECT COUNT(*) as count FROM historique_statuts');

    console.log('📊 RÉSUMÉ DE L\'INITIALISATION:');
    console.log('═══════════════════════════════════');
    console.log(`👥 Utilisateurs créés: ${countUsers[0].count}`);
    console.log(`📋 Signalements créés: ${countSignalements[0].count}`);
    console.log(`📊 Entrées d'historique: ${countHistorique[0].count}`);
    console.log('\n🔑 COMPTES DE TEST:');
    console.log('═══════════════════');
    console.log('👨‍💼 Admin: admin@marrakech.ma / admin123');
    console.log('👤 Citoyen: citoyen@marrakech.ma / 123456');
    console.log('👤 Test: test@marrakech.ma / 123456');
    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('🚀 Vous pouvez maintenant démarrer le serveur avec: npm run dev');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Exécuter l'initialisation si le script est appelé directement
if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Échec de l\'initialisation:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase }; 