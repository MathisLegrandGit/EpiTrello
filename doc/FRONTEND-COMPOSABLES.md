# 🎯 Composables Frontend - EpiTrello

Cette documentation détaille les composables Vue 3 qui gèrent le state management de l'application.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [useAuth](#useauth)
- [useBoard](#useboard)
- [useDragDrop](#usedragdrop)
- [Patterns et bonnes pratiques](#patterns-et-bonnes-pratiques)

---

## 🎯 Vue d'ensemble

EpiTrello utilise le pattern **Composables** de Vue 3 pour le state management au lieu de Pinia/Vuex.

### Architecture

```
Composables (Singleton State)
    ↓
Components (reactive)
    ↓
Services API
    ↓
Backend
```

### Avantages

- ✅ **Plus léger** que Pinia/Vuex
- ✅ **Typé nativement** avec TypeScript
- ✅ **Composition API native** (pas de module externe)
- ✅ **State partagé** entre composants avec refs réactives
- ✅ **Logique réutilisable**

---

## 🔐 useAuth

**Fichier :** `composables/useAuth.ts`

Gère l'authentification, le profil utilisateur, et la session.

### État partagé (Singleton)

```typescript
const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
```

Ces variables sont **partagées entre tous les composants** qui appellent `useAuth()`.

---

### API

#### `init(): void`

Initialise le state depuis les cookies au démarrage de l'application.

```typescript
// Dans main.ts ou App.vue
import { useAuth } from '@/composables/useAuth'

const { init } = useAuth()
init()
```

**Lit les cookies :**
- `supabase_session` → Restaure session
- `supabase_user` → Restaure user

---

#### `login(credentials): Promise<void>`

Connecte un utilisateur.

```typescript
const { login, loading, error } = useAuth()

try {
  await login({
    identifier: 'john_doe',  // email ou username
    password: 'motdepasse123'
  })
  // Redirige automatiquement vers /dashboard
} catch (err) {
  console.error('Login error:', error.value)
}
```

**Actions effectuées :**
1. Appelle `authApi.login()`
2. Met à jour `user.value` et `session.value`
3. Enregistre dans les cookies
4. Redirige vers `/dashboard`

---

#### `signup(credentials): Promise<void>`

Crée un nouveau compte.

```typescript
const { signup } = useAuth()

await signup({
  email: 'john@example.com',
  password: 'motdepasse123',
  username: 'john_doe',
  fullName: 'John Doe'
})
```

**Actions effectuées :**
1. Appelle `authApi.signup()`
2. Met à jour state
3. Enregistre cookies
4. Redirige vers `/dashboard`

---

#### `logout(): Promise<void>`

Déconnecte l'utilisateur.

```typescript
const { logout } = useAuth()

await logout()
// Redirige automatiquement vers /login
```

**Actions effectuées :**
1. Appelle `authApi.logout()` (non bloquant)
2. Réinitialise `user` et `session` à `null`
3. Supprime les cookies
4. Redirige vers `/login`

---

#### `updateProfile(data): Promise<User>`

Met à jour le profil utilisateur.

```typescript
const { updateProfile, user } = useAuth()

await updateProfile({
  username: 'nouveau_username',
  fullName: 'Nouveau Nom',
  avatarUrl: 'https://...'
})

console.log(user.value.user_metadata.username) // 'nouveau_username'
```

**Actions effectuées :**
1. Appelle `authApi.updateProfile()`
2. Merge les changements dans `user.value.user_metadata`
3. Met à jour le cookie `supabase_user`

---

#### `updatePassword(data): Promise<void>`

Change le mot de passe.

```typescript
const { updatePassword } = useAuth()

await updatePassword({
  password: 'nouveau_motdepasse'
})
```

---

#### `uploadAvatar(file): Promise<string>`

Upload un nouvel avatar.

```typescript
const { uploadAvatar, user } = useAuth()

const fileInput = document.querySelector('input[type="file"]')
const file = fileInput.files[0]

const avatarUrl = await uploadAvatar(file)
console.log(user.value.user_metadata.avatar_url) // URL mise à jour
```

**Retourne :** URL publique de l'avatar

**Actions effectuées :**
1. Upload via `authApi.uploadAvatar()`
2. Met à jour `user.value.user_metadata.avatar_url`
3. Met à jour le cookie

---

#### `isAuthenticated(): boolean`

Vérifie si l'utilisateur est connecté.

```typescript
const { isAuthenticated } = useAuth()

if (isAuthenticated()) {
  console.log('User is logged in')
}
```

---

### Retour complet

```typescript
const auth = useAuth()

auth.user           // ref<User | null>
auth.session        // ref<Session | null>
auth.loading        // ref<boolean>
auth.error          // ref<string | null>
auth.init           // () => void
auth.login          // (credentials) => Promise<void>
auth.signup         // (credentials) => Promise<void>
auth.logout         // () => Promise<void>
auth.updateProfile  // (data) => Promise<User>
auth.updatePassword // (data) => Promise<void>
auth.uploadAvatar   // (file) => Promise<string>
auth.isAuthenticated // () => boolean
```

---

### Exemple d'utilisation dans un composant

```vue
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

const { user, loading, error, updateProfile } = useAuth()

async function handleProfileUpdate() {
  try {
    await updateProfile({
      fullName: 'New Name'
    })
    alert('Profile updated!')
  } catch (err) {
    console.error('Update failed:', error.value)
  }
}
</script>

<template>
  <div v-if="user">
    <p>Hello {{ user.user_metadata?.username }}</p>
    <img :src="user.user_metadata?.avatar_url" />
    <button @click="handleProfileUpdate" :disabled="loading">
      Update Profile
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>
```

---

## 📋 useBoard

**Fichier :** `composables/useBoard.ts`

Gère les boards, listes (colonnes), et cartes Kanban.

### État partagé (Singleton)

```typescript
const columns = ref<Column[]>([])
const labels = ref<Label[]>([])
const currentBoardId = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)
```

**Singleton :** Toutes les instances de `useBoard()` partagent le même état.

---

### Interface Column

```typescript
interface Column {
  id: string
  title: string
  position: number
  color?: string
  cards: Card[]
}
```

---

### API

#### `fetchData(boardId?: string): Promise<void>`

Charge les données d'un board (listes + cartes + labels).

```typescript
const { fetchData, columns, labels } = useBoard()

await fetchData('board-uuid')
console.log(columns.value) // [{ id, title, cards: [...] }, ...]
```

**Comportement automatique :**
1. Si `boardId` fourni → charge ce board
2. Sinon → charge le premier board de l'utilisateur
3. Si aucun board → crée un board par défaut avec 3 colonnes ("To Do", "In Progress", "Done")

**Actions effectuées :**
1. Appelle `boardsApi.getAll()` (si pas de boardId)
2. Appelle `listsApi.getAll(boardId)`
3. Appelle `cardsApi.getAll()`
4. Appelle `labelsApi.getAll(boardId)`
5. Construit l'objet `Column[]` avec les cartes groupées par liste

---

#### `fetchLabels(): Promise<void>`

Recharge uniquement les labels du board actuel.

```typescript
const { fetchLabels, labels } = useBoard()

await fetchLabels()
console.log(labels.value) // [{ id, name, color, board_id }, ...]
```

---

#### `getLabelById(labelId): Label | undefined`

Récupère un label par son ID.

```typescript
const { getLabelById } = useBoard()

const label = getLabelById('label-uuid')
console.log(label?.name) // "Bug"
```

---

### Opérations sur les colonnes

#### `addColumn(title: string): Promise<void>`

Ajoute une nouvelle colonne.

```typescript
const { addColumn, columns } = useBoard()

await addColumn('Review')
console.log(columns.value.length) // +1
```

**Position automatique :** Utilise `max(positions) + 1`

---

#### `updateColumn(columnId, updates): Promise<void>`

Met à jour une colonne.

```typescript
const { updateColumn } = useBoard()

await updateColumn('column-uuid', {
  title: 'Nouveau titre',
  color: '#FF6B6B'
})
```

**Propriétés modifiables :**
- `title?: string`
- `color?: string`

---

#### `deleteColumn(columnId: string): Promise<void>`

Supprime une colonne.

```typescript
const { deleteColumn } = useBoard()

await deleteColumn('column-uuid')
```

**Rollback automatique** en cas d'erreur.

---

### Opérations sur les cartes

#### `addCard(columnId: string, title: string): Promise<void>`

Ajoute une carte dans une colonne.

```typescript
const { addCard } = useBoard()

await addCard('column-uuid', 'Tâche importante')
```

**Position automatique :** Utilise `max(positions) + 1` dans la colonne

---

#### `updateCard(cardId, updates): Promise<Card>`

Met à jour une carte.

```typescript
const { updateCard } = useBoard()

const updated = await updateCard('card-uuid', {
  title: 'Nouveau titre',
  description: 'Description mise à jour',
  label_ids: ['label1', 'label2'],
  member_ids: ['user1'],
  due_date: '2026-02-15T23:59:59Z',
  list_id: 'autre-colonne-uuid',  // Déplacer vers autre colonne
  position: 2
})
```

**Propriétés modifiables :**
- `title?: string`
- `description?: string`
- `label_ids?: string[]`
- `member_ids?: string[]`
- `list_id?: string`
- `position?: number`
- `due_date?: string | null`

**Mise à jour automatique** du state local après succès.

---

#### `deleteCard(cardId, columnId): Promise<void>`

Supprime une carte.

```typescript
const { deleteCard } = useBoard()

await deleteCard('card-uuid', 'column-uuid')
```

---

#### `moveCard(card, sourceColumnId, targetColumnId, position): Promise<void>`

Déplace une carte entre colonnes ou change sa position.

```typescript
const { moveCard } = useBoard()

await moveCard(
  card,                    // Card object
  'source-column-uuid',
  'target-column-uuid',
  3                        // Nouvelle position
)
```

**Optimistic update :**
1. Met à jour le state local immédiatement
2. Synchronise avec le backend
3. En cas d'erreur → refresh complet via `fetchData()`

---

### Retour complet

```typescript
const board = useBoard()

// State
board.columns        // ref<Column[]>
board.labels         // ref<Label[]>
board.currentBoardId // ref<string | null>
board.isLoading      // ref<boolean>
board.error          // ref<string | null>

// Functions
board.fetchData      // (boardId?) => Promise<void>
board.fetchLabels    // () => Promise<void>
board.getLabelById   // (labelId) => Label | undefined

// Columns
board.addColumn      // (title) => Promise<void>
board.updateColumn   // (id, updates) => Promise<void>
board.deleteColumn   // (id) => Promise<void>

// Cards
board.addCard        // (columnId, title) => Promise<void>
board.updateCard     // (id, updates) => Promise<Card>
board.deleteCard     // (cardId, columnId) => Promise<void>
board.moveCard       // (card, sourceId, targetId, pos) => Promise<void>
```

---

### Exemple d'utilisation Kanban

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useBoard } from '@/composables/useBoard'
import { useRoute } from 'vue-router'

const route = useRoute()
const { 
  columns, 
  labels, 
  isLoading, 
  fetchData, 
  addCard, 
  updateCard 
} = useBoard()

onMounted(() => {
  fetchData(route.params.id as string)
})

async function handleAddCard(columnId: string) {
  await addCard(columnId, 'Nouvelle tâche')
}
</script>

<template>
  <div v-if="!isLoading">
    <div v-for="column in columns" :key="column.id">
      <h2>{{ column.title }}</h2>
      
      <div v-for="card in column.cards" :key="card.id">
        <p>{{ card.title }}</p>
        <span 
          v-for="labelId in card.label_ids" 
          :key="labelId"
          :style="{ background: labels.find(l => l.id === labelId)?.color }"
        >
          {{ labels.find(l => l.id === labelId)?.name }}
        </span>
      </div>
      
      <button @click="handleAddCard(column.id)">+ Add Card</button>
    </div>
  </div>
</template>
```

---

## 🎨 useDragDrop

**Fichier :** `composables/useDragDrop.ts`

Gère le drag & drop des cartes Kanban avec animations fluides.

### État partagé

```typescript
const isDragging = ref(false)
const hasDragStarted = ref(false)
const draggedCard = ref<Card | null>(null)
const draggedFromColumnId = ref<string | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
const smoothedRotation = ref(0)
```

---

### Configuration

```typescript
const dragDrop = useDragDrop({
  onDragStart?: (card: Card, columnId: string) => void
  onDragEnd?: (card: Card, sourceColumnId: string, targetColumnId: string | null, event: MouseEvent) => void
  onCardClick?: (card: Card, columnId: string) => void
})
```

---

### Fonctionnement

#### 1. Drag Threshold

```typescript
const DRAG_THRESHOLD = 5 // pixels
```

**Comportement :**
- Si mouvement < 5px → considéré comme un **click**
- Si mouvement ≥ 5px → considéré comme un **drag**

Cela évite de déclencher le drag accidentellement lors d'un simple clic.

---

#### 2. Phases du drag

```
mousedown → pas encore drag (threshold check)
    ↓
mousemove > 5px → drag commence (onDragStart appelé)
    ↓
mousemove continu → carte suit la souris avec rotation
    ↓
mouseup → drag termine (onDragEnd appelé)
```

---

### API

#### `onCardMouseDown(event, card, columnId): void`

Démarre un potentiel drag au mousedown.

```vue
<template>
  <div 
    @mousedown="dragDrop.onCardMouseDown($event, card, columnId)"
    class="card"
  >
    {{ card.title }}
  </div>
</template>
```

**Actions effectuées :**
1. Calcule l'offset souris → carte
2. Stocke la position initiale
3. Prépare le drag (mais ne démarre pas encore)
4. Ignore les clics sur les boutons

---

#### `setupListeners(): void`

Active les listeners globaux `mousemove` et `mouseup`.

```typescript
const { setupListeners } = useDragDrop({ ... })

onMounted(() => {
  setupListeners()
})
```

**⚠️ Important :** Doit être appelé dans `onMounted()` du composant Kanban.

---

#### `cleanupListeners(): void`

Désactive les listeners globaux.

```typescript
const { cleanupListeners } = useDragDrop({ ... })

onUnmounted(() => {
  cleanupListeners()
})
```

**⚠️ Important :** Doit être appelé dans `onUnmounted()` pour éviter les memory leaks.

---

### Computed Properties

#### `floatingCardStyle`

Style CSS pour la carte flottante pendant le drag.

```vue
<template>
  <div 
    v-if="dragDrop.hasDragStarted" 
    :style="dragDrop.floatingCardStyle"
    class="floating-card"
  >
    <CardComponent :card="dragDrop.draggedCard" />
  </div>
</template>
```

**Calcul dynamique :**
```typescript
{
  left: `${mouseX - dragOffsetX}px`,
  top: `${mouseY - dragOffsetY}px`,
  transform: `rotate(${smoothedRotation}deg)`,
  transition: 'transform 0.1s ease-out'
}
```

---

### Animations

#### Rotation "swing"

La carte tourne légèrement dans la direction du mouvement :

```
Mouvement rapide vers la droite → rotation +12deg
Mouvement rapide vers la gauche → rotation -12deg
Arrêt du mouvement → rotation revient à 0deg
```

**Lissage :**
```typescript
smoothedRotation += (targetRotation - smoothedRotation) * 0.15
```

Donne une animation fluide et naturelle.

---

### Retour complet

```typescript
const dragDrop = useDragDrop({ ... })

// State
dragDrop.isDragging            // ref<boolean>
dragDrop.hasDragStarted        // ref<boolean>
dragDrop.draggedCard           // ref<Card | null>
dragDrop.draggedFromColumnId   // ref<string | null>
dragDrop.floatingCardStyle     // computed style object

// Functions
dragDrop.onCardMouseDown       // (event, card, columnId) => void
dragDrop.setupListeners        // () => void
dragDrop.cleanupListeners      // () => void
```

---

### Exemple complet d'intégration

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useDragDrop } from '@/composables/useDragDrop'
import { useBoard } from '@/composables/useBoard'

const { moveCard } = useBoard()

const dragDrop = useDragDrop({
  onDragStart(card, columnId) {
    console.log(`Drag started: ${card.title}`)
  },
  
  onDragEnd(card, sourceColumnId, targetColumnId, event) {
    if (targetColumnId && targetColumnId !== sourceColumnId) {
      // Calculer la position de drop
      const position = calculateDropPosition(event, targetColumnId)
      moveCard(card, sourceColumnId, targetColumnId, position)
    }
  },
  
  onCardClick(card, columnId) {
    console.log(`Card clicked: ${card.title}`)
    // Ouvrir modal de détails
  }
})

onMounted(() => {
  dragDrop.setupListeners()
})

onUnmounted(() => {
  dragDrop.cleanupListeners()
})
</script>

<template>
  <div class="kanban">
    <div 
      v-for="column in columns" 
      :key="column.id"
      :data-column-id="column.id"
      class="column"
    >
      <h2>{{ column.title }}</h2>
      
      <div
        v-for="card in column.cards"
        :key="card.id"
        @mousedown="dragDrop.onCardMouseDown($event, card, column.id)"
        class="card"
        :class="{ 'is-dragging': dragDrop.draggedCard?.id === card.id }"
      >
        {{ card.title }}
      </div>
    </div>
    
    <!-- Carte flottante pendant le drag -->
    <div 
      v-if="dragDrop.hasDragStarted && dragDrop.draggedCard"
      :style="dragDrop.floatingCardStyle"
      class="floating-card"
    >
      {{ dragDrop.draggedCard.title }}
    </div>
  </div>
</template>

<style scoped>
.card.is-dragging {
  opacity: 0.3;
}

.floating-card {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  cursor: grabbing;
}

.column {
  /* Important pour la détection du drop */
  position: relative;
}
</style>
```

---

## 🎯 Patterns et bonnes pratiques

### 1. Singleton State Pattern

Les composables utilisent des variables réactives **en dehors de la fonction** pour créer un état partagé :

```typescript
// ✅ CORRECT - State partagé (singleton)
const user = ref<User | null>(null)

export function useAuth() {
  return { user, login, logout }
}
```

```typescript
// ❌ INCORRECT - State dupliqué à chaque appel
export function useAuth() {
  const user = ref<User | null>(null)  // Nouveau ref à chaque fois!
  return { user, login, logout }
}
```

---

### 2. Optimistic Updates

Les composables font des **optimistic updates** pour améliorer l'UX :

```typescript
async function deleteColumn(columnId: string) {
  const originalColumns = [...columns.value]
  
  // 1. Update local immédiatement
  columns.value = columns.value.filter(c => c.id !== columnId)
  
  try {
    // 2. Sync avec backend
    await listsApi.delete(columnId)
  } catch (err) {
    // 3. Rollback en cas d'erreur
    columns.value = originalColumns
  }
}
```

**Avantages :**
- Interface réactive instantanément
- Rollback automatique si échec

---

### 3. Cookie Persistence

`useAuth` persiste le state dans les cookies pour survivre aux reloads :

```typescript
// Sauvegarder dans cookie
setCookie('supabase_user', JSON.stringify(user.value))

// Restaurer depuis cookie
const storedUser = getCookie('supabase_user')
user.value = JSON.parse(storedUser)
```

**⚠️ Attention :** Appeler `auth.init()` au démarrage de l'app !

---

### 4. Error Handling

Tous les composables exposent un `error` ref :

```typescript
const { error, login } = useAuth()

try {
  await login(credentials)
} catch (err) {
  console.error('Login failed:', error.value)
}
```

**Pattern :**
```typescript
async function someAction() {
  loading.value = true
  error.value = null  // Reset error
  
  try {
    // ...action
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
    throw err
  } finally {
    loading.value = false
  }
}
```

---

### 5. Composition dans les composants

Combiner plusieurs composables :

```vue
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useBoard } from '@/composables/useBoard'
import { useDragDrop } from '@/composables/useDragDrop'

const { user } = useAuth()
const { columns, addCard, moveCard } = useBoard()
const dragDrop = useDragDrop({
  onDragEnd: (card, source, target) => {
    if (target) moveCard(card, source, target, 0)
  }
})
</script>
```

---

### 6. TypeScript Strict

Toujours typer les composables :

```typescript
// Définir les types
interface Column {
  id: string
  title: string
  cards: Card[]
}

// Typer les refs
const columns = ref<Column[]>([])

// Typer les retours de fonction
export function useBoard(): {
  columns: Ref<Column[]>
  addColumn: (title: string) => Promise<void>
} {
  // ...
}
```

---

## 📚 Ressources complémentaires

- **[FRONTEND.md](FRONTEND.md)** - Architecture frontend
- **[FRONTEND-COMPONENTS.md](FRONTEND-COMPONENTS.md)** - Composants Vue
- **[FRONTEND-SERVICES.md](FRONTEND-SERVICES.md)** - Services API
- **[Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)** - Documentation officielle
- **[Composables](https://vuejs.org/guide/reusability/composables.html)** - Guide des composables Vue
