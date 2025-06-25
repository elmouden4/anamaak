const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Créer le dossier uploads s'il n'existe pas
const uploadDir = process.env.UPLOAD_PATH || 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Organiser par date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const dateDir = path.join(uploadDir, year.toString(), month, day);
    
    // Créer le répertoire s'il n'existe pas
    if (!fs.existsSync(dateDir)) {
      fs.mkdirSync(dateDir, { recursive: true });
    }
    
    cb(null, dateDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique avec timestamp et hash
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `signalement_${timestamp}_${randomHash}${extension}`;
    
    cb(null, filename);
  }
});

// Filtres pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  // Types MIME autorisés pour les images
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Type de fichier non autorisé. Seules les images sont acceptées (JPEG, PNG, GIF, WebP)');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configuration multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB par défaut
    files: 1 // Un seul fichier par signalement
  }
});

// Middleware pour gérer les erreurs d'upload
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'Fichier trop volumineux. Taille maximum: 5MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Trop de fichiers. Un seul fichier autorisé'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Champ de fichier inattendu'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de l\'upload du fichier'
        });
    }
  }

  if (error && error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Middleware pour l'upload d'une photo de signalement
const uploadSignalementPhoto = [
  upload.single('photo'),
  handleUploadError
];

// Fonction utilitaire pour supprimer un fichier
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      return resolve();
    }

    const fullPath = path.join(process.cwd(), filePath);
    
    fs.access(fullPath, fs.constants.F_OK, (err) => {
      if (err) {
        // Le fichier n'existe pas, pas d'erreur
        return resolve();
      }

      fs.unlink(fullPath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Erreur lors de la suppression du fichier:', unlinkErr);
          return reject(unlinkErr);
        }
        resolve();
      });
    });
  });
};

// Fonction pour obtenir l'URL publique d'un fichier
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

// Middleware pour servir les fichiers statiques
const serveStaticFiles = (req, res, next) => {
  const filePath = req.path.substring(1); // Enlever le '/' du début
  const fullPath = path.join(process.cwd(), filePath);
  
  // Vérifier que le fichier est dans le dossier uploads
  if (!filePath.startsWith(uploadDir)) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }

  // Vérifier l'existence du fichier
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({
        success: false,
        message: 'Fichier non trouvé'
      });
    }

    // Servir le fichier
    res.sendFile(fullPath);
  });
};

module.exports = {
  uploadSignalementPhoto,
  deleteFile,
  getFileUrl,
  serveStaticFiles,
  uploadDir
}; 