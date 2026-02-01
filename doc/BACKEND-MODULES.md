# 📦 Modules Backend EpiTrello - Documentation

Cette documentation détaille chaque module NestJS du backend, leurs responsabilités, services, controllers et DTOs.

## 📋 Table des matières

- [Architecture modulaire](#architecture-modulaire)
- [Module Supabase](#module-supabase)
- [Module Auth](#module-auth)
- [Module Users](#module-users)
- [Module Boards](#module-boards)
- [Module Lists](#module-lists)
- [Module Cards](#module-cards)
- [Module Labels](#module-labels)
- [Module Collaborators](#module-collaborators)
- [Module Friends](#module-friends)
- [Module Notifications](#module-notifications)

---

## 🏗️ Architecture modulaire

NestJS utilise une architecture modulaire où chaque fonctionnalité est encapsulée dans un module indépendant. Chaque module contient :

- **Module** (`.module.ts`) : Définit les imports, controllers, providers et exports
- **Controller** (`.controller.ts`) : Gère les routes HTTP et la validation
- **Service** (`.service.ts`) : Contient la logique métier
- **DTOs** (`dto/*.dto.ts`) : Data Transfer Objects pour la validation

### Pattern standard

```typescript
@Module({
  imports: [SupabaseModule],        // Dépendances
  controllers: [XxxController],      // Routes HTTP
  providers: [XxxService],           // Logique métier
  exports: [XxxService],             // Exposer pour d'autres modules
})
export class XxxModule {}
```

---

## 🗄️ Module Supabase

**Localisation:** `src/supabase/`

### Responsabilités

- Fournir des clients Supabase pour tous les modules
- Gérer la connexion à la base de données PostgreSQL
- Gérer l'authentification avec Supabase Auth
- Gérer le storage de fichiers

### Fichiers

- `supabase.module.ts` - Module configuration
- `supabase.service.ts` - Service d'accès Supabase

### SupabaseService

**Méthodes principales :**

#### `getClient(): SupabaseClient`
Client Supabase anonyme/public (sans session utilisateur).

**Usage :**
```typescript
const client = this.supabaseService.getClient();
const { data, error } = await client.from('boards').select('*');
```

**Quand l'utiliser :**
- Opérations publiques
- Authentification (signup/login)
- Requêtes sans contexte utilisateur

---

#### `getClientForUser(accessToken: string): SupabaseClient`
Client Supabase avec session utilisateur (JWT).

**Usage :**
```typescript
const client = this.supabaseService.getClientForUser(userToken);
const { data, error } = await client.from('boards').select('*');
```

**Quand l'utiliser :**
- Opérations nécessitant RLS (Row Level Security)
- Requêtes au nom d'un utilisateur spécifique
- Upload de fichiers par l'utilisateur

---

#### `getAdminClient(): SupabaseClient`
Client Supabase avec clé service role (bypass RLS).

**Usage :**
```typescript
const client = this.supabaseService.getAdminClient();
const { data, error } = await client.from('users').select('*');
```

**Quand l'utiliser :**
- Opérations admin nécessitant bypass RLS
- Gestion des collaborateurs
- Lecture cross-user

**⚠️ Attention :** Utiliser avec précaution, cette méthode bypasse toute sécurité RLS.

---

### Configuration

Variables d'environnement :
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGc...              # Clé anonyme
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Clé service role
```

---

## 🔐 Module Auth

**Localisation:** `src/auth/`

### Responsabilités

- Inscription et connexion des utilisateurs
- Gestion des sessions JWT
- Mise à jour du profil utilisateur
- Upload d'avatars
- Changement de mot de passe

### Fichiers

```
auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
└── dto/
    ├── signup.dto.ts
    ├── login.dto.ts
    ├── update-profile.dto.ts
    └── update-password.dto.ts
```

### AuthController

**Routes :**

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/signup` | Inscription |
| POST | `/auth/login` | Connexion |
| POST | `/auth/logout` | Déconnexion |
| PATCH | `/auth/profile/:id` | Mise à jour profil |
| POST | `/auth/profile/:id/avatar` | Upload avatar |
| PATCH | `/auth/password/:id` | Changement mot de passe |

### AuthService

**Méthodes principales :**

#### `signUp(signUpDto: SignUpDto)`
Crée un nouveau compte utilisateur avec Supabase Auth.

**Processus :**
1. Valide les données (email, password, username)
2. Crée le compte avec `auth.signUp()`
3. Insère le profil dans la table `profiles`
4. Retourne l'utilisateur et la session JWT

**Validation :**
- Email unique
- Username unique
- Password min 6 caractères

---

#### `login(loginDto: LoginDto)`
Authentifie un utilisateur existant.

**Processus :**
1. Vérifie si l'identifiant est un email ou username
2. Si username, récupère l'email depuis `profiles`
3. Authentifie avec `auth.signInWithPassword()`
4. Enrichit les données user avec le profil complet
5. Retourne user + session

**Supporte :**
- Login par email : `user@example.com`
- Login par username : `john_doe`

---

#### `updateProfile(id: string, updateProfileDto: UpdateProfileDto)`
Met à jour le profil utilisateur.

**Champs modifiables :**
- `username`
- `full_name`
- `avatar_url`

**Validation :**
- Username unique si modifié

---

#### `uploadAvatar(id: string, file: UploadedFileData)`
Upload une photo de profil vers Supabase Storage.

**Processus :**
1. Valide le fichier (type, taille)
2. Génère un nom unique : `${userId}-${timestamp}.ext`
3. Upload vers bucket `avatars`
4. Récupère l'URL publique
5. Met à jour `avatar_url` dans le profil

**Limitations :**
- Formats : JPEG, PNG, GIF, WebP
- Taille max : 5 MB

---

### DTOs

#### SignUpDto
```typescript
{
  email: string;          // Format email valide
  password: string;       // Min 6 caractères
  username: string;       // Alphanumérique + underscore
  full_name?: string;     // Optionnel
}
```

#### LoginDto
```typescript
{
  identifier: string;     // Email ou username
  password: string;
}
```

#### UpdateProfileDto
```typescript
{
  username?: string;
  full_name?: string;
  avatar_url?: string;
}
```

---

## 👤 Module Users

**Localisation:** `src/users/`

### Responsabilités

- Recherche d'utilisateurs
- Récupération de profils publics

### Fichiers

```
users/
├── users.module.ts
├── users.controller.ts
└── users.service.ts
```

### UsersController

**Routes :**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/users/search?q=...` | Rechercher utilisateurs |
| GET | `/users/profile/:userId` | Obtenir profil |

### UsersService

#### `searchUsers(query: string, excludeUserId?: string)`
Recherche des utilisateurs par username ou nom complet.

**Processus :**
1. Recherche dans `profiles.username` (ILIKE)
2. Recherche dans `profiles.full_name` (ILIKE)
3. Exclut l'utilisateur spécifié
4. Limite à 10 résultats

**Exemple :**
```typescript
const users = await usersService.searchUsers('john', 'current-user-id');
// Retourne: [{ id, username, full_name, avatar_url }]
```

---

#### `getProfile(userId: string)`
Récupère les informations publiques d'un utilisateur.

**Champs retournés :**
- `id`
- `username`
- `full_name`
- `avatar_url`
- `created_at`

---

## 📋 Module Boards

**Localisation:** `src/boards/`

### Responsabilités

- CRUD des tableaux
- Gestion de l'accès aux boards
- Création de boards par défaut avec listes

### Fichiers

```
boards/
├── boards.module.ts
├── boards.controller.ts
└── boards.service.ts
```

### Interface Board

```typescript
interface Board {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
  last_opened_at?: string;
}
```

### BoardsController

**Routes :**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/boards?userId=...` | Lister boards |
| GET | `/boards/:id` | Obtenir un board |
| POST | `/boards` | Créer board |
| PUT | `/boards/:id` | Modifier board |
| DELETE | `/boards/:id` | Supprimer board |
| POST | `/boards/default` | Créer board par défaut |

### BoardsService

#### `findAll(userId?: string): Promise<Board[]>`
Liste tous les boards, optionnellement filtrés par propriétaire.

**Tri :** Par `last_opened_at` DESC (boards récents en premier)

**Utilise :** Admin client (pour supporter collaborateurs)

---

#### `findOne(id: string): Promise<Board>`
Récupère un board spécifique et met à jour `last_opened_at`.

**Processus :**
1. Récupère le board
2. Met à jour `last_opened_at` avec timestamp actuel
3. Retourne les données

---

#### `create(board: Board): Promise<Board>`
Crée un nouveau board avec listes par défaut.

**Processus :**
1. Insère le board dans la table `boards`
2. Crée 3 listes par défaut :
   - "To Do" (position 0, bleu)
   - "In Progress" (position 1, orange)
   - "Done" (position 2, vert)
3. Retourne le board créé

---

#### `update(id: string, board: Partial<Board>): Promise<Board>`
Met à jour les propriétés d'un board.

**Champs modifiables :**
- `title`
- `description`
- `color`
- `is_favorite`

---

#### `remove(id: string): Promise<void>`
Supprime un board et toutes ses ressources associées.

**Cascade :** Supprime automatiquement listes, cartes, labels (via RLS)

---

#### `createDefaultBoard(userId: string): Promise<Board>`
Crée un board "Welcome Board" avec des listes et cartes d'exemple.

**Contenu :**
- Board : "Welcome Board"
- 3 listes : To Do, In Progress, Done
- Cartes d'exemple avec descriptions

---

## 📝 Module Lists

**Localisation:** `src/lists/`

### Responsabilités

- CRUD des listes
- Gestion de la position des listes
- Réorganisation des listes

### Fichiers

```
lists/
├── lists.module.ts
├── lists.controller.ts
└── lists.service.ts
```

### Interface List

```typescript
interface List {
  id?: string;
  board_id: string;
  title: string;
  position: number;
  color?: string;
  created_at?: string;
  updated_at?: string;
}
```

### ListsController

**Routes :**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/lists?boardId=...` | Lister listes d'un board |
| GET | `/lists/:id` | Obtenir une liste |
| POST | `/lists` | Créer liste |
| PUT | `/lists/:id` | Modifier liste |
| DELETE | `/lists/:id` | Supprimer liste |

### ListsService

#### `findAll(boardId: string): Promise<List[]>`
Récupère toutes les listes d'un board.

**Tri :** Par `position` ASC

**Usage :**
```typescript
const lists = await listsService.findAll('board-uuid');
```

---

#### `create(list: List): Promise<List>`
Crée une nouvelle liste dans un board.

**Champs requis :**
- `board_id`
- `title`
- `position`

---

#### `update(id: string, list: Partial<List>): Promise<List>`
Met à jour une liste (titre, position, couleur).

**Use case :** Drag & drop pour réorganiser

---

## 🗂️ Module Cards

**Localisation:** `src/cards/`

### Responsabilités

- CRUD des cartes
- Gestion des pièces jointes
- Upload de fichiers vers Supabase Storage
- Assignation de cartes

### Fichiers

```
cards/
├── cards.module.ts
├── cards.controller.ts
└── cards.service.ts
```

### Interface Card

```typescript
interface Card {
  id?: string;
  list_id: string;
  title: string;
  description?: string;
  position: number;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
}
```

### CardsController

**Routes :**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/cards?listId=...` | Lister cartes |
| GET | `/cards/:id` | Obtenir carte |
| POST | `/cards` | Créer carte |
| PUT | `/cards/:id` | Modifier carte |
| DELETE | `/cards/:id` | Supprimer carte |
| GET | `/cards/:id/attachments` | Lister pièces jointes |
| POST | `/cards/:id/attachments` | Upload pièce jointe |
| DELETE | `/cards/attachments/:attachmentId` | Supprimer pièce jointe |

### CardsService

#### `findAll(listId: string): Promise<Card[]>`
Liste toutes les cartes d'une liste.

**Tri :** Par `position` ASC

---

#### `create(card: Card): Promise<Card>`
Crée une nouvelle carte dans une liste.

**Champs requis :**
- `list_id`
- `title`
- `position`

**Champs optionnels :**
- `description`
- `due_date`
- `priority`
- `assigned_to`

---

#### `update(id: string, card: Partial<Card>): Promise<Card>`
Met à jour une carte.

**Use cases :**
- Déplacer vers une autre liste (`list_id`)
- Changer la position (drag & drop)
- Modifier le contenu
- Assigner à un utilisateur

---

#### `addAttachment(cardId: string, file: Express.Multer.File): Promise<CardAttachment>`
Upload un fichier et l'attache à une carte.

**Processus :**
1. Valide le fichier (type, taille max 10 MB)
2. Génère un nom unique : `${cardId}/${uuid}-${filename}`
3. Upload vers bucket `attachments`
4. Insère metadata dans table `card_attachments`
5. Retourne l'attachement créé

**Formats acceptés :**
- Documents : PDF, DOC, DOCX, XLS, XLSX
- Images : JPEG, PNG, GIF, WebP
- Archives : ZIP, RAR

---

#### `removeAttachment(attachmentId: string): Promise<void>`
Supprime une pièce jointe.

**Processus :**
1. Récupère l'attachment depuis la DB
2. Supprime le fichier du storage
3. Supprime l'enregistrement de la DB

---

## 🏷️ Module Labels

**Localisation:** `src/labels/`

### Responsabilités

- CRUD des étiquettes
- Gestion des couleurs
- Association labels ↔ cartes

### Fichiers

```
labels/
├── labels.module.ts
├── labels.controller.ts
└── labels.service.ts
```

### Interface Label

```typescript
interface Label {
  id?: string;
  board_id: string;
  name: string;
  color: string;          // Hex color: #RRGGBB
  created_at?: string;
}
```

### LabelsController

**Routes :**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/labels?boardId=...` | Lister labels |
| GET | `/labels/:id` | Obtenir label |
| POST | `/labels` | Créer label |
| PUT | `/labels/:id` | Modifier label |
| DELETE | `/labels/:id` | Supprimer label |

### LabelsService

#### `findAll(boardId: string): Promise<Label[]>`
Liste tous les labels d'un board.

**Usage :**
```typescript
const labels = await labelsService.findAll('board-uuid');
// [{ id, name: 'Bug', color: '#E74C3C', board_id }]
```

---

#### `create(label: Label): Promise<Label>`
Crée un nouveau label.

**Validation :**
- `name` requis
- `color` format hex valide
- `board_id` requis

---

## 👥 Module Collaborators

**Localisation:** `src/collaborators/`

### Responsabilités

- Inviter des utilisateurs à collaborer
- Gérer les rôles (owner, editor, viewer)
- Accepter/refuser invitations
- Retirer des collaborateurs
- Lister boards partagés

### Fichiers

```
collaborators/
├── collaborators.module.ts
├── collaborators.controller.ts
└── collaborators.service.ts
```

### Interface Collaborator

```typescript
interface Collaborator {
  id?: string;
  board_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  invited_by?: string;
  invited_at?: string;
  accepted_at?: string;
}
```

### CollaboratorsController

**Routes :**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/boards/:boardId/collaborators` | Lister collaborateurs |
| POST | `/boards/:boardId/collaborators` | Inviter |
| POST | `/boards/:boardId/collaborators/respond` | Répondre invitation |
| PATCH | `/boards/:boardId/collaborators/:userId/role` | Changer rôle |
| DELETE | `/boards/:boardId/collaborators/:userId` | Retirer |
| GET | `/boards/shared/:userId` | Boards partagés |

### CollaboratorsService

#### `getCollaborators(boardId: string)`
Liste tous les collaborateurs d'un board avec leurs profils.

**Inclut :**
- Données collaborateur (rôle, status)
- Profil utilisateur (username, avatar)

---

#### `addCollaborator(boardId, userId, invitedBy, role)`
Invite un utilisateur à collaborer.

**Processus :**
1. Vérifie que l'utilisateur existe
2. Vérifie qu'il n'est pas déjà collaborateur
3. Crée l'invitation avec status `pending`
4. Crée une notification pour l'invité

**Rôles disponibles :**
- `owner` - Propriétaire (tous droits)
- `editor` - Éditeur (modification)
- `viewer` - Lecteur (lecture seule)

---

#### `respondToInvitation(boardId, userId, accept)`
Accepte ou refuse une invitation.

**Si accepté :**
- Change status → `accepted`
- Set `accepted_at`
- Crée notification pour l'inviteur

**Si refusé :**
- Change status → `rejected`
- Crée notification pour l'inviteur

---

#### `updateCollaboratorRole(boardId, userId, role, requesterId)`
Change le rôle d'un collaborateur.

**Permissions :**
- Seul le `owner` peut changer les rôles
- Ne peut pas modifier le rôle du owner

---

#### `removeCollaborator(boardId, userId, requesterId)`
Retire un collaborateur d'un board.

**Permissions :**
- Owner peut retirer n'importe qui (sauf lui-même)
- Collaborateur peut se retirer lui-même

---

#### `getSharedBoards(userId)`
Liste tous les boards où l'utilisateur est collaborateur.

**Retourne :**
- Board complet (title, description, color)
- Rôle de l'utilisateur
- Status de la collaboration

---

## 🤝 Module Friends

**Localisation:** `src/friends/`

### Responsabilités

- Recherche d'utilisateurs
- Système de demandes d'ami
- Gestion de la liste d'amis
- Notifications de demandes

### Fichiers

```
friends/
├── friends.module.ts
├── friends.controller.ts
├── friends.service.ts
└── dto/
    └── friends.dto.ts
```

### Interfaces

```typescript
interface FriendRequest {
  id?: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

interface Friendship {
  id?: string;
  user_id: string;
  friend_id: string;
  created_at?: string;
}
```

### FriendsController

**Routes :**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/friends/search?q=...` | Rechercher utilisateurs |
| GET | `/friends/:userId` | Lister amis |
| GET | `/friends/profile/:userId` | Profil utilisateur |
| POST | `/friends/request` | Envoyer demande |
| GET | `/friends/requests/:userId/incoming` | Demandes reçues |
| GET | `/friends/requests/:userId/outgoing` | Demandes envoyées |
| PATCH | `/friends/request/:requestId` | Répondre demande |
| DELETE | `/friends/:userId/:friendId` | Supprimer ami |

### FriendsService

#### `sendFriendRequest(fromUserId, toUserId)`
Envoie une demande d'ami.

**Validations :**
1. Vérifie que les utilisateurs existent
2. Vérifie qu'ils ne sont pas déjà amis
3. Vérifie qu'il n'y a pas de demande en attente
4. Crée la demande avec status `pending`
5. Crée une notification pour le destinataire

---

#### `respondToFriendRequest(requestId, status)`
Accepte ou refuse une demande d'ami.

**Si accepté (`status: 'accepted'`) :**
1. Met à jour le status de la demande
2. Crée 2 entrées dans `friendships` (relation bidirectionnelle)
   - user_id → friend_id
   - friend_id → user_id
3. Crée une notification d'acceptation

**Si refusé (`status: 'rejected'`) :**
1. Met à jour le status de la demande
2. Crée une notification de refus

---

#### `getFriends(userId)`
Liste tous les amis d'un utilisateur.

**Retourne :**
- Liste des friendships
- Profils des amis (username, avatar)

---

#### `removeFriend(userId, friendId)`
Supprime une amitié.

**Processus :**
1. Supprime les 2 entrées dans `friendships`
   - userId → friendId
   - friendId → userId
2. Supprime toutes les demandes associées

---

## 🔔 Module Notifications

**Localisation:** `src/notifications/`

### Responsabilités

- Créer et gérer les notifications
- Marquer comme lu/non-lu
- Compter les notifications non lues
- Supprimer les notifications

### Fichiers

```
notifications/
├── notifications.module.ts
├── notifications.controller.ts
└── notifications.service.ts
```

### Interface Notification

```typescript
interface Notification {
  id?: string;
  user_id: string;
  type: 'friend_request' | 'friend_accepted' | 'board_invitation' | 'card_assigned';
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string;      // ID de la ressource liée
  created_at?: string;
  read_at?: string;
}
```

### NotificationsController

**Routes :**

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/notifications/:userId` | Lister notifications |
| GET | `/notifications/:userId/unread-count` | Compter non lues |
| PATCH | `/notifications/:notificationId/read` | Marquer lue |
| PATCH | `/notifications/:userId/read-all` | Tout marquer lu |
| DELETE | `/notifications/:notificationId` | Supprimer |

### NotificationsService

#### `getAll(userId: string)`
Liste toutes les notifications d'un utilisateur.

**Tri :** Par `created_at` DESC (plus récentes en premier)

---

#### `getUnreadCount(userId: string)`
Compte les notifications non lues.

**Retourne :** `{ count: number }`

---

#### `markAsRead(notificationId: string)`
Marque une notification comme lue.

**Met à jour :**
- `is_read` → `true`
- `read_at` → timestamp actuel

---

#### `markAllAsRead(userId: string)`
Marque toutes les notifications comme lues.

**Retourne :** Nombre de notifications mises à jour

---

#### `create(notification: Notification)`
Crée une nouvelle notification.

**Types de notifications :**
- `friend_request` - Demande d'ami reçue
- `friend_accepted` - Demande acceptée
- `board_invitation` - Invitation à un board
- `card_assigned` - Carte assignée
- `card_due_soon` - Échéance proche

---

## 📚 Ressources complémentaires

- **[BACKEND.md](BACKEND.md)** - Architecture générale
- **[BACKEND-API.md](BACKEND-API.md)** - Documentation API complète
- **[BACKEND-SUPABASE.md](BACKEND-SUPABASE.md)** - Configuration Supabase
- **[BACKEND-DEVELOPMENT.md](BACKEND-DEVELOPMENT.md)** - Guide de développement
