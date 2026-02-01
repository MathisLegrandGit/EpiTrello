# 🔌 Intégration Supabase - EpiTrello Backend

Cette documentation explique l'intégration de Supabase dans le backend EpiTrello, incluant la configuration, la structure de la base de données, Row Level Security (RLS) et le storage.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Configuration](#configuration)
- [Structure de la base de données](#structure-de-la-base-de-données)
- [Row Level Security (RLS)](#row-level-security-rls)
- [Authentification](#authentification)
- [Storage](#storage)
- [Bonnes pratiques](#bonnes-pratiques)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

**Supabase** est utilisé comme Backend-as-a-Service (BaaS) pour EpiTrello, fournissant :

- **PostgreSQL** - Base de données relationnelle
- **Auth** - Système d'authentification JWT
- **Storage** - Stockage de fichiers (avatars, attachments)
- **Row Level Security** - Sécurité au niveau des lignes
- **Realtime** - Subscriptions temps réel (optionnel)

### Architecture

```
NestJS Backend
    ↓
SupabaseService
    ↓
┌─────────────────────────────────┐
│         Supabase Cloud          │
│                                 │
│  ┌──────────┐  ┌────────────┐  │
│  │PostgreSQL│  │    Auth    │  │
│  └──────────┘  └────────────┘  │
│                                 │
│  ┌──────────┐  ┌────────────┐  │
│  │ Storage  │  │  Realtime  │  │
│  └──────────┘  └────────────┘  │
└─────────────────────────────────┘
```

---

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` dans `backend/` :

```env
# Supabase Configuration
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=eyJhbGc...                        # Clé anonyme publique
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...           # Clé service role (admin)

# Application
PORT=3000
NODE_ENV=development
```

### Obtenir les clés

1. Allez sur [supabase.com](https://supabase.com)
2. Créez ou ouvrez votre projet
3. **Settings** → **API**
4. Copiez :
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Secret !

### SupabaseModule

Le module Supabase est configuré dans `src/supabase/supabase.module.ts` :

```typescript
@Global()
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
```

**`@Global()`** : Rend le service disponible dans toute l'application sans imports explicites.

---

## 🗄️ Structure de la base de données

### Tables principales

#### 1. `profiles` (Profils utilisateurs)

Stocke les informations publiques des utilisateurs.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes :**
- `username` (UNIQUE)
- `email` (UNIQUE)

**Triggers :**
- Auto-création lors de l'inscription (via trigger Supabase Auth)
- Auto-update de `updated_at`

---

#### 2. `boards` (Tableaux)

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#4A90E2',
  background_image TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  last_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relations :**
- `user_id` → `profiles.id` (propriétaire)

---

#### 3. `board_collaborators` (Collaborateurs)

```sql
CREATE TABLE board_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(board_id, user_id)
);
```

**Constraints :**
- Combinaison `(board_id, user_id)` unique
- Rôles: `owner`, `editor`, `viewer`
- Status: `pending`, `accepted`, `rejected`

---

#### 4. `lists` (Listes)

```sql
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relations :**
- `board_id` → `boards.id`

**Index :**
- `(board_id, position)` pour tri rapide

---

#### 5. `cards` (Cartes)

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  due_date TIMESTAMPTZ,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relations :**
- `list_id` → `lists.id`
- `assigned_to` → `profiles.id`

---

#### 6. `labels` (Étiquettes)

```sql
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Table de liaison :** `card_labels`

```sql
CREATE TABLE card_labels (
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, label_id)
);
```

---

#### 7. `card_attachments` (Pièces jointes)

```sql
CREATE TABLE card_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relations :**
- `card_id` → `cards.id`
- `uploaded_by` → `profiles.id`

---

#### 8. `friendships` (Amis)

```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);
```

**Note :** Relation bidirectionnelle (2 entrées par amitié)

---

#### 9. `friend_requests` (Demandes d'ami)

```sql
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);
```

---

#### 10. `notifications` (Notifications)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
```

**Types de notifications :**
- `friend_request`
- `friend_accepted`
- `board_invitation`
- `card_assigned`
- `card_due_soon`

---

### Schéma relationnel

```
profiles (utilisateurs)
    ↓
    ├── boards (tableaux)
    │       ├── board_collaborators (collaborateurs)
    │       ├── lists (listes)
    │       │       └── cards (cartes)
    │       │               ├── card_labels (étiquettes)
    │       │               └── card_attachments (fichiers)
    │       └── labels (étiquettes du board)
    │
    ├── friendships (amis)
    ├── friend_requests (demandes)
    └── notifications (notifications)
```

---

## 🔒 Row Level Security (RLS)

### Concept

RLS permet de sécuriser les données au niveau des **lignes** (rows) de la base de données. Chaque requête est automatiquement filtrée selon les permissions de l'utilisateur authentifié.

### Activation

RLS est activé sur toutes les tables :

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
-- etc.
```

### Politiques principales

#### Profiles

```sql
-- Tout le monde peut lire les profils publics
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

---

#### Boards

```sql
-- Les utilisateurs peuvent voir leurs propres boards
CREATE POLICY "Users can view own boards"
ON boards FOR SELECT
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent créer des boards
CREATE POLICY "Users can create boards"
ON boards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent modifier leurs boards
CREATE POLICY "Users can update own boards"
ON boards FOR UPDATE
USING (auth.uid() = user_id);

-- Les utilisateurs peuvent supprimer leurs boards
CREATE POLICY "Users can delete own boards"
ON boards FOR DELETE
USING (auth.uid() = user_id);
```

---

#### Board Collaborators

```sql
-- Les collaborateurs peuvent voir les collaborateurs du board
CREATE POLICY "Collaborators can view board collaborators"
ON board_collaborators FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM board_collaborators bc
    WHERE bc.board_id = board_collaborators.board_id
    AND bc.user_id = auth.uid()
    AND bc.status = 'accepted'
  )
);

-- Les propriétaires peuvent ajouter des collaborateurs
CREATE POLICY "Owners can add collaborators"
ON board_collaborators FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = board_collaborators.board_id
    AND boards.user_id = auth.uid()
  )
);
```

---

#### Lists & Cards

```sql
-- Les collaborateurs peuvent voir les listes d'un board partagé
CREATE POLICY "Collaborators can view lists"
ON lists FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM board_collaborators bc
    WHERE bc.board_id = lists.board_id
    AND bc.user_id = auth.uid()
    AND bc.status = 'accepted'
  )
  OR
  EXISTS (
    SELECT 1 FROM boards
    WHERE boards.id = lists.board_id
    AND boards.user_id = auth.uid()
  )
);

-- Les éditeurs peuvent créer des cartes
CREATE POLICY "Editors can create cards"
ON cards FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lists l
    JOIN board_collaborators bc ON bc.board_id = l.board_id
    WHERE l.id = cards.list_id
    AND bc.user_id = auth.uid()
    AND bc.role IN ('owner', 'editor')
    AND bc.status = 'accepted'
  )
);
```

---

### Bypass RLS avec Service Role

Le service role bypasse **toutes** les politiques RLS. Utilisé dans le backend pour :
- Gestion des collaborateurs
- Opérations cross-user
- Migrations et maintenance

**⚠️ Attention :** Ne jamais exposer la clé service role au frontend !

```typescript
// Backend only
const client = this.supabaseService.getAdminClient();
const { data } = await client.from('boards').select('*'); // Bypasse RLS
```

---

## 🔑 Authentification

### Flux d'authentification

#### 1. Inscription (Signup)

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      username: 'john_doe',
      full_name: 'John Doe'
    }
  }
});
```

**Processus :**
1. Supabase Auth crée l'utilisateur dans `auth.users`
2. Un trigger crée automatiquement le profil dans `profiles`
3. Retourne un JWT `access_token` valide 1h
4. Retourne un `refresh_token` valide 30 jours

---

#### 2. Connexion (Login)

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

**Retourne :**
- `access_token` - JWT à envoyer dans les requêtes
- `refresh_token` - Pour renouveler le token
- `user` - Informations utilisateur

---

#### 3. Utiliser le JWT dans les requêtes

**Frontend → Backend :**
```http
GET /boards
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend → Supabase :**
```typescript
const client = this.supabaseService.getClientForUser(accessToken);
const { data } = await client.from('boards').select('*');
// RLS appliqué avec auth.uid() = user_id du JWT
```

---

#### 4. Rafraîchir le token

```typescript
const { data, error } = await supabase.auth.refreshSession({
  refresh_token: 'refresh_token_here'
});
```

**Quand rafraîchir :**
- Avant expiration du `access_token` (< 1h)
- Lors du chargement de l'app
- Après 401 Unauthorized

---

### Décoder le JWT

Le JWT contient :

```json
{
  "aud": "authenticated",
  "exp": 1706778000,
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "username": "john_doe",
    "full_name": "John Doe"
  }
}
```

**`sub`** : User ID utilisé par RLS comme `auth.uid()`

---

## 📦 Storage

### Buckets

EpiTrello utilise 2 buckets Supabase Storage :

#### 1. `avatars` - Photos de profil

**Configuration :**
- Public : ✅ Oui (URLs accessibles sans auth)
- Taille max fichier : 5 MB
- Formats acceptés : JPEG, PNG, GIF, WebP

**Structure :**
```
avatars/
  └── user-uuid-timestamp.jpg
```

**Upload :**
```typescript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}-${Date.now()}.jpg`, file);

const publicUrl = supabase.storage
  .from('avatars')
  .getPublicUrl(data.path).data.publicUrl;
```

---

#### 2. `attachments` - Pièces jointes

**Configuration :**
- Public : ✅ Oui
- Taille max fichier : 10 MB
- Formats acceptés : PDF, images, documents, archives

**Structure :**
```
attachments/
  └── card-uuid/
      ├── attachment1-uuid-filename.pdf
      └── attachment2-uuid-filename.jpg
```

**Upload :**
```typescript
const path = `${cardId}/${uuid()}-${filename}`;
const { data, error } = await supabase.storage
  .from('attachments')
  .upload(path, file);
```

---

### Politiques de sécurité Storage

```sql
-- Tout le monde peut lire les avatars (public)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Les utilisateurs authentifiés peuvent uploader leur avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Les utilisateurs peuvent supprimer leur avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);
```

---

### Limites de taille

**Configuration dans Supabase Dashboard :**

1. **Settings** → **Storage**
2. Ajuster **File size limit**
3. Par défaut : 50 MB max

**Backend validation :**
```typescript
if (file.size > 5 * 1024 * 1024) { // 5 MB
  throw new BadRequestException('File too large');
}
```

---

## ✅ Bonnes pratiques

### 1. Utiliser le bon client Supabase

```typescript
// ❌ Mauvais : Utiliser getClient() pour des opérations utilisateur
const client = this.supabaseService.getClient();
const { data } = await client.from('boards').select('*');
// RLS non appliqué correctement

// ✅ Bon : Utiliser getClientForUser() avec JWT
const client = this.supabaseService.getClientForUser(accessToken);
const { data } = await client.from('boards').select('*');
// RLS appliqué avec le contexte utilisateur

// ✅ Admin : Utiliser getAdminClient() pour bypass RLS (operations admin)
const client = this.supabaseService.getAdminClient();
const { data } = await client.from('board_collaborators').select('*');
```

---

### 2. Gérer les erreurs Supabase

```typescript
const { data, error } = await supabase.from('boards').select('*');

if (error) {
  // Log l'erreur pour debugging
  console.error('Supabase error:', error);
  
  // Throw une exception NestJS appropriée
  if (error.code === 'PGRST116') {
    throw new NotFoundException('Board not found');
  }
  
  throw new InternalServerErrorException('Database error');
}

return data;
```

---

### 3. Optimiser les requêtes

```typescript
// ❌ Mauvais : N+1 queries
const boards = await supabase.from('boards').select('*');
for (const board of boards) {
  const lists = await supabase.from('lists').select('*').eq('board_id', board.id);
}

// ✅ Bon : Join avec select nested
const boards = await supabase
  .from('boards')
  .select(`
    *,
    lists (
      *,
      cards (*)
    )
  `);
```

---

### 4. Utiliser les transactions (RPC)

Pour des opérations complexes, créer des fonctions PostgreSQL :

```sql
CREATE OR REPLACE FUNCTION accept_friend_request(request_id UUID)
RETURNS void AS $$
BEGIN
  -- Update request status
  UPDATE friend_requests
  SET status = 'accepted', updated_at = NOW()
  WHERE id = request_id;
  
  -- Create friendships (both directions)
  INSERT INTO friendships (user_id, friend_id)
  SELECT from_user_id, to_user_id FROM friend_requests WHERE id = request_id
  UNION
  SELECT to_user_id, from_user_id FROM friend_requests WHERE id = request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Appel depuis NestJS :**
```typescript
const { error } = await supabase.rpc('accept_friend_request', {
  request_id: requestId
});
```

---

### 5. Indexes pour les performances

```sql
-- Index pour les recherches fréquentes
CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_lists_board_id ON lists(board_id);
CREATE INDEX idx_cards_list_id ON cards(list_id);
CREATE INDEX idx_cards_assigned_to ON cards(assigned_to);

-- Index pour les tris
CREATE INDEX idx_lists_position ON lists(board_id, position);
CREATE INDEX idx_cards_position ON cards(list_id, position);

-- Index pour les recherches textuelles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
```

---

## 🐛 Troubleshooting

### Erreur : "new row violates row-level security policy"

**Cause :** RLS bloque l'insertion/modification.

**Solution :**
1. Vérifier que l'utilisateur est authentifié
2. Vérifier les politiques RLS avec `EXPLAIN`
3. Utiliser `getAdminClient()` si opération admin légitime

```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename = 'boards';
```

---

### Erreur : "relation does not exist"

**Cause :** Table non créée ou mauvais schema.

**Solution :**
```sql
-- Vérifier l'existence de la table
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'boards';

-- Créer la table si manquante
CREATE TABLE boards (...);
```

---

### Upload échoue

**Causes possibles :**
1. Fichier trop gros (> limite)
2. Bucket n'existe pas
3. Politiques storage incorrectes

**Solution :**
```typescript
// 1. Vérifier la taille
if (file.size > MAX_SIZE) throw new Error('Too large');

// 2. Vérifier le bucket
const { data: buckets } = await supabase.storage.listBuckets();
console.log('Buckets:', buckets);

// 3. Vérifier les politiques dans Supabase Dashboard
```

---

### JWT expiré

**Cause :** `access_token` expiré (> 1h).

**Solution :**
```typescript
// Rafraîchir le token
const { data, error } = await supabase.auth.refreshSession({
  refresh_token: storedRefreshToken
});

if (!error) {
  // Utiliser le nouveau access_token
  const newAccessToken = data.session.access_token;
}
```

---

### Performances lentes

**Causes :**
1. Pas d'index sur les colonnes filtrées
2. N+1 queries
3. Trop de données retournées

**Solutions :**
```sql
-- Ajouter des index
CREATE INDEX idx_boards_user_id ON boards(user_id);

-- Utiliser EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM boards WHERE user_id = 'uuid';
```

```typescript
// Limiter les données retournées
const { data } = await supabase
  .from('boards')
  .select('id, title, color')  // Seulement les champs nécessaires
  .limit(10);
```

---

## 📚 Ressources complémentaires

- **[Documentation Supabase](https://supabase.com/docs)** - Documentation officielle
- **[Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)** - Guide RLS
- **[Storage](https://supabase.com/docs/guides/storage)** - Guide Storage
- **[BACKEND.md](BACKEND.md)** - Architecture backend
- **[BACKEND-API.md](BACKEND-API.md)** - Documentation API
- **[BACKEND-MODULES.md](BACKEND-MODULES.md)** - Modules NestJS
