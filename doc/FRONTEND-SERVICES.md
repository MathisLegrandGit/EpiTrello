# 🔌 Services Frontend - EpiTrello

Cette documentation détaille les services HTTP et utilitaires du frontend EpiTrello.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Service API principal](#service-api-principal)
- [API Boards](#api-boards)
- [API Lists](#api-lists)
- [API Cards](#api-cards)
- [API Labels](#api-labels)
- [API Auth](#api-auth)
- [API Users](#api-users)
- [API Collaborators](#api-collaborators)
- [API Friends](#api-friends)
- [API Notifications](#api-notifications)
- [Utilitaires](#utilitaires)

---

## 🎯 Vue d'ensemble

Le fichier `services/api.ts` centralise toutes les fonctions d'appel à l'API backend. Il fournit :

- 🔐 Gestion automatique de l'authentification (tokens JWT)
- 🛡️ Gestion des erreurs HTTP
- 📝 Typage TypeScript complet
- 🍪 Récupération automatique du token depuis les cookies

### Architecture

```
Frontend (Vue)
    ↓
services/api.ts
    ↓
fetch API
    ↓
Backend (NestJS)
```

---

## 🔧 Service API principal

### Configuration

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

Variable d'environnement : `VITE_API_URL`

---

### Fonction fetchApi<T>

Wrapper générique pour tous les appels API.

```typescript
async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<T>
```

#### Fonctionnalités

- ✅ Ajoute automatiquement le header `Authorization: Bearer <token>`
- ✅ Gère les erreurs HTTP et parse les messages
- ✅ Parse automatiquement le JSON
- ✅ Gère les réponses vides (DELETE)
- ✅ Content-Type: application/json par défaut

#### Exemple d'utilisation

```typescript
// GET request
const boards = await fetchApi<Board[]>('/boards');

// POST request
const newBoard = await fetchApi<Board>('/boards', {
  method: 'POST',
  body: JSON.stringify({ title: 'New Board', user_id: 'uuid' })
});

// DELETE request
await fetchApi<void>('/boards/123', { method: 'DELETE' });
```

---

### Récupération du token

```typescript
function getAccessToken(): string | null
```

Récupère le token JWT depuis le cookie `supabase_session`.

**Cookie structure :**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_at": 1706778000
}
```

---

## 📋 API Boards

**Export :** `boardsApi`

### Methods

#### `getAll(userId?: string): Promise<Board[]>`

Liste tous les boards d'un utilisateur.

```typescript
// Tous les boards de l'utilisateur connecté
const boards = await boardsApi.getAll('user-uuid');

// Tous les boards (admin)
const allBoards = await boardsApi.getAll();
```

**Backend :** `GET /boards?userId=xxx`

---

#### `getOne(id: string): Promise<Board>`

Récupère un board spécifique.

```typescript
const board = await boardsApi.getOne('board-uuid');
```

**Backend :** `GET /boards/:id`

---

#### `create(board: Partial<Board>): Promise<Board>`

Crée un nouveau board.

```typescript
const newBoard = await boardsApi.create({
  title: 'Mon Projet',
  description: 'Description du projet',
  user_id: 'user-uuid',
  color: '#4A90E2'
});
```

**Backend :** `POST /boards`

---

#### `update(id: string, board: Partial<Board>): Promise<Board>`

Met à jour un board.

```typescript
const updated = await boardsApi.update('board-uuid', {
  title: 'Nouveau titre',
  color: '#FF6B6B'
});
```

**Backend :** `PUT /boards/:id`

---

#### `delete(id: string): Promise<void>`

Supprime un board.

```typescript
await boardsApi.delete('board-uuid');
```

**Backend :** `DELETE /boards/:id`

---

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

---

## 📝 API Lists

**Export :** `listsApi`

### Methods

#### `getAll(boardId?: string): Promise<List[]>`

Liste toutes les listes d'un board.

```typescript
const lists = await listsApi.getAll('board-uuid');
```

**Backend :** `GET /lists?boardId=xxx`

---

#### `create(list: Partial<List>): Promise<List>`

Crée une nouvelle liste.

```typescript
const newList = await listsApi.create({
  board_id: 'board-uuid',
  title: 'À faire',
  position: 0,
  color: '#3b82f6'
});
```

**Backend :** `POST /lists`

---

#### `update(id: string, list: Partial<List>): Promise<List>`

Met à jour une liste.

```typescript
const updated = await listsApi.update('list-uuid', {
  title: 'En cours',
  position: 1
});
```

**Backend :** `PUT /lists/:id`

---

#### `delete(id: string): Promise<void>`

Supprime une liste.

```typescript
await listsApi.delete('list-uuid');
```

**Backend :** `DELETE /lists/:id`

---

### Interface List

```typescript
interface List {
  id?: string;
  board_id: string;
  title: string;
  position: number;
  color?: string;
  created_at?: string;
}
```

---

## 🗂️ API Cards

**Export :** `cardsApi`

### Methods

#### `getAll(listId?: string): Promise<Card[]>`

Liste toutes les cartes d'une liste.

```typescript
const cards = await cardsApi.getAll('list-uuid');
```

**Backend :** `GET /cards?listId=xxx`

---

#### `create(card: Partial<Card>): Promise<Card>`

Crée une nouvelle carte.

```typescript
const newCard = await cardsApi.create({
  list_id: 'list-uuid',
  title: 'Tâche importante',
  description: 'Description de la tâche',
  position: 0,
  due_date: '2026-02-15T23:59:59Z',
  label_ids: ['label1', 'label2'],
  member_ids: ['user1', 'user2']
});
```

**Backend :** `POST /cards`

---

#### `update(id: string, card: Partial<Card>): Promise<Card>`

Met à jour une carte.

```typescript
const updated = await cardsApi.update('card-uuid', {
  title: 'Nouveau titre',
  list_id: 'autre-list-uuid',  // Déplacer vers autre liste
  position: 2
});
```

**Backend :** `PUT /cards/:id`

---

#### `delete(id: string): Promise<void>`

Supprime une carte.

```typescript
await cardsApi.delete('card-uuid');
```

**Backend :** `DELETE /cards/:id`

---

### Pièces jointes

#### `getAttachments(cardId: string): Promise<CardAttachment[]>`

Liste les pièces jointes d'une carte.

```typescript
const attachments = await cardsApi.getAttachments('card-uuid');
```

**Backend :** `GET /cards/:id/attachments`

---

#### `addAttachment(cardId: string, file: File): Promise<CardAttachment>`

Upload une pièce jointe.

```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const attachment = await cardsApi.addAttachment('card-uuid', file);
// {
//   id: 'attachment-uuid',
//   file_name: 'document.pdf',
//   file_url: 'https://...',
//   file_size: 2048576
// }
```

**Backend :** `POST /cards/:id/attachments` (multipart/form-data)

**Note :** Utilise FormData au lieu de JSON.

---

#### `removeAttachment(attachmentId: string): Promise<void>`

Supprime une pièce jointe.

```typescript
await cardsApi.removeAttachment('attachment-uuid');
```

**Backend :** `DELETE /cards/attachments/:attachmentId`

---

### Interface Card

```typescript
interface Card {
  id?: string;
  list_id: string;
  title: string;
  description?: string;
  position: number;
  due_date?: string | null;
  label_ids?: string[];
  member_ids?: string[];
  members?: CardMember[];
  attachments?: CardAttachment[];
  created_at?: string;
  updated_at?: string;
}

interface CardMember {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface CardAttachment {
  id: string;
  card_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at?: string;
}
```

---

## 🏷️ API Labels

**Export :** `labelsApi`

### Methods

#### `getAll(boardId?: string): Promise<Label[]>`

Liste tous les labels d'un board.

```typescript
const labels = await labelsApi.getAll('board-uuid');
```

**Backend :** `GET /labels?boardId=xxx`

---

#### `create(label: Partial<Label>): Promise<Label>`

Crée un nouveau label.

```typescript
const newLabel = await labelsApi.create({
  board_id: 'board-uuid',
  name: 'Bug',
  color: '#E74C3C'
});
```

**Backend :** `POST /labels`

---

#### `update(id: string, label: Partial<Label>): Promise<Label>`

Met à jour un label.

```typescript
const updated = await labelsApi.update('label-uuid', {
  name: 'Bug critique',
  color: '#C0392B'
});
```

**Backend :** `PUT /labels/:id`

---

#### `delete(id: string): Promise<void>`

Supprime un label.

```typescript
await labelsApi.delete('label-uuid');
```

**Backend :** `DELETE /labels/:id`

---

### Interface Label

```typescript
interface Label {
  id?: string;
  board_id: string;
  name: string;
  color: string;  // Format hex: #RRGGBB
  created_at?: string;
}
```

---

## 🔐 API Auth

**Export :** `authApi`

### Methods

#### `signup(credentials): Promise<AuthResponse>`

Créer un nouveau compte.

```typescript
const response = await authApi.signup({
  email: 'user@example.com',
  password: 'motdepasse123',
  username: 'john_doe',
  fullName: 'John Doe'
});

// {
//   user: { id, email, user_metadata: { username, full_name, avatar_url } },
//   session: { access_token, refresh_token, expires_at }
// }
```

**Backend :** `POST /auth/signup`

---

#### `login(credentials): Promise<AuthResponse>`

Se connecter.

```typescript
const response = await authApi.login({
  identifier: 'john_doe',  // email ou username
  password: 'motdepasse123'
});
```

**Backend :** `POST /auth/login`

---

#### `logout(): Promise<void>`

Se déconnecter.

```typescript
await authApi.logout();
```

**Backend :** `POST /auth/logout`

---

#### `updateProfile(id: string, data: UpdateProfileData): Promise<User>`

Mettre à jour le profil.

```typescript
const updated = await authApi.updateProfile('user-uuid', {
  username: 'nouveau_username',
  fullName: 'Nouveau Nom',
  avatarUrl: 'https://...'
});
```

**Backend :** `PATCH /auth/profile/:id`

---

#### `updatePassword(id: string, data: UpdatePasswordData): Promise<void>`

Changer le mot de passe.

```typescript
await authApi.updatePassword('user-uuid', {
  password: 'nouveau_motdepasse'
});
```

**Backend :** `PATCH /auth/password/:id`

---

#### `uploadAvatar(userId: string, file: File): Promise<string>`

Upload un avatar.

```typescript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const avatarUrl = await authApi.uploadAvatar('user-uuid', file);
// "https://supabase.co/storage/v1/object/public/avatars/..."
```

**Backend :** `POST /auth/avatar/:id` (multipart/form-data)

**Retourne :** URL publique de l'avatar

---

### Interfaces Auth

```typescript
interface User {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

interface Session {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

interface AuthResponse {
  user: User;
  session: Session;
}

interface UpdateProfileData {
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}

interface UpdatePasswordData {
  password: string;
}
```

---

## 👤 API Users

**Export :** `usersApi`

### Methods

#### `search(query: string): Promise<UserProfile[]>`

Rechercher des utilisateurs.

```typescript
const users = await usersApi.search('john');
// [{ id, username: 'john_doe', full_name: 'John Doe', avatar_url }]
```

**Backend :** `GET /users/search?q=john`

---

#### `getProfile(userId: string): Promise<UserProfile>`

Obtenir un profil utilisateur.

```typescript
const profile = await usersApi.getProfile('user-uuid');
```

**Backend :** `GET /users/profile/:userId`

---

### Interface UserProfile

```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}
```

---

## 👥 API Collaborators

**Export :** `collaboratorsApi`

### Methods

#### `getAll(boardId: string): Promise<BoardCollaborator[]>`

Liste les collaborateurs d'un board.

```typescript
const collaborators = await collaboratorsApi.getAll('board-uuid');
```

**Backend :** `GET /boards/:boardId/collaborators`

---

#### `invite(boardId: string, userId: string, invitedBy: string, role?: string): Promise<BoardCollaborator>`

Inviter un collaborateur.

```typescript
const invitation = await collaboratorsApi.invite(
  'board-uuid',
  'user-uuid',
  'inviter-uuid',
  'editor'  // 'owner' | 'editor' | 'viewer'
);
```

**Backend :** `POST /boards/:boardId/collaborators`

---

#### `respond(boardId: string, userId: string, accept: boolean): Promise<void>`

Répondre à une invitation.

```typescript
// Accepter
await collaboratorsApi.respond('board-uuid', 'user-uuid', true);

// Refuser
await collaboratorsApi.respond('board-uuid', 'user-uuid', false);
```

**Backend :** `POST /boards/:boardId/collaborators/respond`

---

#### `updateRole(boardId: string, userId: string, role: string, requesterId: string): Promise<void>`

Modifier le rôle d'un collaborateur.

```typescript
await collaboratorsApi.updateRole(
  'board-uuid',
  'user-uuid',
  'viewer',
  'owner-uuid'
);
```

**Backend :** `PATCH /boards/:boardId/collaborators/:userId/role`

---

#### `remove(boardId: string, userId: string, requesterId: string): Promise<void>`

Retirer un collaborateur.

```typescript
await collaboratorsApi.remove('board-uuid', 'user-uuid', 'owner-uuid');
```

**Backend :** `DELETE /boards/:boardId/collaborators/:userId`

---

#### `getSharedBoards(userId: string): Promise<Board[]>`

Boards partagés avec l'utilisateur.

```typescript
const sharedBoards = await collaboratorsApi.getSharedBoards('user-uuid');
```

**Backend :** `GET /boards/shared/:userId`

---

### Interface BoardCollaborator

```typescript
interface BoardCollaborator {
  id: string;
  board_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  invited_by?: string;
  invited_at?: string;
  accepted_at?: string;
  user?: UserProfile;
}
```

---

## 🤝 API Friends

**Export :** `friendsApi`

### Methods

#### `search(query: string, excludeUserId?: string): Promise<UserProfile[]>`

Rechercher des utilisateurs pour ajouter en amis.

```typescript
const users = await friendsApi.search('john', 'current-user-uuid');
```

**Backend :** `GET /friends/search?q=john&excludeUserId=xxx`

---

#### `getAll(userId: string): Promise<Friendship[]>`

Liste des amis d'un utilisateur.

```typescript
const friends = await friendsApi.getAll('user-uuid');
```

**Backend :** `GET /friends/:userId`

---

#### `sendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest>`

Envoyer une demande d'ami.

```typescript
const request = await friendsApi.sendRequest('my-uuid', 'friend-uuid');
```

**Backend :** `POST /friends/request`

---

#### `getIncomingRequests(userId: string): Promise<FriendRequest[]>`

Demandes reçues.

```typescript
const requests = await friendsApi.getIncomingRequests('user-uuid');
```

**Backend :** `GET /friends/requests/:userId/incoming`

---

#### `getOutgoingRequests(userId: string): Promise<FriendRequest[]>`

Demandes envoyées.

```typescript
const requests = await friendsApi.getOutgoingRequests('user-uuid');
```

**Backend :** `GET /friends/requests/:userId/outgoing`

---

#### `respondToRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<void>`

Répondre à une demande.

```typescript
await friendsApi.respondToRequest('request-uuid', 'accepted');
```

**Backend :** `PATCH /friends/request/:requestId`

---

#### `remove(userId: string, friendId: string): Promise<void>`

Supprimer un ami.

```typescript
await friendsApi.remove('my-uuid', 'friend-uuid');
```

**Backend :** `DELETE /friends/:userId/:friendId`

---

### Interfaces Friends

```typescript
interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend?: UserProfile;
}

interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at?: string;
  from_user?: UserProfile;
  to_user?: UserProfile;
}
```

---

## 🔔 API Notifications

**Export :** `notificationsApi`

### Methods

#### `getAll(userId: string): Promise<Notification[]>`

Liste toutes les notifications.

```typescript
const notifications = await notificationsApi.getAll('user-uuid');
```

**Backend :** `GET /notifications/:userId`

---

#### `getUnreadCount(userId: string): Promise<{ count: number }>`

Nombre de notifications non lues.

```typescript
const { count } = await notificationsApi.getUnreadCount('user-uuid');
```

**Backend :** `GET /notifications/:userId/unread-count`

---

#### `markAsRead(notificationId: string): Promise<void>`

Marquer comme lue.

```typescript
await notificationsApi.markAsRead('notification-uuid');
```

**Backend :** `PATCH /notifications/:notificationId/read`

---

#### `markAllAsRead(userId: string): Promise<void>`

Tout marquer comme lu.

```typescript
await notificationsApi.markAllAsRead('user-uuid');
```

**Backend :** `PATCH /notifications/:userId/read-all`

---

#### `delete(notificationId: string): Promise<void>`

Supprimer une notification.

```typescript
await notificationsApi.delete('notification-uuid');
```

**Backend :** `DELETE /notifications/:notificationId`

---

### Interface Notification

```typescript
interface Notification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'friend_accepted' | 'board_invitation' | 'card_assigned';
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
  read_at?: string;
}
```

---

## 🛠️ Utilitaires

### Gestion des erreurs

Toutes les fonctions API peuvent throw des erreurs :

```typescript
try {
  const board = await boardsApi.getOne('invalid-id');
} catch (error) {
  console.error('Erreur:', error.message);
  // "Board with ID invalid-id not found"
}
```

**Bonnes pratiques :**
```typescript
// Dans un composant Vue
const loading = ref(false);
const error = ref<string | null>(null);

async function loadBoard() {
  loading.value = true;
  error.value = null;
  
  try {
    const board = await boardsApi.getOne(boardId);
    // Success
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
  } finally {
    loading.value = false;
  }
}
```

---

### Types exports

Tous les types sont exportés et peuvent être importés :

```typescript
import type { 
  Board, 
  List, 
  Card, 
  Label, 
  User, 
  Session,
  AuthResponse,
  UserProfile,
  BoardCollaborator,
  Notification
} from '@/services/api';
```

---

## 📚 Ressources complémentaires

- **[FRONTEND.md](FRONTEND.md)** - Architecture frontend
- **[FRONTEND-COMPONENTS.md](FRONTEND-COMPONENTS.md)** - Composants Vue
- **[FRONTEND-COMPOSABLES.md](FRONTEND-COMPOSABLES.md)** - Composables
- **[BACKEND-API.md](BACKEND-API.md)** - Documentation API backend complète
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Documentation TypeScript
