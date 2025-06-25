const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import des modules locaux
const { testConnection } = require('./config/database');
const { serveStaticFiles, uploadDir } = require('./middleware/upload');

// Import des routes
const authRoutes = require('./routes/auth');
const signalementRoutes = require('./routes/signalements');

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Configuration de la sécurité avec Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour le développement
  crossOriginEmbedderPolicy: false
}));

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Rate limiting - Protection contre les attaques DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requêtes par IP par fenêtre de temps
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting spécifique pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 tentatives de connexion par IP
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.'
  },
  skipSuccessfulRequests: true
});

// Middleware global
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour logger les requêtes (en développement)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Servir les fichiers statiques (images uploadées)
app.use(`/${uploadDir}`, serveStaticFiles);

// Routes API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/signalements', signalementRoutes);

// Route de santé pour vérifier que l'API fonctionne
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API AnaMaaK opérationnelle',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Route pour obtenir les informations sur l'API
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'AnaMaaK Backend API',
      description: 'API pour l\'application de signalements citoyens de Marrakech',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: [
        'Gestion des signalements citoyens',
        'Authentification JWT',
        'Upload de photos',
        'Suivi par code unique',
        'Interface administrateur',
        'Statistiques en temps réel'
      ],
      endpoints: {
        auth: '/api/auth',
        signalements: '/api/signalements',
        health: '/api/health'
      }
    }
  });
});

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
    path: req.originalUrl
  });
});

// Middleware de gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);

  // Erreur de validation JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'JSON invalide dans la requête'
    });
  }

  // Erreur de limite de taille
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Fichier trop volumineux'
    });
  }

  // Erreur générale
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erreur interne du serveur' 
      : error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Fonction pour démarrer le serveur
const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    console.log('🔍 Vérification de la connexion à la base de données...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Impossible de se connecter à la base de données');
      console.error('💡 Assurez-vous que:');
      console.error('   • MySQL est démarré (XAMPP)');
      console.error('   • Les variables d\'environnement sont configurées');
      console.error('   • La base de données existe (lancez: npm run init-db)');
      process.exit(1);
    }

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log('\n🎉 ════════════════════════════════════════════════════════════');
      console.log(`🚀 Serveur AnaMaaK démarré avec succès !`);
      console.log('🎉 ════════════════════════════════════════════════════════════');
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 URL: http://localhost:${PORT}`);
      console.log(`🔧 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`📋 API Info: http://localhost:${PORT}/api/info`);
      console.log('\n📚 ENDPOINTS DISPONIBLES:');
      console.log('   • POST /api/auth/register - Inscription');
      console.log('   • POST /api/auth/login - Connexion');
      console.log('   • GET  /api/auth/profile - Profil utilisateur');
      console.log('   • POST /api/signalements - Créer un signalement');
      console.log('   • GET  /api/signalements/code/{code} - Suivi par code');
      console.log('   • GET  /api/signalements/statistiques - Statistiques');
      console.log('\n💡 COMPTES DE TEST:');
      console.log('   👨‍💼 Admin: admin@marrakech.ma / admin123');
      console.log('   👤 Citoyen: citoyen@marrakech.ma / 123456');
      console.log('🎉 ════════════════════════════════════════════════════════════\n');
    });

    // Gestion propre de l'arrêt du serveur
    process.on('SIGINT', () => {
      console.log('\n🛑 Arrêt du serveur demandé...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Arrêt du serveur...');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Démarrer le serveur si ce fichier est exécuté directement
if (require.main === module) {
  startServer();
}

module.exports = app; 