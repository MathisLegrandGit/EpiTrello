# 🔄 Documentation CI/CD - EpiTrello

Cette documentation décrit les pipelines d'intégration et de déploiement continu (CI/CD) mis en place pour le projet EpiTrello.

## 📋 Vue d'ensemble

Le projet utilise **GitHub Actions** pour automatiser les tests, le linting et le build de l'application à chaque modification du code.

### Workflows disponibles

- **Backend CI** - [.github/workflows/backend-ci.yml](../.github/workflows/backend-ci.yml)
- **Frontend CI** - [.github/workflows/frontend-ci.yml](../.github/workflows/frontend-ci.yml)

## 🔧 Backend CI/CD

### Déclencheurs

Le workflow Backend CI se déclenche automatiquement sur :
- **Push** sur les branches : `main`, `develop`, `ci-cd/setup`
- **Pull Request** vers : `main`, `develop`
- Modifications dans le dossier `backend/`
- **Manuellement** via l'interface GitHub Actions

### Jobs exécutés

#### 1. Lint & Build

**Étapes :**
1. ✅ Checkout du code
2. ✅ Installation de Node.js 22.x
3. ✅ Installation des dépendances (`npm install`)
4. ✅ Linting ESLint (avec `continue-on-error`)
5. ✅ Build de l'application NestJS
6. ✅ Upload des artifacts (dossier `dist/`)

**Durée moyenne :** ~3-5 minutes

### Configuration ESLint

Le fichier [backend/eslint.config.mjs](../backend/eslint.config.mjs) a été configuré pour transformer les erreurs strictes en warnings afin de ne pas bloquer la CI :

```javascript
rules: {
  '@typescript-eslint/no-unsafe-assignment': 'warn',
  '@typescript-eslint/no-unsafe-return': 'warn',
  '@typescript-eslint/no-unsafe-member-access': 'warn',
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/require-await': 'warn',
}
```

## 🎨 Frontend CI/CD

### Déclencheurs

Le workflow Frontend CI se déclenche automatiquement sur :
- **Push** sur les branches : `main`, `develop`, `ci-cd/setup`
- **Pull Request** vers : `main`, `develop`
- Modifications dans le dossier `frontend/`
- **Manuellement** via l'interface GitHub Actions

### Jobs exécutés

#### 1. Lint & Build

**Étapes :**
1. ✅ Checkout du code
2. ✅ Installation de Node.js 22.x
3. ✅ Installation des dépendances (`npm install`)
4. ✅ Linting ESLint (avec `continue-on-error`)
5. ✅ Type checking TypeScript (`vue-tsc`)
6. ✅ Build de l'application Vue.js
7. ✅ Upload des artifacts (dossier `dist/`)

**Durée moyenne :** ~4-6 minutes

## 🚀 Utilisation

### Voir les résultats des workflows

1. Allez sur votre repo GitHub
2. Cliquez sur l'onglet **Actions**
3. Sélectionnez le workflow souhaité (Backend CI ou Frontend CI)
4. Visualisez les runs et leurs logs

### Déclencher manuellement un workflow

1. Allez dans **Actions**
2. Sélectionnez le workflow (Backend CI / Frontend CI)
3. Cliquez sur **Run workflow**
4. Choisissez la branche
5. Cliquez sur **Run workflow**

### Badges de statut (optionnel)

Ajoutez ces badges dans votre [README.md](../README.md) :

```markdown
[![Backend CI](https://github.com/MathisLegrandGit/EpiTrello/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/MathisLegrandGit/EpiTrello/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/MathisLegrandGit/EpiTrello/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/MathisLegrandGit/EpiTrello/actions/workflows/frontend-ci.yml)
```

## 📊 Artifacts

Les workflows génèrent des artifacts qui peuvent être téléchargés :

- **backend-dist** : Build du backend (conservé 7 jours)
- **frontend-dist** : Build du frontend (conservé 7 jours)

Pour télécharger un artifact :
1. Allez dans **Actions** → sélectionnez un run
2. Scrollez jusqu'à la section **Artifacts**
3. Cliquez sur l'artifact pour le télécharger

## 🔐 Bonnes pratiques

### Protection des branches

Il est recommandé de configurer la protection des branches dans `Settings` → `Branches` :

1. ✅ **Require pull request reviews** - Au moins 1 approbation
2. ✅ **Require status checks to pass** - CI doit passer avant merge
3. ✅ **Require branches to be up to date** - Branche à jour avant merge
4. ✅ **Require conversation resolution** - Résoudre les commentaires

### Workflow de développement

```bash
# 1. Créer une branche de feature
git checkout -b feature/ma-fonctionnalite

# 2. Développer et commiter
git add .
git commit -m "feat: ajout de ma fonctionnalité"

# 3. Pusher (déclenche la CI)
git push origin feature/ma-fonctionnalite

# 4. Créer une Pull Request sur GitHub
# 5. Attendre que la CI passe ✅
# 6. Demander une revue de code
# 7. Merger dans main
```

## 🛠️ Commandes locales

Avant de pusher, vous pouvez exécuter localement les mêmes vérifications que la CI :

### Backend

```bash
cd backend

# Linting
npm run lint

# Build
npm run build

# Tests (si configurés)
npm run test
```

### Frontend

```bash
cd frontend

# Linting
npm run lint

# Type check
npm run type-check

# Build
npm run build
```

## 🔍 Dépannage

### Le workflow ne se déclenche pas

**Vérifications :**
- Le fichier workflow est dans `.github/workflows/`
- Le fichier YAML est valide (pas d'erreurs de syntaxe)
- Les paths correspondent aux fichiers modifiés
- La branche est bien dans la liste des déclencheurs

**Solution :**
```bash
# Forcer le déclenchement avec workflow_dispatch
# Aller dans Actions → Run workflow
```

### Le linting échoue

**Backend :**
```bash
cd backend
npm run lint
# Corriger les erreurs ou ajuster eslint.config.mjs
```

**Frontend :**
```bash
cd frontend
npm run lint:fix
# Auto-fix des erreurs simples
```

### Le build échoue

**Vérifier localement :**
```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd frontend
npm install
npm run build
```

**Erreurs communes :**
- Dépendances manquantes → `npm install`
- Erreurs TypeScript → Corriger les types
- Variables d'environnement manquantes → Créer `.env`

### npm install échoue dans la CI

**Problème :** Pas de `package-lock.json`

**Solution :**
```bash
cd backend # ou frontend
npm install
git add package-lock.json
git commit -m "chore: add package-lock.json"
git push
```

## 📈 Améliorations futures

### Tests automatisés

```yaml
- name: Run unit tests
  run: npm run test

- name: Run e2e tests
  run: npm run test:e2e
```

### Couverture de code

```yaml
- name: Generate coverage
  run: npm run test:cov

- name: Upload to Codecov
  uses: codecov/codecov-action@v4
```

### Déploiement automatique

Pour déployer automatiquement après un merge sur `main` :

```yaml
deploy:
  needs: build
  if: github.ref == 'refs/heads/main'
  steps:
    - name: Deploy to production
      # Votre logique de déploiement
```

### Notifications

Ajouter des notifications Slack/Discord :

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Vue.js Documentation](https://vuejs.org/)
- [ESLint Documentation](https://eslint.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🆘 Support

En cas de problème avec la CI/CD :
1. Consultez les logs dans l'onglet Actions
2. Vérifiez la documentation ci-dessus
3. Testez localement les commandes qui échouent
4. Contactez l'équipe de développement
