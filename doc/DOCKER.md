# 🐳 Documentation Docker - EpiTrello

Cette documentation explique comment utiliser Docker pour développer et déployer l'application EpiTrello.

## 📋 Architecture

Le projet utilise une architecture multi-conteneurs avec :
- **Backend** : API NestJS (port 3000)
- **Frontend** : Application Vue.js avec Vite (dev: port 5173, prod: port 80)

## 🗂️ Fichiers Docker

### Fichiers de production
- `backend/Dockerfile` - Image backend optimisée avec multi-stage build
- `frontend/Dockerfile` - Image frontend avec nginx pour servir l'application
- `docker-compose.yml` - Orchestration des conteneurs en production

### Fichiers de développement
- `backend/Dockerfile.dev` - Image backend avec hot-reload
- `frontend/Dockerfile.dev` - Image frontend avec Vite dev server
- `docker-compose.dev.yml` - Orchestration des conteneurs en développement

### Configuration
- `frontend/nginx.conf` - Configuration nginx pour le SPA en production
- `.dockerignore` - Fichiers à exclure lors du build

## 🚀 Démarrage rapide

### Développement (avec hot-reload)

```bash
# Démarrer les conteneurs
docker-compose -f docker-compose.dev.yml up --build

# Ou en arrière-plan
docker-compose -f docker-compose.dev.yml up -d --build
```

**URLs accessibles :**
- Frontend : http://localhost:5173
- Backend : http://localhost:3000

**Hot-reload activé :**
- Modifiez les fichiers dans `frontend/src` → rechargement automatique
- Modifiez les fichiers dans `backend/src` → recompilation automatique

### Production

```bash
# Construire et démarrer
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build
```

**URLs accessibles :**
- Frontend : http://localhost
- Backend : http://localhost:3000

## 🛠️ Commandes utiles

### Gestion des conteneurs

```bash
# Voir les conteneurs actifs
docker ps

# Arrêter les conteneurs
docker-compose down
# ou pour le mode dev
docker-compose -f docker-compose.dev.yml down

# Arrêter et supprimer les volumes
docker-compose down -v

# Voir les logs
docker-compose logs
docker-compose logs frontend
docker-compose logs backend

# Suivre les logs en temps réel
docker-compose logs -f
```

### Reconstruire les images

```bash
# Reconstruire sans cache
docker-compose build --no-cache

# Reconstruire un seul service
docker-compose build backend
docker-compose build frontend
```

### Accéder aux conteneurs

```bash
# Ouvrir un shell dans le conteneur backend
docker exec -it epitrello-backend sh

# Ouvrir un shell dans le conteneur frontend (dev)
docker exec -it epitrello-frontend-dev sh

# Exécuter une commande dans un conteneur
docker exec epitrello-backend npm run test
```

### Nettoyage

```bash
# Supprimer les conteneurs arrêtés
docker container prune

# Supprimer les images inutilisées
docker image prune

# Supprimer les volumes inutilisés
docker volume prune

# Tout nettoyer (attention !)
docker system prune -a --volumes
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre-clé-supabase

# Backend
NODE_ENV=production
PORT=3000

# Frontend (préfixe VITE_ requis)
VITE_API_URL=http://localhost:3000
```

Décommentez et remplissez les variables dans `docker-compose.yml` :

```yaml
environment:
  - SUPABASE_URL=${SUPABASE_URL}
  - SUPABASE_KEY=${SUPABASE_KEY}
```

### Personnaliser les ports

Modifiez les ports dans `docker-compose.yml` ou `docker-compose.dev.yml` :

```yaml
ports:
  - "VOTRE_PORT:PORT_CONTENEUR"
```

## 🏗️ Architecture des Dockerfiles

### Backend (Production)

**Multi-stage build** pour optimiser la taille de l'image :
1. **deps** : Installation des dépendances
2. **builder** : Build de l'application NestJS
3. **runner** : Image finale avec uniquement les fichiers nécessaires

### Frontend (Production)

**Build avec nginx** :
1. Build de l'application Vue avec Vite
2. Copie des fichiers statiques dans nginx
3. Configuration nginx optimisée pour SPA

### Images de développement

Images simplifiées avec :
- Installation des dépendances
- Volumes montés pour le hot-reload
- Commandes de démarrage en mode développement

## 🔍 Dépannage

### Le hot-reload ne fonctionne pas

**Frontend :**
- Vérifiez que le port 5173 est bien accessible
- Assurez-vous que les volumes sont correctement montés : `docker-compose -f docker-compose.dev.yml config`

**Backend :**
- Vérifiez les logs : `docker-compose -f docker-compose.dev.yml logs backend`
- Le mode watch de NestJS doit être actif

### Erreurs de build

```bash
# Nettoyer et reconstruire
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Problèmes de permissions

Sur Linux, si vous avez des problèmes de permissions avec les volumes :

```bash
# Donner les bonnes permissions
sudo chown -R $USER:$USER .
```

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'état des conteneurs
docker ps -a

# Vérifier les ports utilisés
sudo lsof -i :3000
sudo lsof -i :5173
```

## 📊 Health Checks

Les conteneurs de production incluent des health checks :

```bash
# Voir le statut de santé
docker ps

# Healthy = conteneur fonctionnel
# Unhealthy = problème détecté
```

## 🚢 Déploiement

### Avec Docker Compose (serveur distant)

```bash
# Copier les fichiers sur le serveur
scp -r . user@server:/path/to/app

# Sur le serveur
cd /path/to/app
docker-compose up -d --build
```

### Avec registry Docker

```bash
# Tag et push des images
docker tag epitrello-backend your-registry/epitrello-backend:latest
docker push your-registry/epitrello-backend:latest

docker tag epitrello-frontend your-registry/epitrello-frontend:latest
docker push your-registry/epitrello-frontend:latest
```

## 📝 Notes importantes

- **Production** : Les images sont optimisées et minimales
- **Développement** : Hot-reload activé, volumes montés en temps réel
- **Sécurité** : Ne commitez jamais le fichier `.env` avec vos secrets
- **Performance** : Le multi-stage build réduit la taille des images de ~50%

## 🆘 Support

Pour plus d'informations :
- [Documentation Docker](https://docs.docker.com/)
- [Documentation NestJS](https://docs.nestjs.com/)
- [Documentation Vue.js](https://vuejs.org/)
- [Documentation Vite](https://vitejs.dev/)
