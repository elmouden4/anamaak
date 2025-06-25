const Joi = require('joi');

// Schémas de validation
const schemas = {
  // Validation pour l'inscription
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Le mot de passe doit contenir au moins 6 caractères',
      'any.required': 'Mot de passe requis'
    }),
    nom: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut pas dépasser 100 caractères',
      'any.required': 'Nom requis'
    })
  }),

  // Validation pour la connexion
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email invalide',
      'any.required': 'Email requis'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Mot de passe requis'
    })
  }),

  // Validation pour créer un signalement
  createSignalement: Joi.object({
    type: Joi.string().min(2).max(255).required().messages({
      'string.min': 'Le type doit contenir au moins 2 caractères',
      'string.max': 'Le type ne peut pas dépasser 255 caractères',
      'any.required': 'Type requis'
    }),
    autre_type: Joi.string().max(255).allow('', null).messages({
      'string.max': 'Le type personnalisé ne peut pas dépasser 255 caractères'
    }),
    description: Joi.string().min(10).max(2000).required().messages({
      'string.min': 'La description doit contenir au moins 10 caractères',
      'string.max': 'La description ne peut pas dépasser 2000 caractères',
      'any.required': 'Description requise'
    }),
    localisation: Joi.string().min(5).max(500).required().messages({
      'string.min': 'La localisation doit contenir au moins 5 caractères',
      'string.max': 'La localisation ne peut pas dépasser 500 caractères',
      'any.required': 'Localisation requise'
    }),
    quartier: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Le quartier doit contenir au moins 2 caractères',
      'string.max': 'Le quartier ne peut pas dépasser 100 caractères',
      'any.required': 'Quartier requis'
    }),
    latitude: Joi.number().min(-90).max(90).allow(null).messages({
      'number.min': 'Latitude invalide',
      'number.max': 'Latitude invalide'
    }),
    longitude: Joi.number().min(-180).max(180).allow(null).messages({
      'number.min': 'Longitude invalide',
      'number.max': 'Longitude invalide'
    })
  }),

  // Validation pour modifier le statut d'un signalement
  updateStatut: Joi.object({
    statut: Joi.string().valid('soumise', 'en_traitement', 'resolu').required().messages({
      'any.only': 'Statut invalide. Valeurs autorisées: soumise, en_traitement, resolu',
      'any.required': 'Statut requis'
    }),
    commentaire: Joi.string().max(1000).allow('', null).messages({
      'string.max': 'Le commentaire ne peut pas dépasser 1000 caractères'
    })
  }),

  // Validation pour rechercher un signalement par code
  searchByCode: Joi.object({
    code: Joi.string().pattern(/^SIG-\d{4}-\d{4}$/).required().messages({
      'string.pattern.base': 'Format de code invalide. Utilisez le format SIG-YYYY-XXXX',
      'any.required': 'Code de suivi requis'
    })
  })
};

// Fonction générique de validation
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors
      });
    }

    next();
  };
};

// Validation spécifique pour les paramètres de requête
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors
      });
    }

    next();
  };
};

// Validation spécifique pour les paramètres d'URL
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.params, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Paramètres d\'URL invalides',
        errors
      });
    }

    next();
  };
};

module.exports = {
  schemas,
  validate,
  validateQuery,
  validateParams
}; 