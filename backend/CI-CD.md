# Configuration CI/CD Backend

## 🔄 Pipelines mis en place

### 1. **backend-ci.yml** - Pipeline d'intégration continue

Déclenché sur :
- Push sur `main` ou `develop`
- Pull requests vers `main` ou `develop`
- Modifications dans le dossier `backend/`

**Jobs exécutés :**

1. **Tests & Linting**
   - ✅ Installation des dépendances
   - ✅ Vérification du linting (ESLint)
   - ✅ Vérification du formatage (Prettier)
   - ✅ Tests unitaires (Jest)
   - ✅ Tests e2e
   - ✅ Génération du rapport de couverture

2. **Build**
   - ✅ Build de l'application NestJS
   - ✅ Upload des artifacts

3. **Docker**
   - ✅ Build de l'image Docker
   - ✅ Push vers Docker Hub (uniquement sur main)
   - ✅ Cache optimisé

4. **Security**
   - ✅ Audit npm
   - ✅ Scan de vulnérabilités (Trivy)

### 2. **backend-deploy.yml** - Pipeline de déploiement

Déclenché **manuellement** via GitHub Actions UI.

**Options :**
- Déploiement en `staging` ou `production`
- Build et push de l'image Docker
- Déploiement sur VPS via SSH
- Notification Slack

## 🔧 Configuration requise

### Secrets GitHub à configurer

Allez dans `Settings` → `Secrets and variables` → `Actions` :

#### Docker Hub
```
DOCKER_USERNAME=votre-username-dockerhub
DOCKER_PASSWORD=votre-token-dockerhub
```

#### Déploiement SSH (optionnel)
```
SSH_HOST=votre-serveur.com
SSH_USER=deploy
SSH_PRIVATE_KEY=votre-clé-privée-ssh
```

#### Notifications (optionnel)
```
SLACK_WEBHOOK=https://hooks.slack.com/services/...
```

#### Codecov (optionnel)
```
CODECOV_TOKEN=votre-token-codecov
```

### Configuration des environnements

Dans `Settings` → `Environments`, créez :
- **staging**
- **production**

Vous pouvez ajouter des règles de protection :
- Approbation manuelle requise
- Branches autorisées
- Variables d'environnement spécifiques

## 📊 Badges (optionnel)

Ajoutez dans votre README :

```markdown
[![Backend CI](https://github.com/MathisLegrandGit/EpiTrello/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/MathisLegrandGit/EpiTrello/actions/workflows/backend-ci.yml)
[![codecov](https://codecov.io/gh/MathisLegrandGit/EpiTrello/branch/main/graph/badge.svg)](https://codecov.io/gh/MathisLegrandGit/EpiTrello)
```

## 🚀 Utilisation

### Pipeline CI (automatique)

Le pipeline CI se déclenche automatiquement à chaque push ou PR.

**Pour voir les résultats :**
1. Allez dans l'onglet `Actions`
2. Sélectionnez le workflow `Backend CI/CD`
3. Visualisez les jobs et leurs logs

### Déploiement manuel

**Pour déployer :**
1. Allez dans `Actions`
2. Sélectionnez `Backend Deploy to Production`
3. Cliquez sur `Run workflow`
4. Choisissez l'environnement (staging/production)
5. Cliquez sur `Run workflow`

## 🔐 Bonnes pratiques

### 1. Protection des branches

Configurez dans `Settings` → `Branches` :
- ✅ Require pull request reviews
- ✅ Require status checks to pass (CI)
- ✅ Require branches to be up to date

### 2. Tests obligatoires

Assurez-vous que tous les tests passent avant de merger :
- Tests unitaires > 80% de couverture recommandé
- Tests e2e pour les endpoints critiques
- Linting sans erreurs

### 3. Revue de code

- Pull requests obligatoires
- Au moins 1 approbation requise
- CI doit passer avant merge

### 4. Variables d'environnement

**Ne jamais commiter :**
- `.env`
- Clés API
- Secrets

**Utiliser :**
- GitHub Secrets pour la CI/CD
- Variables d'environnement dans Docker

## 📝 Améliorations possibles

### Tests de performance
```yaml
- name: Run load tests
  run: |
    npm install -g artillery
    artillery run tests/load/api.yml
```

### Déploiement automatique sur staging
```yaml
on:
  push:
    branches: [develop]
```

### Rollback automatique
```yaml
- name: Health check
  run: |
    sleep 10
    curl -f http://your-api.com/health || exit 1
```

### Notifications Discord/Teams
```yaml
- name: Discord notification
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
```

## 🆘 Dépannage

### Le pipeline échoue sur les tests

```bash
# Exécuter localement
cd backend
npm run test
npm run test:e2e
```

### Build Docker échoue

```bash
# Tester localement
cd backend
docker build -t test-backend .
```

### Variables d'environnement manquantes

Vérifiez que tous les secrets sont bien configurés dans GitHub.

### Cache npm problématique

Supprimez le cache dans Actions → Caches

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Docker Hub](https://hub.docker.com/)
- [Codecov](https://codecov.io/)
- [Trivy Security Scanner](https://github.com/aquasecurity/trivy)
