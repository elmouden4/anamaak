# 🏛️ AnaMaaK Backend API

Backend pour l'application de signalements citoyens **AnaMaaK** de Marrakech, développé avec Node.js, Express et MySQL.

## 🚀 Installation et Configuration

### Prérequis

- **Node.js** (version 16 ou supérieure)
- **MySQL** (via XAMPP ou installation standalone)
- **npm** ou **pnpm**

### Installation

1. **Cloner le projet et installer les dépendances**
```bash
cd backend
npm install
```

2. **Configurer les variables d'environnement**
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Modifier les variables selon votre configuration
nano .env
```

3. **Démarrer MySQL (XAMPP)**
- Ouvrir XAMPP Control Panel
- Démarrer Apache et MySQL
- Ouvrir phpMyAdmin (http://localhost/phpmyadmin)

4. **Initialiser la base de données**
```bash
npm run init-db
```

5. **Démarrer le serveur**
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

## 📊 Structure de la Base de Données

### Tables principales

#### `utilisateurs`
```sql
- id (INT, PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- mot_de_passe (VARCHAR, HASHED)
- nom (VARCHAR)
- role (ENUM: 'citoyen', 'admin')
- points (INT)
- date_inscription (TIMESTAMP)
- derniere_connexion (TIMESTAMP)
- actif (BOOLEAN)
```

#### `signalements`
```sql
- id (INT, PRIMARY KEY)
- code_suivi (VARCHAR, UNIQUE) - Format: SIG-YYYY-NNNN
- type (VARCHAR)
- autre_type (VARCHAR, NULLABLE)
- description (TEXT)
- localisation (VARCHAR)
- quartier (VARCHAR)
- latitude/longitude (DECIMAL, NULLABLE)
- photo (VARCHAR, NULLABLE)
- statut (ENUM: 'soumise', 'en_traitement', 'resolu')
- points_attribues (INT)
- utilisateur_id (INT, FOREIGN KEY)
- admin_assigne_id (INT, FOREIGN KEY)
- commentaire_admin (TEXT, NULLABLE)
- date_creation (TIMESTAMP)
- date_modification (TIMESTAMP)
- date_resolution (TIMESTAMP, NULLABLE)
- priorite (ENUM: 'basse', 'normale', 'haute', 'urgente')
- visible_public (BOOLEAN)
```

#### `historique_statuts`
```sql
- id (INT, PRIMARY KEY)
- signalement_id (INT, FOREIGN KEY)
- ancien_statut (ENUM, NULLABLE)
- nouveau_statut (ENUM)
- commentaire (TEXT, NULLABLE)
- admin_id (INT, FOREIGN KEY, NULLABLE)
- date_changement (TIMESTAMP)
```

#### `sessions_blacklist`
```sql
- id (INT, PRIMARY KEY)
- token_hash (VARCHAR)
- date_expiration (TIMESTAMP)
- date_creation (TIMESTAMP)
```

## 🛠️ API Endpoints

### 🔐 Authentification (`/api/auth`)

#### `POST /api/auth/register`
Inscription d'un nouvel utilisateur

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "nom": "Nom Prénom"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### `POST /api/auth/login`
Connexion d'un utilisateur

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

#### `POST /api/auth/logout`
Déconnexion (blacklist du token)

**Headers:** `Authorization: Bearer {token}`

#### `GET /api/auth/profile`
Obtenir le profil de l'utilisateur connecté

**Headers:** `Authorization: Bearer {token}`

#### `PUT /api/auth/profile`
Mettre à jour le profil

#### `PUT /api/auth/change-password`
Changer le mot de passe

#### `GET /api/auth/verify`
Vérifier la validité du token

### 📋 Signalements (`/api/signalements`)

#### `POST /api/signalements`
Créer un nouveau signalement

**Content-Type:** `multipart/form-data`

**Body:**
```json
{
  "type": "Voirie",
  "autre_type": "", // Si type = "Autre (précisez)"
  "description": "Description détaillée du problème",
  "localisation": "Adresse précise",
  "quartier": "Gueliz",
  "latitude": 31.6295,
  "longitude": -7.9811,
  "photo": "fichier_image (optionnel)"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Signalement créé avec succès",
  "data": {
    "signalement": { ... },
    "code_suivi": "SIG-2024-0001"
  }
}
```

#### `GET /api/signalements`
Obtenir tous les signalements avec filtres

**Query Parameters:**
- `statut` - Filtrer par statut (soumise/en_traitement/resolu)
- `type` - Filtrer par type d'incident
- `quartier` - Filtrer par quartier
- `page` - Numéro de page (défaut: 1)
- `limit` - Nombre d'éléments par page (défaut: 20)
- `search` - Recherche textuelle
- `user_only` - true/false (signalements de l'utilisateur connecté)

#### `GET /api/signalements/code/{code}`
Rechercher un signalement par code de suivi

**Exemple:** `/api/signalements/code/SIG-2024-0001`

#### `GET /api/signalements/statistiques`
Obtenir les statistiques des signalements

**Réponse:**
```json
{
  "success": true,
  "data": {
    "globales": {
      "total": 150,
      "soumis": 45,
      "en_traitement": 32,
      "resolus": 73,
      "temps_moyen_resolution": 4.2
    },
    "par_quartier": [...],
    "par_type": [...],
    "evolution": [...]
  }
}
```

#### `GET /api/signalements/{id}` (Admin)
Obtenir un signalement par ID

#### `PUT /api/signalements/{id}/statut` (Admin)
Mettre à jour le statut d'un signalement

**Body:**
```json
{
  "statut": "en_traitement",
  "commentaire": "Prise en charge par l'équipe technique"
}
```

#### `DELETE /api/signalements/{id}` (Admin)
Supprimer un signalement (marquer comme invisible)

#### `POST /api/signalements/{id}/restaurer` (Admin)
Restaurer un signalement supprimé

### 🏥 Utilitaires

#### `GET /api/health`
Vérifier l'état de l'API

#### `GET /api/info`
Obtenir les informations sur l'API

## 🔒 Authentification et Sécurité

### JWT (JSON Web Tokens)
- **Durée de vie:** 24h par défaut
- **Blacklist:** Les tokens déconnectés sont blacklistés
- **Refresh:** Pas de refresh token (re-login requis après expiration)

### Sécurité
- **Rate Limiting:** 100 requêtes/15min par IP
- **Auth Rate Limiting:** 5 tentatives de connexion/15min par IP
- **Helmet.js:** Headers de sécurité
- **CORS:** Configuré pour le frontend
- **Validation:** Joi pour toutes les entrées
- **Hash:** bcrypt avec salt rounds = 12

### Middlewares de sécurité
- `authenticateToken` - Vérification du JWT
- `requireAdmin` - Accès administrateur requis
- `optionalAuth` - Authentification optionnelle
- `validate` - Validation des données entrantes

## 📁 Upload de Fichiers

### Configuration
- **Taille max:** 5MB
- **Types autorisés:** JPEG, PNG, GIF, WebP
- **Organisation:** `/uploads/YYYY/MM/DD/`
- **Nommage:** `signalement_{timestamp}_{hash}.ext`

### Sécurité des uploads
- Validation du type MIME
- Limite de taille
- Nom de fichier sécurisé (pas d'exécution)
- Stockage hors du webroot

## 🎯 Types de Signalements Supportés

1. **Voirie** - Trous, nids de poule, revêtement
2. **Éclairage public** - Lampadaires, pannes électriques
3. **Propreté** - Déchets, dépôts sauvages
4. **Espaces verts** - Jardins, arrosage, arbres
5. **Nuisance publique** - Troubles, incivilités
6. **Autres problèmes** - Mobilier, signalisation

## 🏘️ Quartiers de Marrakech

- Gueliz
- Medina
- Hivernage
- Agdal
- Semlalia
- Daoudiate
- Sidi Youssef Ben Ali
- Autre

## 📈 Système de Points

### Attribution des points
- **Signalement créé:** +10 points
- **Signalement résolu:** +5 points bonus
- **Compte premium:** Fonctionnalités futures

### Gamification
- Encourager la participation citoyenne
- Classements futurs
- Badges et récompenses (à implémenter)

## 🔧 Scripts Disponibles

```bash
# Démarrer en mode développement
npm run dev

# Démarrer en mode production
npm start

# Initialiser la base de données
npm run init-db
```

## 📝 Variables d'Environnement

```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=anamak_db
DB_PORT=3306

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h

# Serveur
PORT=5000
NODE_ENV=development

# Fichiers
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880

# CORS
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:5000
```

## 🧪 Comptes de Test

### Administrateur
- **Email:** admin@marrakech.ma
- **Mot de passe:** admin123
- **Rôle:** admin

### Citoyen
- **Email:** citoyen@marrakech.ma
- **Mot de passe:** 123456
- **Rôle:** citoyen

### Test
- **Email:** test@marrakech.ma
- **Mot de passe:** 123456
- **Rôle:** citoyen

## 🚨 Dépannage

### Erreur de connexion à la base
1. Vérifier que MySQL est démarré dans XAMPP
2. Vérifier les credentials dans `.env`
3. Lancer `npm run init-db` pour créer la base

### Erreur d'upload de fichiers
1. Vérifier les permissions du dossier `uploads/`
2. Vérifier la taille du fichier (max 5MB)
3. Vérifier le type de fichier (images uniquement)

### Token invalide
1. Vérifier que le token est envoyé dans l'header Authorization
2. Format: `Bearer {token}`
3. Vérifier que le token n'est pas expiré ou blacklisté

## 📞 Support

Pour toute question ou problème, vérifiez:
1. Les logs du serveur
2. La documentation de l'API
3. Les codes d'erreur retournés
4. La configuration de la base de données

## 🔄 Mises à jour futures

- [ ] API de notifications push
- [ ] Système de commentaires citoyens
- [ ] Géolocalisation automatique
- [ ] Export de données (CSV, PDF)
- [ ] API mobile dédiée
- [ ] Système de vote/like sur les signalements
- [ ] Intégration cartographique avancée 