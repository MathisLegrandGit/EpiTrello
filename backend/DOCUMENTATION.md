# 📚 Documentation EpiTrello Backend

## 🚀 Démarrage Rapide

### Installation
```bash
cd backend
npm install
```

### Configuration
Le fichier `.env` doit contenir :
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
PORT=3000
```

### Lancement
```bash
# Mode développement (avec hot-reload)
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

Le serveur démarre sur `http://localhost:3000`

---

## 🗄️ Structure de la Base de Données (Supabase)

### Table `boards`
Représente les tableaux Trello.

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Colonnes :**
- `id` : Identifiant unique (UUID)
- `title` : Nom du tableau (requis)
- `description` : Description du tableau (optionnel)
- `created_at` : Date de création
- `updated_at` : Date de dernière modification

---

### Table `lists`
Représente les colonnes d'un tableau (ex: "À faire", "En cours", "Terminé").

```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lists_board_id ON lists(board_id);
```

**Colonnes :**
- `id` : Identifiant unique (UUID)
- `board_id` : Référence vers le tableau parent (requis)
- `title` : Nom de la liste (requis)
- `position` : Position de la liste dans le tableau (pour l'ordre)
- `created_at` : Date de création
- `updated_at` : Date de dernière modification

**Relations :**
- `board_id` → `boards(id)` avec suppression en cascade

---

### Table `cards`
Représente les cartes/tâches dans une liste.

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cards_list_id ON cards(list_id);
```

**Colonnes :**
- `id` : Identifiant unique (UUID)
- `list_id` : Référence vers la liste parente (requis)
- `title` : Titre de la carte (requis)
- `description` : Description détaillée (optionnel)
- `position` : Position de la carte dans la liste (pour l'ordre)
- `created_at` : Date de création
- `updated_at` : Date de dernière modification

**Relations :**
- `list_id` → `lists(id)` avec suppression en cascade

---

## 🛣️ Routes API

### Boards (Tableaux)

#### `GET /boards`
Récupère tous les tableaux.

**Réponse :**
```json
[
  {
    "id": "uuid",
    "title": "Mon Tableau",
    "description": "Description",
    "created_at": "2025-11-14T10:00:00Z",
    "updated_at": "2025-11-14T10:00:00Z"
  }
]
```

#### `GET /boards/:id`
Récupère un tableau spécifique.

**Paramètres :**
- `id` : UUID du tableau

**Réponse :** Objet board ou 404

#### `POST /boards`
Crée un nouveau tableau.

**Body :**
```json
{
  "title": "Nouveau Tableau",
  "description": "Description optionnelle"
}
```

**Réponse :** Objet board créé avec son UUID

#### `PUT /boards/:id`
Met à jour un tableau.

**Paramètres :**
- `id` : UUID du tableau

**Body :**
```json
{
  "title": "Titre modifié",
  "description": "Nouvelle description"
}
```

#### `DELETE /boards/:id`
Supprime un tableau (et toutes ses listes/cartes en cascade).

**Paramètres :**
- `id` : UUID du tableau

---

### Lists (Listes)

#### `GET /lists`
Récupère toutes les listes.

**Query params optionnels :**
- `boardId` : Filtrer par tableau

**Exemples :**
```
GET /lists                    # Toutes les listes
GET /lists?boardId=uuid       # Listes d'un tableau
```

#### `GET /lists/:id`
Récupère une liste spécifique.

#### `POST /lists`
Crée une nouvelle liste.

**Body :**
```json
{
  "board_id": "uuid-du-tableau",
  "title": "À faire",
  "position": 0
}
```

#### `PUT /lists/:id`
Met à jour une liste (titre, position, etc.).

**Body :**
```json
{
  "title": "En cours",
  "position": 1
}
```

#### `DELETE /lists/:id`
Supprime une liste (et toutes ses cartes en cascade).

---

### Cards (Cartes)

#### `GET /cards`
Récupère toutes les cartes.

**Query params optionnels :**
- `listId` : Filtrer par liste

**Exemples :**
```
GET /cards                    # Toutes les cartes
GET /cards?listId=uuid        # Cartes d'une liste
```

#### `GET /cards/:id`
Récupère une carte spécifique.

#### `POST /cards`
Crée une nouvelle carte.

**Body :**
```json
{
  "list_id": "uuid-de-la-liste",
  "title": "Ma tâche",
  "description": "Description détaillée",
  "position": 0
}
```

#### `PUT /cards/:id`
Met à jour une carte.

**Body pour modifier le contenu :**
```json
{
  "title": "Tâche modifiée",
  "description": "Nouvelle description"
}
```

**Body pour déplacer vers une autre liste :**
```json
{
  "list_id": "uuid-nouvelle-liste",
  "position": 0
}
```

#### `DELETE /cards/:id`
Supprime une carte.

---

## 🏗️ Architecture du Code

### Structure des dossiers
```
backend/
├── src/
│   ├── boards/          # Module Boards
│   │   ├── boards.controller.ts
│   │   ├── boards.service.ts
│   │   └── boards.module.ts
│   ├── lists/           # Module Lists
│   │   ├── lists.controller.ts
│   │   ├── lists.service.ts
│   │   └── lists.module.ts
│   ├── cards/           # Module Cards
│   │   ├── cards.controller.ts
│   │   ├── cards.service.ts
│   │   └── cards.module.ts
│   ├── supabase/        # Module Supabase
│   │   ├── supabase.service.ts
│   │   └── supabase.module.ts
│   ├── app.module.ts    # Module principal
│   └── main.ts          # Point d'entrée
├── .env                 # Variables d'environnement
├── api.rest             # Fichier REST Client
└── DOCUMENTATION.md     # Cette documentation
```

### Services

#### SupabaseService
Gère la connexion à Supabase. Injecté dans tous les autres services.

```typescript
constructor(private supabaseService: SupabaseService) {}
```

#### BoardsService / ListsService / CardsService
Contiennent la logique métier et les appels à Supabase :
- `findAll()` : Récupérer tous les éléments
- `findOne(id)` : Récupérer un élément
- `create(data)` : Créer un élément
- `update(id, data)` : Mettre à jour un élément
- `remove(id)` : Supprimer un élément

### Controllers
Définissent les routes HTTP et appellent les services correspondants.

---

## 🔧 Configuration CORS

Le CORS est activé pour permettre les requêtes depuis le frontend :
```typescript
app.enableCors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
});
```

Pour ajouter d'autres origines, modifiez `src/main.ts`.

---

## 🧪 Tests avec REST Client

Utilisez le fichier `api.rest` avec l'extension **REST Client** de VS Code :

1. Installez l'extension "REST Client"
2. Ouvrez `api.rest`
3. Cliquez sur "Send Request" au-dessus de chaque requête
4. Remplacez les variables (`{{boardId}}`, etc.) par vos vraies valeurs

---

## 📝 Exemples d'utilisation

### Créer un workflow complet

```bash
# 1. Créer un tableau
POST /boards
{
  "title": "Projet EpiTrello",
  "description": "Gestion du projet"
}
# → Récupérer le board_id

# 2. Créer des listes
POST /lists
{
  "board_id": "board-uuid",
  "title": "À faire",
  "position": 0
}
# → Répéter pour "En cours" (position: 1), "Terminé" (position: 2)
# → Récupérer les list_id

# 3. Créer des cartes
POST /cards
{
  "list_id": "list-uuid",
  "title": "Implémenter l'authentification",
  "description": "Ajouter JWT et guards",
  "position": 0
}

# 4. Déplacer une carte
PUT /cards/:id
{
  "list_id": "autre-list-uuid",
  "position": 0
}
```

---

## 🐛 Debugging

### Vérifier la connexion Supabase
Le service lance une erreur au démarrage si les variables d'environnement sont manquantes.

### Logs
Les erreurs Supabase sont automatiquement propagées par NestJS.

### Tester localement
```bash
# Terminal 1 : Backend
cd backend
npm run start:dev

# Terminal 2 : Tester les routes
curl http://localhost:3000/boards
```

---

## 📦 Dépendances principales

- `@nestjs/core` : Framework NestJS
- `@nestjs/config` : Gestion des variables d'environnement
- `@supabase/supabase-js` : Client Supabase
- `class-validator` : Validation des données
- `class-transformer` : Transformation des données

---

## 🚧 Améliorations futures

- [ ] Ajouter l'authentification (JWT)
- [ ] Ajouter des DTOs avec validation
- [ ] Implémenter les websockets pour temps réel
- [ ] Ajouter des tests unitaires et e2e
- [ ] Ajouter la pagination
- [ ] Ajouter des filtres et tri avancés
- [ ] Implémenter le système de membres/permissions
