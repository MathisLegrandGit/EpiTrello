# 🎨 Frontend EpiTrello - Documentation

Cette documentation présente l'architecture, les technologies et la structure du frontend de l'application EpiTrello.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Structure du projet](#structure-du-projet)
- [Démarrage rapide](#démarrage-rapide)
- [Configuration](#configuration)
- [Documentation complémentaire](#documentation-complémentaire)

## 🎯 Vue d'ensemble

Le frontend EpiTrello est une application web moderne construite avec **Vue.js 3** et **TypeScript**, utilisant la **Composition API**. L'interface est inspirée de Trello, offrant une expérience de gestion de projets intuitive avec un système de tableaux Kanban drag-and-drop.

### Fonctionnalités principales

- ✅ **Authentification** : Inscription, connexion avec gestion de session
- ✅ **Dashboard** : Vue d'ensemble des boards avec création rapide
- ✅ **Kanban Board** : Tableaux avec listes et cartes drag-and-drop
- ✅ **Cartes détaillées** : Description, labels, membres, dates d'échéance, pièces jointes
- ✅ **Collaborateurs** : Invitation et gestion des membres d'un board
- ✅ **Système d'amis** : Recherche et ajout d'amis
- ✅ **Notifications** : Système de notifications en temps réel
- ✅ **Interface responsive** : Adaptation mobile et desktop
- ✅ **Thème moderne** : Design élégant avec Tailwind CSS

## 🛠️ Technologies

### Framework et runtime

- **[Vue.js](https://vuejs.org/)** 3.5.22 - Framework JavaScript progressif
- **[TypeScript](https://www.typescriptlang.org/)** 5.9 - Typage statique
- **[Vite](https://vitejs.dev/)** 7.1 - Build tool ultra-rapide
- **[Vue Router](https://router.vuejs.org/)** 4.6 - Routing SPA

### UI et styling

- **[Tailwind CSS](https://tailwindcss.com/)** 4.1 - Framework CSS utility-first
- **[class-variance-authority](https://cva.style/)** 0.7 - Variantes de composants
- **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Gestion conditionnelle de classes

### Fonctionnalités avancées

- **[vue-draggable-plus](https://alfred-skyblue.github.io/vue-draggable-plus/)** 0.6 - Drag & drop pour Kanban

### Développement

- **[ESLint](https://eslint.org/)** 9.37 - Linter JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** 3.6 - Formateur de code
- **[Vue DevTools](https://devtools.vuejs.org/)** 8.0 - Outils de debugging

## 🏗️ Architecture

### Architecture en couches

```
┌─────────────────────────────────────┐
│            Views                    │  ← Pages (routes)
├─────────────────────────────────────┤
│          Components                 │  ← Composants réutilisables
├─────────────────────────────────────┤
│         Composables                 │  ← Logique métier & state
├─────────────────────────────────────┤
│          Services                   │  ← API HTTP (backend)
├─────────────────────────────────────┤
│         Backend API                 │  ← NestJS REST API
└─────────────────────────────────────┘
```

### Composition API

Vue 3 Composition API permet une meilleure organisation du code :

```typescript
// Composable réutilisable
export function useAuth() {
  const user = ref<User | null>(null)
  const loading = ref(false)
  
  async function login(credentials) {
    loading.value = true
    const response = await authApi.login(credentials)
    user.value = response.user
  }
  
  return { user, loading, login }
}

// Utilisation dans un composant
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { user, loading, login } = useAuth()
</script>
```

### État de l'application

L'état est géré avec des **composables réactifs** (pas de Pinia/Vuex) :

```
useAuth()        → État d'authentification (user, session)
useBoard()       → État du board actif (lists, cards, labels)
useDragDrop()    → Logique drag & drop Kanban
```

## 📁 Structure du projet

```
frontend/
├── public/                          # Fichiers statiques
├── src/
│   ├── main.ts                      # Point d'entrée de l'application
│   ├── App.vue                      # Composant racine
│   │
│   ├── views/                       # Pages (routes)
│   │   ├── landing/
│   │   │   └── LandingView.vue      # Page d'accueil
│   │   ├── AuthView.vue             # Page login/signup
│   │   ├── DashboardView.vue        # Dashboard (liste des boards)
│   │   └── KanbanView.vue           # Vue Kanban d'un board
│   │
│   ├── components/                  # Composants réutilisables
│   │   ├── kanban/                  # Composants spécifiques Kanban
│   │   │   ├── KanbanBoard.vue      # Board complet
│   │   │   ├── KanbanColumn.vue     # Colonne (liste)
│   │   │   ├── KanbanCard.vue       # Carte
│   │   │   └── AddCard.vue          # Formulaire nouvelle carte
│   │   ├── ui/                      # Composants UI réutilisables
│   │   │   ├── Button.vue
│   │   │   ├── Input.vue
│   │   │   ├── Modal.vue
│   │   │   ├── Badge.vue
│   │   │   └── ...
│   │   ├── BrandLogo.vue            # Logo de l'app
│   │   ├── CardDetailModal.vue      # Modal détails carte
│   │   ├── BoardCollaboratorsModal.vue  # Modal gestion collaborateurs
│   │   ├── NotificationsPanel.vue   # Panneau notifications
│   │   ├── PasswordInput.vue        # Input mot de passe
│   │   └── SettingsModal.vue        # Modal paramètres
│   │
│   ├── composables/                 # Composition API (hooks)
│   │   ├── useAuth.ts               # Authentification & session
│   │   ├── useBoard.ts              # État du board actif
│   │   └── useDragDrop.ts           # Logique drag & drop
│   │
│   ├── services/                    # Services HTTP
│   │   └── api.ts                   # Fonctions API (fetch backend)
│   │
│   ├── router/                      # Configuration routing
│   │   └── index.ts                 # Routes et guards
│   │
│   ├── lib/                         # Utilitaires
│   │   └── utils.ts                 # Fonctions helpers
│   │
│   └── assets/                      # Assets (CSS, images)
│       ├── base.css                 # Styles de base
│       └── main.css                 # Imports Tailwind
│
├── index.html                       # HTML racine
├── vite.config.ts                   # Configuration Vite
├── tsconfig.json                    # Configuration TypeScript
├── tailwind.config.js               # Configuration Tailwind CSS
├── eslint.config.ts                 # Configuration ESLint
├── package.json                     # Dépendances et scripts
├── Dockerfile                       # Image Docker production (nginx)
├── Dockerfile.dev                   # Image Docker développement
└── nginx.conf                       # Config nginx pour production
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 22.x ou supérieur
- npm 10.x ou supérieur
- Backend EpiTrello en cours d'exécution (port 3000)

### Installation

```bash
# Se placer dans le dossier frontend
cd frontend

# Installer les dépendances
npm install
```

### Configuration

Créez un fichier `.env` à la racine du dossier `frontend/` :

```env
# URL du backend API
VITE_API_URL=http://localhost:3000
```

**Note :** Les variables d'environnement Vite doivent être préfixées par `VITE_`

### Démarrage

```bash
# Mode développement (avec hot-reload)
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview
```

L'application sera accessible sur : **http://localhost:5173**

### Vérifier le fonctionnement

1. Ouvrez http://localhost:5173
2. Vous devriez voir la page d'accueil (landing)
3. Cliquez sur "Get Started" ou allez sur `/login`
4. Créez un compte ou connectez-vous

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Défaut |
|----------|-------------|--------|
| `VITE_API_URL` | URL du backend API | `http://localhost:3000` |
| `BASE_URL` | Base path de l'application | `/` |

### Vite configuration

Configuration dans [vite.config.ts](../frontend/vite.config.ts) :

```typescript
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

### Tailwind CSS

Configuration dans [tailwind.config.js](../frontend/tailwind.config.js).

**Mode :** JIT (Just-In-Time) activé par défaut

**Content :** Scan de tous les fichiers Vue, TS, JS

**Thème personnalisé :**
- Couleurs personnalisées
- Variables CSS pour les couleurs
- Dark mode support (si configuré)

### TypeScript

Configuration stricte dans [tsconfig.json](../frontend/tsconfig.json) :

- `strict: true` - Mode strict activé
- `noUnusedLocals: true` - Erreur sur variables non utilisées
- `noUnusedParameters: true` - Erreur sur paramètres non utilisés
- Path alias `@/*` → `src/*`

## 📚 Documentation complémentaire

- **[FRONTEND-COMPONENTS.md](FRONTEND-COMPONENTS.md)** - Documentation de tous les composants
- **[FRONTEND-SERVICES.md](FRONTEND-SERVICES.md)** - Services API et helpers
- **[FRONTEND-COMPOSABLES.md](FRONTEND-COMPOSABLES.md)** - Composables et state management
- **[FRONTEND-DEVELOPMENT.md](FRONTEND-DEVELOPMENT.md)** - Guide de développement
- **[CI-CD.md](CI-CD.md)** - Pipelines d'intégration continue
- **[DOCKER.md](DOCKER.md)** - Utilisation de Docker

## 🎨 Design system

### Composants UI

EpiTrello utilise un design system custom basé sur Tailwind CSS :

- **Buttons** : Variantes primary, secondary, ghost, danger
- **Inputs** : Text, email, password avec validation visuelle
- **Modals** : Système de modales réutilisables
- **Cards** : Cards de contenu avec variantes
- **Badges** : Labels et tags colorés
- **Toasts** : Notifications toast (si implémenté)

### Couleurs

```css
/* Couleurs principales */
--primary: #4A90E2;      /* Bleu */
--secondary: #7B68EE;    /* Violet */
--success: #22c55e;      /* Vert */
--warning: #f97316;      /* Orange */
--danger: #E74C3C;       /* Rouge */
--gray: #6B7280;         /* Gris */
```

### Typographie

- **Font family** : Inter (Google Fonts) ou système
- **Font sizes** : Scale de base Tailwind (text-sm, text-base, text-lg, etc.)

## 🌐 Routes de l'application

| Route | Composant | Auth requise | Description |
|-------|-----------|--------------|-------------|
| `/` | LandingView | Non | Page d'accueil |
| `/login` | AuthView | Non | Connexion/Inscription |
| `/dashboard` | DashboardView | Oui | Dashboard des boards |
| `/board/:id` | KanbanView | Oui | Vue Kanban d'un board |

### Route guards

Navigation protégée avec `router.beforeEach()` :

```typescript
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated } = useAuth()
  
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

## 🔧 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm run preview` | Preview du build |
| `npm run type-check` | Vérification TypeScript |
| `npm run lint` | Lint du code |
| `npm run lint:fix` | Lint avec auto-fix |
| `npm run format` | Formatage avec Prettier |

## 📦 Build de production

```bash
# Build
npm run build

# Les fichiers sont dans dist/
# Servir avec nginx, Apache, ou tout serveur statique
```

**Taille du bundle :**
- Optimisé avec Vite et Rollup
- Tree-shaking automatique
- Code splitting par route
- Assets minifiés et gzippés

## 🚢 Déploiement

### Avec Docker

Voir [DOCKER.md](DOCKER.md) pour les instructions complètes.

```bash
# Build et démarrage
docker-compose up --build
```

### Déploiement statique

L'application peut être déployée sur :

- **Vercel** : `vercel --prod`
- **Netlify** : `netlify deploy --prod`
- **Cloudflare Pages** : Push sur Git
- **GitHub Pages** : Avec GitHub Actions
- **VPS/Serveur** : Servir le dossier `dist/` avec nginx

### Configuration nginx (production)

```nginx
server {
    listen 80;
    server_name epitrello.com;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing (toutes les routes vers index.html)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache des assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔍 Performance

### Optimisations

- **Lazy loading** : Routes chargées à la demande
- **Code splitting** : Vendor chunks séparés
- **Image optimization** : WebP et lazy loading
- **CSS purging** : Tailwind CSS purifié en prod
- **Minification** : JS, CSS, HTML minifiés
- **Compression** : Gzip/Brotli activés

### Métriques cibles

- **First Contentful Paint** : < 1.5s
- **Time to Interactive** : < 3s
- **Bundle size** : < 300KB (gzipped)

## 🔒 Sécurité

- **XSS protection** : Sanitization automatique de Vue
- **CSRF protection** : Tokens dans les cookies
- **Auth tokens** : Stockés en cookies HTTP-only (recommandé)
- **Input validation** : Validation côté client et serveur
- **HTTPS** : Obligatoire en production

## 🆘 Dépannage

### Le dev server ne démarre pas

```bash
# Nettoyer et réinstaller
rm -rf node_modules .vite
npm install
npm run dev
```

### Erreur de connexion au backend

**Vérifiez :**
1. Le backend est en cours d'exécution (port 3000)
2. `VITE_API_URL` est correct dans `.env`
3. CORS est configuré sur le backend

### Hot-reload ne fonctionne pas

```bash
# Vérifier la configuration Vite
# Essayer de redémarrer le serveur
npm run dev
```

### Erreurs TypeScript

```bash
# Vérifier les types
npm run type-check

# Redémarrer le serveur TS
# VSCode: Cmd+Shift+P → TypeScript: Restart TS Server
```

## 🤝 Contribution

1. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
2. Commitez : `git commit -m "feat: ajout de ma fonctionnalité"`
3. Pushez : `git push origin feature/ma-fonctionnalite`
4. Créez une Pull Request

Voir [FRONTEND-DEVELOPMENT.md](FRONTEND-DEVELOPMENT.md) pour les conventions.

## 📄 Licence

UNLICENSED - Projet privé
