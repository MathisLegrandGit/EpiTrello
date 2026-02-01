# 📡 API Backend EpiTrello - Documentation

Cette documentation détaille tous les endpoints REST disponibles dans l'API EpiTrello.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Authentification](#authentification)
- [Utilisateurs](#utilisateurs)
- [Boards (Tableaux)](#boards-tableaux)
- [Lists (Listes)](#lists-listes)
- [Cards (Cartes)](#cards-cartes)
- [Labels (Étiquettes)](#labels-étiquettes)
- [Collaborators (Collaborateurs)](#collaborators-collaborateurs)
- [Friends (Amis)](#friends-amis)
- [Notifications](#notifications)
- [Codes d'erreur](#codes-derreur)

## 🌐 Vue d'ensemble

### URL de base

```
Development: http://localhost:3000
Production:  https://epitrello.pages.dev/
```

### Format des réponses

Toutes les réponses sont au format JSON :

```json
{
  "id": "uuid",
  "created_at": "2026-02-01T10:00:00Z",
  "data": "..."
}
```

### Format des erreurs

```json
{
  "statusCode": 400,
  "message": "Description de l'erreur",
  "error": "Bad Request"
}
```

### Headers communs

```http
Content-Type: application/json
Authorization: Bearer <access_token>  # Pour les routes protégées
```

---

## 🔐 Authentification

Base URL: `/auth`

### Inscription

Créer un nouveau compte utilisateur.

**Endpoint:** `POST /auth/signup`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123",
  "username": "john_doe",
  "full_name": "John Doe"
}
```

**Réponse:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "john_doe",
    "full_name": "John Doe",
    "avatar_url": null,
    "created_at": "2026-02-01T10:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

**Erreurs:**
- `400 Bad Request` - Données invalides
- `409 Conflict` - Email ou username déjà utilisé

---

### Connexion

Authentifier un utilisateur existant.

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponse:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "john_doe",
    "full_name": "John Doe",
    "avatar_url": "https://...",
    "created_at": "2026-02-01T10:00:00Z"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

**Erreurs:**
- `401 Unauthorized` - Email ou mot de passe incorrect
- `400 Bad Request` - Données invalides

---

### Déconnexion

Déconnecter l'utilisateur actuel.

**Endpoint:** `POST /auth/logout`

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Réponse:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

### Mettre à jour le profil

Modifier les informations du profil utilisateur.

**Endpoint:** `PATCH /auth/profile/:id`

**Paramètres:**
- `id` (path) - ID de l'utilisateur

**Body:**
```json
{
  "username": "nouveau_username",
  "full_name": "Nouveau Nom",
  "avatar_url": "https://..."
}
```

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "nouveau_username",
  "full_name": "Nouveau Nom",
  "avatar_url": "https://...",
  "updated_at": "2026-02-01T11:00:00Z"
}
```

---

### Upload avatar

Téléverser une photo de profil.

**Endpoint:** `POST /auth/profile/:id/avatar`

**Paramètres:**
- `id` (path) - ID de l'utilisateur

**Body:** `multipart/form-data`
```
file: <image_file>
```

**Réponse:** `200 OK`
```json
{
  "avatar_url": "https://supabase.co/storage/v1/object/public/avatars/..."
}
```

**Limitations:**
- Formats acceptés : JPEG, PNG, GIF, WebP
- Taille maximale : 5 MB

---

### Changer le mot de passe

Modifier le mot de passe de l'utilisateur.

**Endpoint:** `PATCH /auth/password/:id`

**Paramètres:**
- `id` (path) - ID de l'utilisateur

**Body:**
```json
{
  "currentPassword": "ancien_motdepasse",
  "newPassword": "nouveau_motdepasse"
}
```

**Réponse:** `200 OK`
```json
{
  "message": "Password updated successfully"
}
```

**Erreurs:**
- `401 Unauthorized` - Mot de passe actuel incorrect
- `400 Bad Request` - Nouveau mot de passe invalide

---

## 👤 Utilisateurs

Base URL: `/users`

### Rechercher des utilisateurs

Rechercher des utilisateurs par username ou nom complet.

**Endpoint:** `GET /users/search`

**Query params:**
- `q` (string, requis) - Terme de recherche (min 1 caractère)
- `excludeUserId` (string, optionnel) - ID utilisateur à exclure

**Exemple:**
```http
GET /users/search?q=john&excludeUserId=abc123
```

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "username": "john_doe",
    "full_name": "John Doe",
    "avatar_url": "https://..."
  },
  {
    "id": "uuid2",
    "username": "johnny",
    "full_name": "Johnny Walker",
    "avatar_url": null
  }
]
```

---

### Obtenir un profil utilisateur

Récupérer les informations publiques d'un utilisateur.

**Endpoint:** `GET /users/profile/:userId`

**Paramètres:**
- `userId` (path) - ID de l'utilisateur

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "username": "john_doe",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "created_at": "2026-01-01T10:00:00Z"
}
```

**Erreurs:**
- `404 Not Found` - Utilisateur introuvable

---

## 📋 Boards (Tableaux)

Base URL: `/boards`

### Lister les boards

Récupérer tous les boards d'un utilisateur.

**Endpoint:** `GET /boards`

**Query params:**
- `userId` (string, optionnel) - Filtrer par propriétaire

**Exemple:**
```http
GET /boards?userId=abc123
```

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Projet EpiTrello",
    "description": "Board principal du projet",
    "owner_id": "uuid",
    "background_color": "#4A90E2",
    "background_image": null,
    "is_favorite": false,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-02-01T11:00:00Z"
  }
]
```

---

### Obtenir un board

Récupérer les détails d'un board spécifique.

**Endpoint:** `GET /boards/:id`

**Paramètres:**
- `id` (path) - ID du board

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Projet EpiTrello",
  "description": "Board principal du projet",
  "owner_id": "uuid",
  "background_color": "#4A90E2",
  "background_image": null,
  "is_favorite": true,
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-02-01T11:00:00Z"
}
```

**Erreurs:**
- `404 Not Found` - Board introuvable

---

### Créer un board

Créer un nouveau tableau.

**Endpoint:** `POST /boards`

**Body:**
```json
{
  "title": "Nouveau Projet",
  "description": "Description du projet",
  "owner_id": "uuid",
  "background_color": "#FF6B6B",
  "background_image": null
}
```

**Réponse:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Nouveau Projet",
  "description": "Description du projet",
  "owner_id": "uuid",
  "background_color": "#FF6B6B",
  "background_image": null,
  "is_favorite": false,
  "created_at": "2026-02-01T12:00:00Z",
  "updated_at": "2026-02-01T12:00:00Z"
}
```

---

### Mettre à jour un board

Modifier les propriétés d'un board.

**Endpoint:** `PUT /boards/:id`

**Paramètres:**
- `id` (path) - ID du board

**Body:**
```json
{
  "title": "Titre modifié",
  "description": "Nouvelle description",
  "background_color": "#4ECDC4",
  "is_favorite": true
}
```

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Titre modifié",
  "description": "Nouvelle description",
  "owner_id": "uuid",
  "background_color": "#4ECDC4",
  "background_image": null,
  "is_favorite": true,
  "updated_at": "2026-02-01T13:00:00Z"
}
```

---

### Supprimer un board

Supprimer définitivement un board.

**Endpoint:** `DELETE /boards/:id`

**Paramètres:**
- `id` (path) - ID du board

**Réponse:** `204 No Content`

**Note:** Supprime également toutes les listes, cartes et labels associés.

---

### Créer un board par défaut

Créer un board avec des listes et cartes exemples.

**Endpoint:** `POST /boards/default`

**Body:**
```json
{
  "userId": "uuid"
}
```

**Réponse:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Welcome Board",
  "description": "Bienvenue sur EpiTrello !",
  "owner_id": "uuid",
  "background_color": "#4A90E2",
  "is_favorite": false,
  "created_at": "2026-02-01T12:00:00Z"
}
```

---

## 📝 Lists (Listes)

Base URL: `/lists`

### Lister les listes

Récupérer toutes les listes d'un board.

**Endpoint:** `GET /lists`

**Query params:**
- `boardId` (string, requis) - ID du board

**Exemple:**
```http
GET /lists?boardId=board-uuid
```

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "À faire",
    "board_id": "uuid",
    "position": 0,
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-02-01T11:00:00Z"
  },
  {
    "id": "uuid2",
    "title": "En cours",
    "board_id": "uuid",
    "position": 1,
    "created_at": "2026-01-15T10:05:00Z",
    "updated_at": "2026-02-01T11:00:00Z"
  }
]
```

---

### Obtenir une liste

Récupérer les détails d'une liste.

**Endpoint:** `GET /lists/:id`

**Paramètres:**
- `id` (path) - ID de la liste

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "title": "À faire",
  "board_id": "uuid",
  "position": 0,
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-02-01T11:00:00Z"
}
```

---

### Créer une liste

Ajouter une nouvelle liste à un board.

**Endpoint:** `POST /lists`

**Body:**
```json
{
  "title": "Terminé",
  "board_id": "uuid",
  "position": 2
}
```

**Réponse:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Terminé",
  "board_id": "uuid",
  "position": 2,
  "created_at": "2026-02-01T13:00:00Z",
  "updated_at": "2026-02-01T13:00:00Z"
}
```

---

### Mettre à jour une liste

Modifier une liste (titre ou position).

**Endpoint:** `PUT /lists/:id`

**Paramètres:**
- `id` (path) - ID de la liste

**Body:**
```json
{
  "title": "Nouveau titre",
  "position": 1
}
```

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Nouveau titre",
  "board_id": "uuid",
  "position": 1,
  "updated_at": "2026-02-01T14:00:00Z"
}
```

---

### Supprimer une liste

Supprimer une liste et toutes ses cartes.

**Endpoint:** `DELETE /lists/:id`

**Paramètres:**
- `id` (path) - ID de la liste

**Réponse:** `204 No Content`

---

## 🗂️ Cards (Cartes)

Base URL: `/cards`

### Lister les cartes

Récupérer toutes les cartes d'une liste.

**Endpoint:** `GET /cards`

**Query params:**
- `listId` (string, requis) - ID de la liste

**Exemple:**
```http
GET /cards?listId=list-uuid
```

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Implémenter authentification",
    "description": "Ajouter login et signup avec Supabase",
    "list_id": "uuid",
    "position": 0,
    "due_date": "2026-02-15T23:59:59Z",
    "priority": "high",
    "assigned_to": "uuid",
    "created_at": "2026-01-20T10:00:00Z",
    "updated_at": "2026-02-01T11:00:00Z"
  }
]
```

---

### Obtenir une carte

Récupérer les détails d'une carte.

**Endpoint:** `GET /cards/:id`

**Paramètres:**
- `id` (path) - ID de la carte

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Implémenter authentification",
  "description": "Ajouter login et signup avec Supabase",
  "list_id": "uuid",
  "position": 0,
  "due_date": "2026-02-15T23:59:59Z",
  "priority": "high",
  "assigned_to": "uuid",
  "created_at": "2026-01-20T10:00:00Z",
  "updated_at": "2026-02-01T11:00:00Z"
}
```

---

### Créer une carte

Ajouter une nouvelle carte à une liste.

**Endpoint:** `POST /cards`

**Body:**
```json
{
  "title": "Nouvelle tâche",
  "description": "Description de la tâche",
  "list_id": "uuid",
  "position": 0,
  "due_date": "2026-02-20T23:59:59Z",
  "priority": "medium",
  "assigned_to": null
}
```

**Réponse:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Nouvelle tâche",
  "description": "Description de la tâche",
  "list_id": "uuid",
  "position": 0,
  "due_date": "2026-02-20T23:59:59Z",
  "priority": "medium",
  "assigned_to": null,
  "created_at": "2026-02-01T15:00:00Z",
  "updated_at": "2026-02-01T15:00:00Z"
}
```

---

### Mettre à jour une carte

Modifier une carte.

**Endpoint:** `PUT /cards/:id`

**Paramètres:**
- `id` (path) - ID de la carte

**Body:**
```json
{
  "title": "Titre modifié",
  "description": "Description mise à jour",
  "list_id": "uuid",
  "position": 1,
  "priority": "high",
  "assigned_to": "user-uuid"
}
```

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Titre modifié",
  "description": "Description mise à jour",
  "list_id": "uuid",
  "position": 1,
  "priority": "high",
  "assigned_to": "user-uuid",
  "updated_at": "2026-02-01T16:00:00Z"
}
```

---

### Supprimer une carte

Supprimer définitivement une carte.

**Endpoint:** `DELETE /cards/:id`

**Paramètres:**
- `id` (path) - ID de la carte

**Réponse:** `204 No Content`

---

### Obtenir les pièces jointes

Lister toutes les pièces jointes d'une carte.

**Endpoint:** `GET /cards/:id/attachments`

**Paramètres:**
- `id` (path) - ID de la carte

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "card_id": "uuid",
    "file_name": "document.pdf",
    "file_url": "https://supabase.co/storage/v1/object/public/attachments/...",
    "file_type": "application/pdf",
    "file_size": 2048576,
    "uploaded_by": "uuid",
    "created_at": "2026-02-01T12:00:00Z"
  }
]
```

---

### Ajouter une pièce jointe

Upload un fichier et l'attacher à une carte.

**Endpoint:** `POST /cards/:id/attachments`

**Paramètres:**
- `id` (path) - ID de la carte

**Body:** `multipart/form-data`
```
file: <fichier>
```

**Réponse:** `201 Created`
```json
{
  "id": "uuid",
  "card_id": "uuid",
  "file_name": "document.pdf",
  "file_url": "https://...",
  "file_type": "application/pdf",
  "file_size": 2048576,
  "uploaded_by": "uuid",
  "created_at": "2026-02-01T16:00:00Z"
}
```

**Limitations:**
- Taille maximale : 10 MB
- Formats acceptés : PDF, images, documents office, archives

---

### Supprimer une pièce jointe

Supprimer un fichier attaché.

**Endpoint:** `DELETE /cards/attachments/:attachmentId`

**Paramètres:**
- `attachmentId` (path) - ID de la pièce jointe

**Réponse:** `204 No Content`

---

## 🏷️ Labels (Étiquettes)

Base URL: `/labels`

### Lister les labels

Récupérer tous les labels d'un board.

**Endpoint:** `GET /labels`

**Query params:**
- `boardId` (string, requis) - ID du board

**Exemple:**
```http
GET /labels?boardId=board-uuid
```

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Bug",
    "color": "#E74C3C",
    "board_id": "uuid",
    "created_at": "2026-01-15T10:00:00Z"
  },
  {
    "id": "uuid2",
    "name": "Feature",
    "color": "#3498DB",
    "board_id": "uuid",
    "created_at": "2026-01-15T10:05:00Z"
  }
]
```

---

### Obtenir un label

Récupérer les détails d'un label.

**Endpoint:** `GET /labels/:id`

**Paramètres:**
- `id` (path) - ID du label

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Bug",
  "color": "#E74C3C",
  "board_id": "uuid",
  "created_at": "2026-01-15T10:00:00Z"
}
```

---

### Créer un label

Ajouter un nouveau label à un board.

**Endpoint:** `POST /labels`

**Body:**
```json
{
  "name": "Urgent",
  "color": "#FF6B6B",
  "board_id": "uuid"
}
```

**Réponse:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Urgent",
  "color": "#FF6B6B",
  "board_id": "uuid",
  "created_at": "2026-02-01T17:00:00Z"
}
```

---

### Mettre à jour un label

Modifier un label.

**Endpoint:** `PUT /labels/:id`

**Paramètres:**
- `id` (path) - ID du label

**Body:**
```json
{
  "name": "Très urgent",
  "color": "#C0392B"
}
```

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Très urgent",
  "color": "#C0392B",
  "board_id": "uuid",
  "created_at": "2026-02-01T17:00:00Z"
}
```

---

### Supprimer un label

Supprimer un label du board.

**Endpoint:** `DELETE /labels/:id`

**Paramètres:**
- `id` (path) - ID du label

**Réponse:** `204 No Content`

---

## 👥 Collaborators (Collaborateurs)

Base URL: `/boards/:boardId/collaborators`

### Lister les collaborateurs

Obtenir tous les collaborateurs d'un board.

**Endpoint:** `GET /boards/:boardId/collaborators`

**Paramètres:**
- `boardId` (path) - ID du board

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "board_id": "uuid",
    "user_id": "uuid",
    "role": "owner",
    "status": "accepted",
    "invited_by": null,
    "invited_at": "2026-01-15T10:00:00Z",
    "accepted_at": "2026-01-15T10:00:00Z",
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "full_name": "John Doe",
      "avatar_url": "https://..."
    }
  },
  {
    "id": "uuid2",
    "board_id": "uuid",
    "user_id": "uuid2",
    "role": "editor",
    "status": "accepted",
    "invited_by": "uuid",
    "invited_at": "2026-01-20T14:00:00Z",
    "accepted_at": "2026-01-20T14:30:00Z",
    "user": {
      "id": "uuid2",
      "username": "jane_smith",
      "full_name": "Jane Smith",
      "avatar_url": null
    }
  }
]
```

---

### Inviter un collaborateur

Inviter un utilisateur à collaborer sur un board.

**Endpoint:** `POST /boards/:boardId/collaborators`

**Paramètres:**
- `boardId` (path) - ID du board

**Body:**
```json
{
  "userId": "uuid",
  "invitedBy": "uuid",
  "role": "editor"
}
```

**Roles disponibles:**
- `owner` - Propriétaire (tous les droits)
- `editor` - Éditeur (modification)
- `viewer` - Lecteur (lecture seule)

**Réponse:** `201 Created`
```json
{
  "id": "uuid",
  "board_id": "uuid",
  "user_id": "uuid",
  "role": "editor",
  "status": "pending",
  "invited_by": "uuid",
  "invited_at": "2026-02-01T18:00:00Z",
  "accepted_at": null
}
```

---

### Répondre à une invitation

Accepter ou refuser une invitation de collaboration.

**Endpoint:** `POST /boards/:boardId/collaborators/respond`

**Paramètres:**
- `boardId` (path) - ID du board

**Body:**
```json
{
  "userId": "uuid",
  "accept": true
}
```

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "board_id": "uuid",
  "user_id": "uuid",
  "role": "editor",
  "status": "accepted",
  "invited_by": "uuid",
  "invited_at": "2026-02-01T18:00:00Z",
  "accepted_at": "2026-02-01T18:15:00Z"
}
```

---

### Modifier le rôle d'un collaborateur

Changer le rôle d'un collaborateur (owner uniquement).

**Endpoint:** `PATCH /boards/:boardId/collaborators/:userId/role`

**Paramètres:**
- `boardId` (path) - ID du board
- `userId` (path) - ID du collaborateur

**Body:**
```json
{
  "role": "viewer",
  "requesterId": "uuid"
}
```

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "board_id": "uuid",
  "user_id": "uuid",
  "role": "viewer",
  "status": "accepted"
}
```

**Erreurs:**
- `403 Forbidden` - Seul le propriétaire peut modifier les rôles

---

### Retirer un collaborateur

Supprimer un collaborateur d'un board.

**Endpoint:** `DELETE /boards/:boardId/collaborators/:userId`

**Paramètres:**
- `boardId` (path) - ID du board
- `userId` (path) - ID du collaborateur

**Body:**
```json
{
  "requesterId": "uuid"
}
```

**Réponse:** `204 No Content`

**Erreurs:**
- `403 Forbidden` - Permissions insuffisantes
- `400 Bad Request` - Impossible de retirer le propriétaire

---

### Obtenir les boards partagés

Lister tous les boards où l'utilisateur est collaborateur.

**Endpoint:** `GET /boards/shared/:userId`

**Paramètres:**
- `userId` (path) - ID de l'utilisateur

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Projet partagé",
    "description": "Board collaboratif",
    "owner_id": "uuid-autre",
    "background_color": "#4A90E2",
    "role": "editor",
    "status": "accepted"
  }
]
```

---

## 🤝 Friends (Amis)

Base URL: `/friends`

### Rechercher des utilisateurs

Rechercher des utilisateurs pour les ajouter en amis.

**Endpoint:** `GET /friends/search`

**Query params:**
- `q` (string, requis) - Terme de recherche
- `excludeUserId` (string, optionnel) - ID utilisateur à exclure

**Exemple:**
```http
GET /friends/search?q=john&excludeUserId=abc123
```

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "username": "john_smith",
    "full_name": "John Smith",
    "avatar_url": "https://..."
  }
]
```

---

### Lister ses amis

Obtenir la liste des amis d'un utilisateur.

**Endpoint:** `GET /friends/:userId`

**Paramètres:**
- `userId` (path) - ID de l'utilisateur

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "friend_id": "uuid2",
    "created_at": "2026-01-25T10:00:00Z",
    "friend": {
      "id": "uuid2",
      "username": "jane_doe",
      "full_name": "Jane Doe",
      "avatar_url": "https://..."
    }
  }
]
```

---

### Envoyer une demande d'ami

Envoyer une demande d'ajout en ami.

**Endpoint:** `POST /friends/request`

**Body:**
```json
{
  "fromUserId": "uuid",
  "toUserId": "uuid2"
}
```

**Réponse:** `201 Created`
```json
{
  "id": "uuid",
  "from_user_id": "uuid",
  "to_user_id": "uuid2",
  "status": "pending",
  "created_at": "2026-02-01T19:00:00Z"
}
```

**Erreurs:**
- `409 Conflict` - Demande déjà existante
- `400 Bad Request` - Déjà amis

---

### Demandes reçues

Lister les demandes d'ami en attente (reçues).

**Endpoint:** `GET /friends/requests/:userId/incoming`

**Paramètres:**
- `userId` (path) - ID de l'utilisateur

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "from_user_id": "uuid2",
    "to_user_id": "uuid",
    "status": "pending",
    "created_at": "2026-02-01T10:00:00Z",
    "from_user": {
      "id": "uuid2",
      "username": "john_doe",
      "full_name": "John Doe",
      "avatar_url": "https://..."
    }
  }
]
```

---

### Demandes envoyées

Lister les demandes d'ami envoyées.

**Endpoint:** `GET /friends/requests/:userId/outgoing`

**Paramètres:**
- `userId` (path) - ID de l'utilisateur

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "from_user_id": "uuid",
    "to_user_id": "uuid2",
    "status": "pending",
    "created_at": "2026-02-01T15:00:00Z",
    "to_user": {
      "id": "uuid2",
      "username": "jane_smith",
      "full_name": "Jane Smith",
      "avatar_url": null
    }
  }
]
```

---

### Répondre à une demande

Accepter ou refuser une demande d'ami.

**Endpoint:** `PATCH /friends/request/:requestId`

**Paramètres:**
- `requestId` (path) - ID de la demande

**Body:**
```json
{
  "status": "accepted"
}
```

**Statuts disponibles:**
- `accepted` - Accepter
- `rejected` - Refuser

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "from_user_id": "uuid2",
  "to_user_id": "uuid",
  "status": "accepted",
  "created_at": "2026-02-01T10:00:00Z",
  "updated_at": "2026-02-01T19:30:00Z"
}
```

---

### Supprimer un ami

Retirer un ami de sa liste.

**Endpoint:** `DELETE /friends/:userId/:friendId`

**Paramètres:**
- `userId` (path) - ID de l'utilisateur
- `friendId` (path) - ID de l'ami à retirer

**Réponse:** `200 OK`
```json
{
  "message": "Friend removed successfully"
}
```

---

### Obtenir un profil

Récupérer le profil public d'un utilisateur.

**Endpoint:** `GET /friends/profile/:userId`

**Paramètres:**
- `userId` (path) - ID de l'utilisateur

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "username": "john_doe",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "created_at": "2026-01-01T10:00:00Z"
}
```

---

## 🔔 Notifications

Base URL: `/notifications`

### Lister les notifications

Obtenir toutes les notifications d'un utilisateur.

**Endpoint:** `GET /notifications/:userId`

**Paramètres:**
- `userId` (path) - ID de l'utilisateur

**Réponse:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "type": "friend_request",
    "title": "Nouvelle demande d'ami",
    "message": "john_doe vous a envoyé une demande d'ami",
    "is_read": false,
    "related_id": "uuid",
    "created_at": "2026-02-01T20:00:00Z"
  },
  {
    "id": "uuid2",
    "user_id": "uuid",
    "type": "board_invitation",
    "title": "Invitation à un board",
    "message": "jane_smith vous a invité au board 'Projet XYZ'",
    "is_read": false,
    "related_id": "uuid-board",
    "created_at": "2026-02-01T19:45:00Z"
  }
]
```

**Types de notifications:**
- `friend_request` - Demande d'ami
- `friend_accepted` - Demande acceptée
- `board_invitation` - Invitation à un board
- `board_update` - Modification de board
- `card_assigned` - Carte assignée
- `card_due_soon` - Échéance proche

---

### Compter les non-lues

Obtenir le nombre de notifications non lues.

**Endpoint:** `GET /notifications/:userId/unread-count`

**Paramètres:**
- `userId` (path) - ID de l'utilisateur

**Réponse:** `200 OK`
```json
{
  "count": 5
}
```

---

### Marquer comme lue

Marquer une notification comme lue.

**Endpoint:** `PATCH /notifications/:notificationId/read`

**Paramètres:**
- `notificationId` (path) - ID de la notification

**Réponse:** `200 OK`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "type": "friend_request",
  "title": "Nouvelle demande d'ami",
  "message": "john_doe vous a envoyé une demande d'ami",
  "is_read": true,
  "related_id": "uuid",
  "created_at": "2026-02-01T20:00:00Z",
  "read_at": "2026-02-01T20:15:00Z"
}
```

---

### Tout marquer comme lu

Marquer toutes les notifications comme lues.

**Endpoint:** `PATCH /notifications/:userId/read-all`

**Paramètres:**
- `userId` (path) - ID de l'utilisateur

**Réponse:** `200 OK`
```json
{
  "count": 5,
  "message": "All notifications marked as read"
}
```

---

### Supprimer une notification

Supprimer définitivement une notification.

**Endpoint:** `DELETE /notifications/:notificationId`

**Paramètres:**
- `notificationId` (path) - ID de la notification

**Réponse:** `204 No Content`

---

## ⚠️ Codes d'erreur

### Codes HTTP standards

| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée avec succès |
| 204 | No Content | Requête réussie sans contenu à retourner |
| 400 | Bad Request | Données invalides ou manquantes |
| 401 | Unauthorized | Authentication requise ou invalide |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource introuvable |
| 409 | Conflict | Conflit (ex: ressource déjà existante) |
| 500 | Internal Server Error | Erreur serveur |

### Format des erreurs

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

### Erreurs de validation

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than 6 characters"
  ],
  "error": "Bad Request"
}
```

### Erreur Supabase

```json
{
  "statusCode": 500,
  "message": "Database error: [message]",
  "error": "Internal Server Error"
}
```

---

## 🔗 Ressources supplémentaires

- **[BACKEND.md](BACKEND.md)** - Architecture et démarrage
- **[BACKEND-MODULES.md](BACKEND-MODULES.md)** - Détails des modules
- **[BACKEND-SUPABASE.md](BACKEND-SUPABASE.md)** - Configuration Supabase
- **[BACKEND-DEVELOPMENT.md](BACKEND-DEVELOPMENT.md)** - Guide de développement

## 📝 Notes

- Tous les timestamps sont au format ISO 8601 (UTC)
- Les UUIDs sont au format UUID v4
- Les fichiers uploadés sont stockés sur Supabase Storage
- Les requêtes nécessitant une authentification doivent inclure un token JWT valide
- La pagination n'est pas encore implémentée (retourne toutes les ressources)
