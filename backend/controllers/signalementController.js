const { pool } = require('../config/database');
const { getFileUrl } = require('../middleware/upload');
const moment = require('moment');

// Fonction utilitaire pour générer un code de suivi unique
const generateCodeSuivi = async () => {
  const annee = new Date().getFullYear();
  
  // Compter les signalements de l'année
  const [count] = await pool.execute(
    'SELECT COUNT(*) as total FROM signalements WHERE YEAR(date_creation) = ?',
    [annee]
  );
  
  const numero = (count[0].total + 1).toString().padStart(4, '0');
  return `SIG-${annee}-${numero}`;
};

// Créer un nouveau signalement
const createSignalement = async (req, res) => {
  try {
    const {
      type,
      autre_type,
      description,
      localisation,
      quartier,
      latitude,
      longitude
    } = req.body;

    // Générer un code de suivi unique
    const codeSuivi = await generateCodeSuivi();

    // Gérer la photo si elle est uploadée
    let photoPath = null;
    if (req.file) {
      photoPath = req.file.path.replace(/\\/g, '/'); // Normaliser les chemins Windows
    }

    // Déterminer le type final
    const typeFinal = type === 'Autre (précisez)' ? autre_type : type;

    // Obtenir l'ID de l'utilisateur s'il est connecté
    const utilisateurId = req.user ? req.user.id : null;

    // Insérer le signalement
    const [result] = await pool.execute(`
      INSERT INTO signalements (
        code_suivi, type, autre_type, description, localisation, quartier,
        latitude, longitude, photo, statut, points_attribues, utilisateur_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codeSuivi,
      typeFinal,
      type === 'Autre (précisez)' ? autre_type : null,
      description,
      localisation,
      quartier,
      latitude,
      longitude,
      photoPath,
      'soumise',
      10, // Points par défaut
      utilisateurId
    ]);

    // Créer l'entrée d'historique initial
    await pool.execute(`
      INSERT INTO historique_statuts (signalement_id, ancien_statut, nouveau_statut, commentaire)
      VALUES (?, NULL, 'soumise', 'Signalement initial créé')
    `, [result.insertId]);

    // Mettre à jour les points de l'utilisateur s'il est connecté
    if (utilisateurId) {
      await pool.execute(
        'UPDATE utilisateurs SET points = points + 10 WHERE id = ?',
        [utilisateurId]
      );
    }

    // Récupérer le signalement créé avec toutes les informations
    const [signalement] = await pool.execute(`
      SELECT 
        s.*,
        u.nom as nom_utilisateur,
        u.email as email_utilisateur
      FROM signalements s
      LEFT JOIN utilisateurs u ON s.utilisateur_id = u.id
      WHERE s.id = ?
    `, [result.insertId]);

    const signalementData = signalement[0];

    // Ajouter l'URL de la photo si elle existe
    if (signalementData.photo) {
      signalementData.photo_url = getFileUrl(signalementData.photo);
    }

    res.status(201).json({
      success: true,
      message: 'Signalement créé avec succès',
      data: {
        signalement: signalementData,
        code_suivi: codeSuivi
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création du signalement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Rechercher un signalement par code de suivi
const getSignalementByCode = async (req, res) => {
  try {
    const { code } = req.params;

    // Rechercher le signalement
    const [signalements] = await pool.execute(`
      SELECT 
        s.*,
        u.nom as nom_utilisateur,
        u.email as email_utilisateur
      FROM signalements s
      LEFT JOIN utilisateurs u ON s.utilisateur_id = u.id
      WHERE s.code_suivi = ? AND s.visible_public = TRUE
    `, [code]);

    if (signalements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Signalement non trouvé avec ce code'
      });
    }

    const signalement = signalements[0];

    // Ajouter l'URL de la photo si elle existe
    if (signalement.photo) {
      signalement.photo_url = getFileUrl(signalement.photo);
    }

    // Récupérer l'historique des statuts
    const [historique] = await pool.execute(`
      SELECT 
        hs.*,
        u.nom as nom_admin
      FROM historique_statuts hs
      LEFT JOIN utilisateurs u ON hs.admin_id = u.id
      WHERE hs.signalement_id = ?
      ORDER BY hs.date_changement ASC
    `, [signalement.id]);

    res.json({
      success: true,
      data: {
        signalement,
        historique
      }
    });

  } catch (error) {
    console.error('Erreur lors de la recherche du signalement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir tous les signalements (avec filtres)
const getAllSignalements = async (req, res) => {
  try {
    const {
      statut,
      type,
      quartier,
      page = 1,
      limit = 20,
      search,
      user_only = false
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['s.visible_public = TRUE'];
    let queryParams = [];

    // Filtrer par utilisateur si demandé et utilisateur connecté
    if (user_only === 'true' && req.user) {
      whereConditions.push('s.utilisateur_id = ?');
      queryParams.push(req.user.id);
    }

    // Filtres
    if (statut && statut !== 'tous') {
      whereConditions.push('s.statut = ?');
      queryParams.push(statut);
    }

    if (type && type !== 'tous') {
      whereConditions.push('s.type LIKE ?');
      queryParams.push(`%${type}%`);
    }

    if (quartier && quartier !== 'tous') {
      whereConditions.push('s.quartier = ?');
      queryParams.push(quartier);
    }

    // Recherche textuelle
    if (search) {
      whereConditions.push('(s.description LIKE ? OR s.localisation LIKE ? OR s.code_suivi LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Compter le total
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM signalements s
      LEFT JOIN utilisateurs u ON s.utilisateur_id = u.id
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    // Récupérer les signalements
    const [signalements] = await pool.execute(`
      SELECT 
        s.*,
        u.nom as nom_utilisateur,
        u.email as email_utilisateur
      FROM signalements s
      LEFT JOIN utilisateurs u ON s.utilisateur_id = u.id
      ${whereClause}
      ORDER BY s.date_creation DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    // Ajouter les URLs des photos
    const signalementsWithUrls = signalements.map(signalement => ({
      ...signalement,
      photo_url: signalement.photo ? getFileUrl(signalement.photo) : null
    }));

    res.json({
      success: true,
      data: {
        signalements: signalementsWithUrls,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des signalements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir un signalement par ID (pour les admins)
const getSignalementById = async (req, res) => {
  try {
    const { id } = req.params;

    const [signalements] = await pool.execute(`
      SELECT 
        s.*,
        u.nom as nom_utilisateur,
        u.email as email_utilisateur
      FROM signalements s
      LEFT JOIN utilisateurs u ON s.utilisateur_id = u.id
      WHERE s.id = ?
    `, [id]);

    if (signalements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Signalement non trouvé'
      });
    }

    const signalement = signalements[0];

    // Ajouter l'URL de la photo si elle existe
    if (signalement.photo) {
      signalement.photo_url = getFileUrl(signalement.photo);
    }

    // Récupérer l'historique des statuts
    const [historique] = await pool.execute(`
      SELECT 
        hs.*,
        u.nom as nom_admin
      FROM historique_statuts hs
      LEFT JOIN utilisateurs u ON hs.admin_id = u.id
      WHERE hs.signalement_id = ?
      ORDER BY hs.date_changement ASC
    `, [id]);

    res.json({
      success: true,
      data: {
        signalement,
        historique
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du signalement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour le statut d'un signalement (admin seulement)
const updateStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, commentaire } = req.body;
    const adminId = req.user.id;

    // Vérifier que le signalement existe
    const [signalements] = await pool.execute(
      'SELECT * FROM signalements WHERE id = ?',
      [id]
    );

    if (signalements.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Signalement non trouvé'
      });
    }

    const signalement = signalements[0];
    const ancienStatut = signalement.statut;

    // Ne pas mettre à jour si le statut est le même
    if (ancienStatut === statut) {
      return res.status(400).json({
        success: false,
        message: 'Le signalement a déjà ce statut'
      });
    }

    // Mettre à jour le signalement
    const updateFields = ['statut = ?', 'admin_assigne_id = ?'];
    const updateParams = [statut, adminId];

    if (commentaire) {
      updateFields.push('commentaire_admin = ?');
      updateParams.push(commentaire);
    }

    if (statut === 'resolu') {
      updateFields.push('date_resolution = NOW()');
    }

    updateParams.push(id);

    await pool.execute(`
      UPDATE signalements 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateParams);

    // Ajouter à l'historique
    await pool.execute(`
      INSERT INTO historique_statuts (signalement_id, ancien_statut, nouveau_statut, admin_id, commentaire)
      VALUES (?, ?, ?, ?, ?)
    `, [id, ancienStatut, statut, adminId, commentaire || `Statut changé de ${ancienStatut} à ${statut}`]);

    // Attribuer des points bonus si résolu
    if (statut === 'resolu' && signalement.utilisateur_id) {
      await pool.execute(
        'UPDATE utilisateurs SET points = points + 5 WHERE id = ?',
        [signalement.utilisateur_id]
      );
    }

    // Récupérer le signalement mis à jour
    const [updatedSignalement] = await pool.execute(`
      SELECT 
        s.*,
        u.nom as nom_utilisateur,
        u.email as email_utilisateur,
        admin.nom as nom_admin
      FROM signalements s
      LEFT JOIN utilisateurs u ON s.utilisateur_id = u.id
      LEFT JOIN utilisateurs admin ON s.admin_assigne_id = admin.id
      WHERE s.id = ?
    `, [id]);

    res.json({
      success: true,
      message: `Statut mis à jour vers "${statut}" avec succès`,
      data: {
        signalement: updatedSignalement[0]
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir les statistiques des signalements
const getStatistiques = async (req, res) => {
  try {
    // Statistiques globales
    const [statsGlobales] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'soumise' THEN 1 ELSE 0 END) as soumis,
        SUM(CASE WHEN statut = 'en_traitement' THEN 1 ELSE 0 END) as en_traitement,
        SUM(CASE WHEN statut = 'resolu' THEN 1 ELSE 0 END) as resolus,
        AVG(CASE 
          WHEN statut = 'resolu' AND date_resolution IS NOT NULL 
          THEN DATEDIFF(date_resolution, date_creation) 
          ELSE NULL 
        END) as temps_moyen_resolution
      FROM signalements
      WHERE visible_public = TRUE
    `);

    // Statistiques par quartier
    const [statsQuartiers] = await pool.execute(`
      SELECT 
        quartier,
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'resolu' THEN 1 ELSE 0 END) as resolus
      FROM signalements
      WHERE visible_public = TRUE
      GROUP BY quartier
      ORDER BY total DESC
    `);

    // Statistiques par type
    const [statsTypes] = await pool.execute(`
      SELECT 
        type,
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'resolu' THEN 1 ELSE 0 END) as resolus
      FROM signalements
      WHERE visible_public = TRUE
      GROUP BY type
      ORDER BY total DESC
      LIMIT 10
    `);

    // Évolution par mois (6 derniers mois)
    const [evolution] = await pool.execute(`
      SELECT 
        YEAR(date_creation) as annee,
        MONTH(date_creation) as mois,
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'resolu' THEN 1 ELSE 0 END) as resolus
      FROM signalements
      WHERE visible_public = TRUE 
        AND date_creation >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY YEAR(date_creation), MONTH(date_creation)
      ORDER BY annee DESC, mois DESC
    `);

    res.json({
      success: true,
      data: {
        globales: statsGlobales[0],
        par_quartier: statsQuartiers,
        par_type: statsTypes,
        evolution: evolution
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  createSignalement,
  getSignalementByCode,
  getAllSignalements,
  getSignalementById,
  updateStatut,
  getStatistiques
}; 