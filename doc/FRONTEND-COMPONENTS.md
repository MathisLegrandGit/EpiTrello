# 🧩 Composants Frontend - EpiTrello

Cette documentation détaille tous les composants Vue.js de l'application EpiTrello, leurs props, événements et usage.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Composants Kanban](#composants-kanban)
- [Composants UI réutilisables](#composants-ui-réutilisables)
- [Modales](#modales)
- [Composants utilitaires](#composants-utilitaires)
- [Vues (Pages)](#vues-pages)

---

## 🎯 Vue d'ensemble

Les composants sont organisés en plusieurs catégories :

```
components/
├── kanban/              # Composants spécifiques au Kanban
├── ui/                  # Composants UI réutilisables
├── CardDetailModal.vue  # Modal détails carte
├── BoardCollaboratorsModal.vue  # Modal collaborateurs
├── NotificationsPanel.vue       # Panneau notifications
├── SettingsModal.vue            # Modal paramètres
├── PasswordInput.vue            # Input mot de passe
└── BrandLogo.vue                # Logo de l'application
```

### Convention de nommage

- **PascalCase** pour les noms de fichiers : `KanbanCard.vue`
- **kebab-case** dans les templates : `<kanban-card />`
- Props en **camelCase** : `isDarkMode`
- Events en **kebab-case** : `@card-click`

---

## 🎴 Composants Kanban

### KanbanCard

**Fichier :** `components/kanban/KanbanCard.vue`

Représente une carte individuelle dans le Kanban.

#### Props

```typescript
interface Props {
  card: Card                 // Données de la carte
  isDarkMode: boolean        // Mode sombre activé
  labels: Label[]            // Labels disponibles
  columnId: string          // ID de la colonne parente
  allColumns?: Column[]     // Toutes les colonnes (pour déplacement)
  canEdit?: boolean         // Permissions d'édition
}
```

#### Events

```typescript
emit('mousedown', event: MouseEvent)     // Début du drag
emit('move-to-column', targetColumnId: string)  // Déplacer vers colonne
emit('click')                            // Click sur la carte (mobile)
```

#### Usage

```vue
<template>
  <KanbanCard
    :card="card"
    :is-dark-mode="isDarkMode"
    :labels="labels"
    :column-id="list.id"
    :all-columns="columns"
    :can-edit="canEdit"
    @mousedown="handleCardMouseDown($event, card)"
    @click="openCardDetail(card)"
    @move-to-column="moveCard(card, $event)"
  />
</template>
```

#### Fonctionnalités

- 🎨 Affichage des labels colorés (max 3)
- 👥 Avatars des membres assignés (max 3 + overflow)
- 📅 Indicateur de date d'échéance
- 📎 Icône de pièces jointes
- 🖱️ Drag & drop (desktop)
- 📱 Menu de déplacement (mobile)
- 🎯 Hover effects avec animations

---

### KanbanColumn

**Fichier :** `components/kanban/KanbanColumn.vue`

Représente une colonne (liste) contenant des cartes.

#### Props

```typescript
interface Props {
  column: Column            // Données de la colonne
  isDarkMode: boolean      // Mode sombre
  labels: Label[]          // Labels du board
  menuOpen: boolean        // Menu options ouvert
  colorPickerOpen: boolean // Color picker ouvert
  editingTitle: boolean    // Édition du titre en cours
  columnColors: string[]   // Couleurs disponibles
  canEdit?: boolean        // Permissions d'édition
  allColumns?: ColumnInfo[] // Autres colonnes
}

interface Column {
  id: string
  title: string
  position: number
  color?: string
  cards: Card[]
}
```

#### Events

```typescript
emit('toggle-menu')                        // Toggle menu options
emit('toggle-color-picker')                // Toggle color picker
emit('update-color', color: string)        // Changer couleur
emit('delete')                             // Supprimer colonne
emit('start-adding-card')                  // Commencer ajout carte
emit('add-card', title: string)            // Ajouter carte
emit('start-editing-title')                // Commencer édition titre
emit('save-title', title: string)          // Sauvegarder titre
emit('cancel-editing')                     // Annuler édition
emit('card-mousedown', event: MouseEvent, card: Card)  // Drag carte
emit('card-click', card: Card)             // Click carte
emit('move-card', card: Card, targetColumnId: string)  // Déplacer carte
```

#### Usage

```vue
<template>
  <KanbanColumn
    :column="list"
    :is-dark-mode="isDarkMode"
    :labels="labels"
    :menu-open="openMenuId === list.id"
    :color-picker-open="colorPickerId === list.id"
    :editing-title="editingTitleId === list.id"
    :column-colors="columnColors"
    :can-edit="canEdit"
    :all-columns="columnInfos"
    @toggle-menu="toggleMenu(list.id)"
    @update-color="updateColumnColor(list.id, $event)"
    @delete="deleteColumn(list.id)"
    @add-card="addCard(list.id, $event)"
    @card-click="openCardDetail"
    @card-mousedown="handleCardMouseDown"
  />
</template>
```

#### Fonctionnalités

- 🎨 Pastille de couleur personnalisable
- ✏️ Édition inline du titre
- ➕ Ajout de cartes
- 🗑️ Suppression de colonne
- 🎯 Menu d'options (desktop)
- 📱 Interface responsive
- 🎴 Liste scrollable de cartes

---

### KanbanHeader

**Fichier :** `components/kanban/KanbanHeader.vue`

En-tête du board Kanban avec actions.

#### Props

```typescript
interface Props {
  boardTitle: string
  isDarkMode: boolean
  canEdit: boolean
  hasChanges?: boolean
}
```

#### Events

```typescript
emit('toggle-dark-mode')       // Toggle mode sombre
emit('open-settings')          // Ouvrir paramètres board
emit('open-collaborators')     // Ouvrir gestion collaborateurs
emit('save-changes')           // Sauvegarder modifications
emit('back')                   // Retour au dashboard
```

#### Usage

```vue
<template>
  <KanbanHeader
    :board-title="board.title"
    :is-dark-mode="isDarkMode"
    :can-edit="canEdit"
    :has-changes="hasUnsavedChanges"
    @toggle-dark-mode="toggleDarkMode"
    @open-settings="settingsOpen = true"
    @open-collaborators="collaboratorsOpen = true"
    @save-changes="saveChanges"
    @back="router.push('/dashboard')"
  />
</template>
```

#### Fonctionnalités

- 🏠 Bouton retour dashboard
- 📝 Affichage du titre du board
- 🌓 Toggle dark mode
- 👥 Bouton collaborateurs
- ⚙️ Bouton paramètres
- 💾 Indicateur de modifications non sauvegardées

---

### AddColumnButton

**Fichier :** `components/kanban/AddColumnButton.vue`

Bouton pour ajouter une nouvelle colonne.

#### Props

```typescript
interface Props {
  isDarkMode: boolean
  isAdding: boolean
}
```

#### Events

```typescript
emit('start-adding')          // Commencer ajout
emit('add', title: string)    // Ajouter colonne
emit('cancel')                // Annuler
```

#### Usage

```vue
<template>
  <AddColumnButton
    :is-dark-mode="isDarkMode"
    :is-adding="isAddingColumn"
    @start-adding="isAddingColumn = true"
    @add="createColumn"
    @cancel="isAddingColumn = false"
  />
</template>
```

---

### FloatingCard

**Fichier :** `components/kanban/FloatingCard.vue`

Carte flottante pendant le drag & drop.

#### Props

```typescript
interface Props {
  card: Card
  isDarkMode: boolean
  position: { x: number; y: number }
  visible: boolean
}
```

#### Usage

```vue
<template>
  <FloatingCard
    v-if="dragging"
    :card="draggedCard"
    :is-dark-mode="isDarkMode"
    :position="mousePosition"
    :visible="true"
  />
</template>
```

#### Fonctionnalités

- 🎯 Suit le curseur pendant le drag
- 👻 Opacité réduite
- 🚫 No pointer events
- 📐 Position absolue fixed

---

## 🎨 Composants UI réutilisables

### Button

**Fichier :** `components/ui/button.vue`

Bouton avec variantes de style.

#### Props

```typescript
interface Props {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}
```

#### Usage

```vue
<template>
  <Button variant="primary" @click="handleClick">
    Enregistrer
  </Button>
  
  <Button variant="danger" size="sm" @click="handleDelete">
    Supprimer
  </Button>
  
  <Button variant="ghost" :loading="isLoading">
    Chargement...
  </Button>
</template>
```

#### Variantes

- **default** : Bouton neutre (gris)
- **primary** : Bouton principal (bleu)
- **secondary** : Bouton secondaire (violet)
- **ghost** : Bouton transparent
- **danger** : Bouton destructif (rouge)

---

### Input

**Fichier :** `components/ui/input.vue`

Input text avec styles.

#### Props

```typescript
interface Props {
  modelValue: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  disabled?: boolean
  error?: string
}
```

#### Events

```typescript
emit('update:modelValue', value: string)
```

#### Usage

```vue
<template>
  <Input
    v-model="username"
    type="text"
    placeholder="Nom d'utilisateur"
    :error="usernameError"
  />
</template>
```

---

### Card

**Fichier :** `components/ui/card.vue`

Container card avec shadow et border.

#### Props

```typescript
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}
```

#### Slots

```typescript
<slot name="header" />  // En-tête de la card
<slot />                // Contenu principal
<slot name="footer" />  // Pied de page
```

#### Usage

```vue
<template>
  <Card padding="lg" :hover="true">
    <template #header>
      <h3>Titre de la card</h3>
    </template>
    
    <p>Contenu de la card</p>
    
    <template #footer>
      <Button>Action</Button>
    </template>
  </Card>
</template>
```

---

### Dialog (Modal)

**Fichier :** `components/ui/dialog*.vue`

Système de modales composable.

#### Composants

- `dialog.vue` - Container principal
- `dialogTrigger.vue` - Bouton déclencheur
- `dialogContent.vue` - Contenu de la modal
- `dialogHeader.vue` - En-tête
- `dialogTitle.vue` - Titre
- `dialogDescription.vue` - Description
- `dialogFooter.vue` - Pied de page avec actions
- `dialogClose.vue` - Bouton fermeture

#### Usage

```vue
<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <Button>Ouvrir</Button>
    </DialogTrigger>
    
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Titre de la modal</DialogTitle>
        <DialogDescription>
          Description optionnelle
        </DialogDescription>
      </DialogHeader>
      
      <!-- Contenu -->
      <div class="py-4">
        <p>Contenu de la modal</p>
      </div>
      
      <DialogFooter>
        <DialogClose>
          <Button variant="ghost">Annuler</Button>
        </DialogClose>
        <Button variant="primary" @click="handleSave">
          Enregistrer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

---

### UserAvatar

**Fichier :** `components/ui/UserAvatar.vue`

Avatar utilisateur avec fallback.

#### Props

```typescript
interface Props {
  user: {
    username: string
    full_name?: string
    avatar_url?: string
  }
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showName?: boolean
}
```

#### Usage

```vue
<template>
  <UserAvatar
    :user="currentUser"
    size="md"
    :show-name="true"
  />
</template>
```

#### Fonctionnalités

- 🖼️ Affichage image si disponible
- 🎨 Initiales avec couleur de fond générée
- 📏 4 tailles disponibles
- 📝 Affichage optionnel du nom

---

### DateTimePicker

**Fichier :** `components/ui/DateTimePicker.vue`

Sélecteur de date et heure.

#### Props

```typescript
interface Props {
  modelValue: string | null  // ISO 8601 format
  placeholder?: string
  minDate?: string
}
```

#### Events

```typescript
emit('update:modelValue', value: string | null)
```

#### Usage

```vue
<template>
  <DateTimePicker
    v-model="dueDate"
    placeholder="Sélectionner une date"
    :min-date="new Date().toISOString()"
  />
</template>
```

---

### CardAttachments

**Fichier :** `components/ui/CardAttachments.vue`

Gestion des pièces jointes d'une carte.

#### Props

```typescript
interface Props {
  cardId: string
  attachments: CardAttachment[]
  canEdit: boolean
  isDarkMode: boolean
}
```

#### Events

```typescript
emit('refresh')              // Rafraîchir la liste
emit('attachment-added')     // Pièce jointe ajoutée
emit('attachment-deleted')   // Pièce jointe supprimée
```

#### Usage

```vue
<template>
  <CardAttachments
    :card-id="card.id"
    :attachments="card.attachments"
    :can-edit="canEdit"
    :is-dark-mode="isDarkMode"
    @refresh="refreshCard"
  />
</template>
```

#### Fonctionnalités

- 📎 Upload de fichiers (drag & drop ou click)
- 📥 Téléchargement de fichiers
- 🗑️ Suppression de fichiers
- 📊 Affichage taille et type
- 🖼️ Preview pour les images

---

## 🔔 Modales

### CardDetailModal

**Fichier :** `components/CardDetailModal.vue`

Modal complète pour éditer une carte.

#### Props

```typescript
interface Props {
  isOpen: boolean
  card: Card | null
  columnTitle: string
  labels: Label[]
  isDarkMode: boolean
  boardId: string | null
  canEdit?: boolean
  boardCollaborators?: BoardCollaborator[]
  boardOwner?: UserProfile
}
```

#### Events

```typescript
emit('close')
emit('save', data: CardUpdateData)
emit('saveInBackground', data: CardUpdateData)
emit('delete')
emit('labelCreated', label: Label)
emit('refresh')
```

#### Usage

```vue
<template>
  <CardDetailModal
    :is-open="cardModalOpen"
    :card="selectedCard"
    :column-title="getColumnTitle(selectedCard)"
    :labels="labels"
    :is-dark-mode="isDarkMode"
    :board-id="boardId"
    :can-edit="canEdit"
    :board-collaborators="collaborators"
    :board-owner="boardOwner"
    @close="closeCardModal"
    @save="updateCard"
    @delete="deleteCard"
    @label-created="handleLabelCreated"
  />
</template>
```

#### Sections

- 📝 **Titre** - Édition inline
- 📄 **Description** - Textarea multiligne
- 🏷️ **Labels** - Sélection multiple avec création
- 👥 **Membres** - Assignation de collaborateurs
- 📅 **Date d'échéance** - Date picker
- 📎 **Pièces jointes** - Upload et gestion
- 🗑️ **Actions** - Suppression de la carte

---

### BoardCollaboratorsModal

**Fichier :** `components/BoardCollaboratorsModal.vue`

Gestion des collaborateurs d'un board.

#### Props

```typescript
interface Props {
  isOpen: boolean
  boardId: string
  isDarkMode: boolean
  isOwner: boolean
}
```

#### Events

```typescript
emit('close')
emit('refresh')
```

#### Usage

```vue
<template>
  <BoardCollaboratorsModal
    :is-open="collaboratorsOpen"
    :board-id="boardId"
    :is-dark-mode="isDarkMode"
    :is-owner="isOwner"
    @close="collaboratorsOpen = false"
    @refresh="loadBoard"
  />
</template>
```

#### Fonctionnalités

- 👥 Liste des collaborateurs actuels
- ➕ Invitation de nouveaux membres
- 🔍 Recherche d'utilisateurs
- 👑 Changement de rôle (owner uniquement)
- 🗑️ Retrait de collaborateurs
- 📊 Affichage du statut (pending, accepted)

---

### SettingsModal

**Fichier :** `components/SettingsModal.vue`

Paramètres du board et du profil utilisateur.

#### Props

```typescript
interface Props {
  isOpen: boolean
  isDarkMode: boolean
  boardData?: Board
  canEditBoard?: boolean
}
```

#### Events

```typescript
emit('close')
emit('update-board', data: Partial<Board>)
emit('delete-board')
emit('update-profile', data: UpdateProfileData)
emit('update-password', data: UpdatePasswordData)
```

#### Usage

```vue
<template>
  <SettingsModal
    :is-open="settingsOpen"
    :is-dark-mode="isDarkMode"
    :board-data="currentBoard"
    :can-edit-board="isOwner"
    @close="settingsOpen = false"
    @update-board="updateBoard"
    @delete-board="deleteBoard"
    @update-profile="updateUserProfile"
  />
</template>
```

#### Onglets

- 🎨 **Board** - Titre, description, couleur, suppression
- 👤 **Profil** - Username, nom complet, avatar
- 🔒 **Sécurité** - Changement de mot de passe

---

### NotificationsPanel

**Fichier :** `components/NotificationsPanel.vue`

Panneau latéral des notifications.

#### Props

```typescript
interface Props {
  isOpen: boolean
  isDarkMode: boolean
}
```

#### Events

```typescript
emit('close')
```

#### Usage

```vue
<template>
  <NotificationsPanel
    :is-open="notificationsOpen"
    :is-dark-mode="isDarkMode"
    @close="notificationsOpen = false"
  />
</template>
```

#### Fonctionnalités

- 🔔 Liste des notifications
- ✅ Marquer comme lu
- 🗑️ Supprimer notification
- 📋 Marquer tout comme lu
- 🔢 Badge de compteur (non lues)
- 🔗 Liens vers ressources (boards, cartes)

---

## 🛠️ Composants utilitaires

### BrandLogo

**Fichier :** `components/BrandLogo.vue`

Logo de l'application EpiTrello.

#### Props

```typescript
interface Props {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}
```

#### Usage

```vue
<template>
  <BrandLogo size="lg" :show-text="true" />
</template>
```

---

### PasswordInput

**Fichier :** `components/PasswordInput.vue`

Input mot de passe avec toggle visibilité.

#### Props

```typescript
interface Props {
  modelValue: string
  placeholder?: string
  error?: string
  showStrength?: boolean
}
```

#### Events

```typescript
emit('update:modelValue', value: string)
```

#### Usage

```vue
<template>
  <PasswordInput
    v-model="password"
    placeholder="Mot de passe"
    :error="passwordError"
    :show-strength="true"
  />
</template>
```

#### Fonctionnalités

- 👁️ Toggle visibilité
- 💪 Indicateur de force (optionnel)
- 🎨 États de validation visuelle

---

## 📄 Vues (Pages)

### LandingView

**Fichier :** `views/landing/LandingView.vue`

Page d'accueil de l'application.

#### Sections

- 🎯 Hero avec CTA
- ✨ Fonctionnalités principales
- 📱 Screenshots/démo
- 🚀 Call to action

---

### AuthView

**Fichier :** `views/AuthView.vue`

Page de connexion et inscription.

#### Fonctionnalités

- 🔄 Toggle login/signup
- 📧 Connexion par email ou username
- ✅ Validation des formulaires
- 🔒 Gestion des erreurs

---

### DashboardView

**Fichier :** `views/DashboardView.vue`

Dashboard listant tous les boards de l'utilisateur.

#### Sections

- 📋 Liste des boards personnels
- 👥 Boards partagés
- ➕ Création rapide de board
- 🔍 Recherche de boards
- ⭐ Boards favoris

---

### KanbanView

**Fichier :** `views/KanbanView.vue`

Vue principale du Kanban board.

#### Fonctionnalités

- 🎴 Affichage des colonnes et cartes
- 🖱️ Drag & drop
- ➕ Ajout de colonnes et cartes
- ✏️ Édition inline
- 🎨 Personnalisation des couleurs
- 💾 Auto-save en arrière-plan

---

## 📚 Ressources complémentaires

- **[FRONTEND.md](FRONTEND.md)** - Architecture frontend
- **[FRONTEND-SERVICES.md](FRONTEND-SERVICES.md)** - Services API
- **[FRONTEND-COMPOSABLES.md](FRONTEND-COMPOSABLES.md)** - Composables
- **[FRONTEND-DEVELOPMENT.md](FRONTEND-DEVELOPMENT.md)** - Guide de développement
- **[Vue.js Documentation](https://vuejs.org/)** - Documentation officielle Vue 3
- **[Tailwind CSS](https://tailwindcss.com/)** - Documentation Tailwind
