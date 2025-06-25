const express = require('express');
const router = express.Router();
const { validate, schemas, validateParams } = require('../middleware/validation');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadSignalementPhoto } = require('../middleware/upload');
const Joi = require('joi');
const {
  createSignalement,
  getSignalementByCode,
  getAllSignalements,
  getSignalementById,
  updateStatut,
  getStatistiques
} = require('../controllers/signalementController');

// Schémas de validation pour les paramètres
const paramSchemas = {
  signalementId: Joi.object({
    id: Joi.number().integer().positive().required()
  }),
  codeSuivi: Joi.object({
    code: Joi.string().pattern(/^SIG-\d{4}-\d{4}$/).required().messages({
      'string.pattern.base': 'Format de code invalide. Utilisez le format SIG-YYYY-XXXX'
    })
  })
};

/**
 * @route   POST /api/signalements
 * @desc    Créer un nouveau signalement
 * @access  Public (peut être fait avec ou sans compte)
 */
router.post('/',
  optionalAuth,
  uploadSignalementPhoto,
  validate(schemas.createSignalement),
  createSignalement
);

/**
 * @route   GET /api/signalements
 * @desc    Obtenir tous les signalements avec filtres et pagination
 * @access  Public
 * @query   ?statut=soumise&type=voirie&quartier=gueliz&page=1&limit=20&search=trou&user_only=false
 */
router.get('/', optionalAuth, getAllSignalements);

/**
 * @route   GET /api/signalements/statistiques
 * @desc    Obtenir les statistiques des signalements
 * @access  Public
 */
router.get('/statistiques', getStatistiques);

/**
 * @route   GET /api/signalements/code/:code
 * @desc    Rechercher un signalement par code de suivi
 * @access  Public
 */
router.get('/code/:code',
  validateParams(paramSchemas.codeSuivi),
  getSignalementByCode
);

/**
 * @route   GET /api/signalements/:id
 * @desc    Obtenir un signalement par ID (admin uniquement)
 * @access  Private (Admin)
 */
router.get('/:id',
  authenticateToken,
  requireAdmin,
  validateParams(paramSchemas.signalementId),
  getSignalementById
);

/**
 * @route   PUT /api/signalements/:id/statut
 * @desc    Mettre à jour le statut d'un signalement
 * @access  Private (Admin)
 */
router.put('/:id/statut',
  authenticateToken,
  requireAdmin,
  validateParams(paramSchemas.signalementId),
  validate(schemas.updateStatut),
  updateStatut
);

/**
 * @route   DELETE /api/signalements/:id
 * @desc    Supprimer un signalement (marquer comme invisible)
 * @access  Private (Admin)
 */
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  validateParams(paramSchemas.signalementId),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { pool } = require('../config/database');

      // Vérifier que le signalement existe
      const [signalements] = await pool.execute(
        'SELECT id FROM signalements WHERE id = ?',
        [id]
      );

      if (signalements.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Signalement non trouvé'
        });
      }

      // Marquer comme invisible au lieu de supprimer
      await pool.execute(
        'UPDATE signalements SET visible_public = FALSE WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Signalement supprimé avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la suppression du signalement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
);

/**
 * @route   POST /api/signalements/:id/restaurer
 * @desc    Restaurer un signalement supprimé
 * @access  Private (Admin)
 */
router.post('/:id/restaurer',
  authenticateToken,
  requireAdmin,
  validateParams(paramSchemas.signalementId),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { pool } = require('../config/database');

      // Vérifier que le signalement existe
      const [signalements] = await pool.execute(
        'SELECT id, visible_public FROM signalements WHERE id = ?',
        [id]
      );

      if (signalements.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Signalement non trouvé'
        });
      }

      if (signalements[0].visible_public) {
        return res.status(400).json({
          success: false,
          message: 'Le signalement est déjà visible'
        });
      }

      // Restaurer la visibilité
      await pool.execute(
        'UPDATE signalements SET visible_public = TRUE WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Signalement restauré avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la restauration du signalement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur'
      });
    }
  }
);

module.exports = router; 