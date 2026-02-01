# 🚀 Backend EpiTrello - Documentation

Cette documentation présente l'architecture, les technologies et la structure du backend de l'application EpiTrello.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Structure du projet](#structure-du-projet)
- [Démarrage rapide](#démarrage-rapide)
- [Configuration](#configuration)
- [Documentation complémentaire](#documentation-complémentaire)

## 🎯 Vue d'ensemble

Le backend EpiTrello est une API REST construite avec **NestJS**, un framework Node.js progressif pour construire des applications côté serveur efficaces et évolutives. L'application utilise **Supabase** comme base de données PostgreSQL et système d'authentification.

### Fonctionnalités principales

- ✅ **Authentification** : Inscription, connexion, gestion de profil
- ✅ **Gestion de boards** : Création, modification, suppression de tableaux
- ✅ **Listes et cartes** : Organisation des tâches en listes et cartes
- ✅ **Labels** : Catégorisation des cartes avec des étiquettes
- ✅ **Collaborateurs** : Invitation et gestion des membres d'un board
- ✅ **Système d'amis** : Recherche d'utilisateurs et gestion d'amis
- ✅ **Notifications** : Système de notifications temps réel
- ✅ **Upload de fichiers** : Gestion des avatars et pièces jointes

## 🛠️ Technologies

### Framework et runtime

- **[NestJS](https://nestjs.com/)** 11.0.1 - Framework progressif Node.js
- **[Node.js](https://nodejs.org/)** 22.x - Runtime JavaScript
- **[TypeScript](https://www.typescriptlang.org/)** - Typage statique

### Base de données et authentification

- **[Supabase](https://supabase.com/)** 2.81.1 - BaaS PostgreSQL
  - PostgreSQL comme base de données
  - Row Level Security (RLS) pour la sécurité
  - Storage pour les fichiers
  - Auth pour l'authentification

### Validation et transformation

- **[class-validator](https://github.com/typestack/class-validator)** 0.14.2 - Validation des DTOs
- **[class-transformer](https://github.com/typestack/class-transformer)** 0.5.1 - Transformation des objets

### Tests

- **[Jest](https://jestjs.io/)** 30.0.0 - Framework de tests
- **[Supertest](https://github.com/visionmedia/supertest)** 6.0.2 - Tests d'API

### Développement

- **[ESLint](https://eslint.org/)** 9.18.0 - Linter JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** 3.4.2 - Formateur de code

## 🏗️ Architecture

### Architecture en couches

```
┌─────────────────────────────────────┐
│         Controllers                 │  ← Routes HTTP et validation
├─────────────────────────────────────┤
│          Services                   │  ← Logique métier
├─────────────────────────────────────┤
│      Supabase Service               │  ← Accès aux données
├─────────────────────────────────────┤
│         Supabase                    │  ← Base de données PostgreSQL
└─────────────────────────────────────┘
```

### Pattern Module

NestJS utilise une architecture modulaire où chaque fonctionnalité est encapsulée dans un module :

```typescript
@Module({
  imports: [SupabaseModule],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
```

### Dépendances entre modules

```
AppModule
├── ConfigModule (global)
├── SupabaseModule (base de données)
├── AuthModule (authentification)
├── UsersModule (gestion utilisateurs)
├── BoardsModule (tableaux)
│   ├── ListsModule (listes)
│   │   └── CardsModule (cartes)
│   │       └── LabelsModule (étiquettes)
│   └── CollaboratorsModule (collaborateurs)
├── FriendsModule (système d'amis)
└── NotificationsModule (notifications)
```

## 📁 Structure du projet

```
backend/
├── src/
│   ├── main.ts                      # Point d'entrée de l'application
│   ├── app.module.ts                # Module racine
│   ├── app.controller.ts            # Contrôleur racine
│   ├── app.service.ts               # Service racine
│   │
│   ├── auth/                        # Module d'authentification
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts       # Routes: /auth/*
│   │   ├── auth.service.ts
│   │   └── dto/                     # Data Transfer Objects
│   │       ├── signup.dto.ts
│   │       ├── login.dto.ts
│   │       ├── update-profile.dto.ts
│   │       └── update-password.dto.ts
│   │
│   ├── users/                       # Module utilisateurs
│   │   ├── users.module.ts
│   │   ├── users.controller.ts      # Routes: /users/*
│   │   └── users.service.ts
│   │
│   ├── boards/                      # Module tableaux
│   │   ├── boards.module.ts
│   │   ├── boards.controller.ts     # Routes: /boards/*
│   │   └── boards.service.ts
│   │
│   ├── lists/                       # Module listes
│   │   ├── lists.module.ts
│   │   ├── lists.controller.ts      # Routes: /lists/*
│   │   └── lists.service.ts
│   │
│   ├── cards/                       # Module cartes
│   │   ├── cards.module.ts
│   │   ├── cards.controller.ts      # Routes: /cards/*
│   │   └── cards.service.ts
│   │
│   ├── labels/                      # Module étiquettes
│   │   ├── labels.module.ts
│   │   ├── labels.controller.ts     # Routes: /labels/*
│   │   └── labels.service.ts
│   │
│   ├── collaborators/               # Module collaborateurs
│   │   ├── collaborators.module.ts
│   │   ├── collaborators.controller.ts  # Routes: /collaborators/*
│   │   └── collaborators.service.ts
│   │
│   ├── friends/                     # Module système d'amis
│   │   ├── friends.module.ts
│   │   ├── friends.controller.ts    # Routes: /friends/*
│   │   ├── friends.service.ts
│   │   ├── notifications.controller.ts
│   │   └── dto/
│   │
│   ├── notifications/               # Module notifications
│   │   ├── notifications.module.ts
│   │   ├── notifications.controller.ts  # Routes: /notifications/*
│   │   └── notifications.service.ts
│   │
│   ├── supabase/                    # Module Supabase (base de données)
│   │   ├── supabase.module.ts
│   │   └── supabase.service.ts      # Service d'accès à Supabase
│   │
│   └── common/                      # Utilitaires partagés
│       └── decorators/              # Décorateurs personnalisés
│
├── test/                            # Tests E2E
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── Dockerfile                       # Image Docker production
├── Dockerfile.dev                   # Image Docker développement
├── package.json                     # Dépendances et scripts
├── tsconfig.json                    # Configuration TypeScript
├── tsconfig.build.json              # Config TS pour le build
├── nest-cli.json                    # Configuration NestJS CLI
├── eslint.config.mjs                # Configuration ESLint
├── api.rest                         # Tests API (REST Client)
└── api-auth.rest                    # Tests API authentification
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 22.x ou supérieur
- npm ou pnpm
- Compte Supabase (ou instance locale)

### Installation

```bash
# Se placer dans le dossier backend
cd backend

# Installer les dépendances
npm install
```

### Configuration

Créez un fichier `.env` à la racine du dossier `backend/` :

```env
# Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre-clé-anon-publique
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role

# Application
PORT=3000
NODE_ENV=development
```

### Démarrage

```bash
# Mode développement (avec hot-reload)
npm run start:dev

# Mode production
npm run build
npm run start:prod

# Mode debug
npm run start:debug
```

L'API sera accessible sur : **http://localhost:3000**

### Vérifier le fonctionnement

```bash
# Tester la route racine
curl http://localhost:3000

# Tester une route API
curl http://localhost:3000/boards
```

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Requis | Défaut |
|----------|-------------|--------|--------|
| `SUPABASE_URL` | URL de votre projet Supabase | ✅ Oui | - |
| `SUPABASE_KEY` | Clé anonyme publique Supabase | ✅ Oui | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (admin) | ⚠️ Recommandé | - |
| `PORT` | Port du serveur | Non | 3000 |
| `NODE_ENV` | Environnement d'exécution | Non | development |

### CORS

Le backend accepte les requêtes depuis :
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000`
- `https://epitrello.pages.dev`
- Tous les sous-domaines `*.pages.dev` (Cloudflare)
- Tous les sous-domaines `*.vercel.app` (Vercel)

Configuration dans [src/main.ts](../backend/src/main.ts#L9-L17).

### Validation globale

Validation automatique des DTOs avec `class-validator` :
- `whitelist: true` - Supprime les propriétés non définies
- `transform: true` - Transforme automatiquement les types

Configuration dans [src/main.ts](../backend/src/main.ts#L20-L25).

## 📚 Documentation complémentaire

- **[BACKEND-API.md](BACKEND-API.md)** - Documentation complète de l'API REST
- **[BACKEND-MODULES.md](BACKEND-MODULES.md)** - Détails de chaque module NestJS
- **[BACKEND-SUPABASE.md](BACKEND-SUPABASE.md)** - Intégration et configuration Supabase
- **[BACKEND-DEVELOPMENT.md](BACKEND-DEVELOPMENT.md)** - Guide de développement
- **[CI-CD.md](CI-CD.md)** - Pipelines d'intégration continue
- **[DOCKER.md](DOCKER.md)** - Utilisation de Docker

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests unitaires en mode watch
npm run test:watch

# Tests E2E
npm run test:e2e

# Couverture de code
npm run test:cov
```

## 📝 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run start` | Démarre l'application |
| `npm run start:dev` | Mode développement avec hot-reload |
| `npm run start:debug` | Mode debug |
| `npm run build` | Build de production |
| `npm run lint` | Lint et auto-fix |
| `npm run format` | Formatage avec Prettier |
| `npm run test` | Exécute les tests |
| `npm run test:cov` | Tests avec couverture |

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables Supabase
- **Validation des entrées** avec `class-validator`
- **Pas de clés secrètes** dans le code (variables d'environnement)
- **CORS configuré** pour limiter les origines autorisées
- **Service role** utilisé uniquement pour les opérations admin

## 🚢 Déploiement

### Avec Docker

Voir [DOCKER.md](DOCKER.md) pour les instructions complètes.

```bash
# Build et démarrage
docker-compose up --build
```

### Déploiement manuel

```bash
# Build
npm run build

# Démarrer en production
NODE_ENV=production PORT=3000 npm run start:prod
```

### Variables d'environnement en production

Assurez-vous de configurer les variables d'environnement sur votre plateforme de déploiement :
- Heroku : `heroku config:set SUPABASE_URL=...`
- Vercel : Dashboard → Settings → Environment Variables
- Railway : Dashboard → Variables
- VPS : Fichier `.env` ou systemd environment

## 📊 Monitoring

### Health check

```bash
curl http://localhost:3000
# Retourne: "Hello World!"
```

### Logs

Les logs sont affichés dans la console :
```
[Nest] 12345  - 01/01/2026, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 01/01/2026, 10:00:00 AM     LOG [InstanceLoader] AppModule dependencies initialized
...
Application is running on: http://localhost:3000
```

## 🆘 Dépannage

### Erreur : Cannot connect to Supabase

**Vérifiez :**
- Les variables `SUPABASE_URL` et `SUPABASE_KEY` sont définies
- Les credentials sont corrects
- Vous avez accès à internet
- Le projet Supabase est actif

### Erreur : Port 3000 already in use

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou changer le port
PORT=3001 npm run start:dev
```

### Hot-reload ne fonctionne pas

```bash
# Nettoyer et réinstaller
rm -rf node_modules dist
npm install
npm run start:dev
```

## 🤝 Contribution

1. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
2. Commitez : `git commit -m "feat: ajout de ma fonctionnalité"`
3. Pushez : `git push origin feature/ma-fonctionnalite`
4. Créez une Pull Request

Voir [BACKEND-DEVELOPMENT.md](BACKEND-DEVELOPMENT.md) pour les conventions de code.

## 📄 Licence

UNLICENSED - Projet privé
