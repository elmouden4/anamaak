const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Fonction utilitaire pour générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Inscription d'un nouvel utilisateur
const register = async (req, res) => {
  try {
    const { email, password, nom } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await pool.execute(
      'SELECT id FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const [result] = await pool.execute(
      'INSERT INTO utilisateurs (email, mot_de_passe, nom, role, points) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, nom, 'citoyen', 0]
    );

    // Récupérer les informations de l'utilisateur créé
    const [newUser] = await pool.execute(
      'SELECT id, email, nom, role, points, date_inscription FROM utilisateurs WHERE id = ?',
      [result.insertId]
    );

    // Générer le token
    const token = generateToken(result.insertId);

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user: newUser[0],
        token
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Connexion d'un utilisateur
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur par email
    const [users] = await pool.execute(
      'SELECT id, email, mot_de_passe, nom, role, points, actif FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const user = users[0];

    // Vérifier si le compte est actif
    if (!user.actif) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administration'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.mot_de_passe);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Mettre à jour la dernière connexion
    await pool.execute(
      'UPDATE utilisateurs SET derniere_connexion = NOW() WHERE id = ?',
      [user.id]
    );

    // Générer le token
    const token = generateToken(user.id);

    // Retourner les données sans le mot de passe
    const { mot_de_passe, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Déconnexion (blacklist du token)
const logout = async (req, res) => {
  try {
    const token = req.token;

    // Décoder le token pour obtenir la date d'expiration
    const decoded = jwt.decode(token);
    const expirationDate = new Date(decoded.exp * 1000);

    // Ajouter le token à la blacklist
    await pool.execute(
      'INSERT INTO sessions_blacklist (token_hash, date_expiration) VALUES (?, ?)',
      [token, expirationDate]
    );

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir le profil de l'utilisateur connecté
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer les informations complètes de l'utilisateur
    const [users] = await pool.execute(
      'SELECT id, email, nom, role, points, date_inscription, derniere_connexion FROM utilisateurs WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Récupérer les statistiques des signalements de l'utilisateur
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_signalements,
        SUM(CASE WHEN statut = 'soumise' THEN 1 ELSE 0 END) as signalements_soumis,
        SUM(CASE WHEN statut = 'en_traitement' THEN 1 ELSE 0 END) as signalements_en_traitement,
        SUM(CASE WHEN statut = 'resolu' THEN 1 ELSE 0 END) as signalements_resolus,
        SUM(points_attribues) as total_points_signalements
      FROM signalements 
      WHERE utilisateur_id = ?
    `, [userId]);

    res.json({
      success: true,
      data: {
        user: users[0],
        statistiques: stats[0]
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour le profil
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom } = req.body;

    // Valider les données
    if (!nom || nom.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Le nom doit contenir au moins 2 caractères'
      });
    }

    // Mettre à jour les informations
    await pool.execute(
      'UPDATE utilisateurs SET nom = ? WHERE id = ?',
      [nom.trim(), userId]
    );

    // Récupérer les informations mises à jour
    const [users] = await pool.execute(
      'SELECT id, email, nom, role, points, date_inscription FROM utilisateurs WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: {
        user: users[0]
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Valider les données
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Récupérer le mot de passe actuel
    const [users] = await pool.execute(
      'SELECT mot_de_passe FROM utilisateurs WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].mot_de_passe);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await pool.execute(
      'UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword
}; 