# 🛠️ Guide de développement Frontend - EpiTrello

Cette documentation présente les conventions, patterns et bonnes pratiques pour développer sur le frontend EpiTrello.

## 📋 Table des matières

- [Setup et démarrage](#setup-et-démarrage)
- [Structure et conventions](#structure-et-conventions)
- [Patterns Vue 3](#patterns-vue-3)
- [Composants](#composants)
- [State Management](#state-management)
- [API et services](#api-et-services)
- [Styling](#styling)
- [TypeScript](#typescript)
- [Testing](#testing)
- [Performance](#performance)
- [Debugging](#debugging)
- [Build et déploiement](#build-et-déploiement)

---

## 🚀 Setup et démarrage

### Prérequis

```bash
Node.js: ^20.19.0 || >=22.12.0
npm: >= 10
```

### Installation

```bash
cd frontend
npm install
```

### Scripts disponibles

```bash
# Développement avec hot-reload
npm run dev

# Build de production
npm run build

# Preview du build de production
npm run preview

# Type checking (TypeScript)
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting (Prettier)
npm run format
```

### Variables d'environnement

Créer un fichier `.env` à la racine du frontend :

```env
# URL du backend API
VITE_API_URL=http://localhost:3000

# Supabase (optionnel, si besoin côté client)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**⚠️ Important :** Les variables doivent commencer par `VITE_` pour être exposées au client.

---

## 📁 Structure et conventions

### Architecture des dossiers

```
src/
├── assets/          # CSS global, images, fonts
├── components/      # Composants réutilisables
│   ├── kanban/     # Composants Kanban
│   ├── ui/         # Composants UI génériques
│   └── modals/     # Modals/Dialogues
├── composables/     # Composables Vue (state management)
├── router/          # Configuration Vue Router
├── services/        # API client et services HTTP
├── views/           # Pages/Vues principales
├── lib/             # Utilitaires et helpers
├── main.ts          # Point d'entrée
└── App.vue          # Composant racine
```

### Conventions de nommage

#### Fichiers

```
PascalCase pour les composants:
  ✅ KanbanCard.vue
  ✅ CardDetailModal.vue
  ✅ BrandLogo.vue

camelCase pour les composables:
  ✅ useAuth.ts
  ✅ useBoard.ts
  ✅ useDragDrop.ts

kebab-case pour les vues:
  ✅ dashboard-view.vue (mais importé comme DashboardView)
```

#### Variables et fonctions

```typescript
// camelCase pour variables et fonctions
const userName = 'John'
const isLoading = ref(false)

function handleClick() {}
async function fetchData() {}

// PascalCase pour types/interfaces
interface User {
  id: string
  name: string
}

type CardStatus = 'todo' | 'in-progress' | 'done'

// SCREAMING_SNAKE_CASE pour constantes
const API_BASE_URL = 'http://localhost:3000'
const MAX_FILE_SIZE = 5 * 1024 * 1024
```

---

## 🎯 Patterns Vue 3

### Composition API (script setup)

**✅ Toujours utiliser `<script setup>` :**

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { User } from '@/services/api'

// Props
interface Props {
  userId: string
  isAdmin?: boolean
}
const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete'): void
}
const emit = defineEmits<Emits>()

// State
const count = ref(0)

// Computed
const doubleCount = computed(() => count.value * 2)

// Methods
function increment() {
  count.value++
  emit('update', count.value.toString())
}

// Lifecycle
onMounted(() => {
  console.log('Component mounted')
})
</script>
```

---

### Réactivité

#### ref vs reactive

```typescript
// ✅ ref pour primitives et objets simples
const count = ref(0)
const user = ref<User | null>(null)

// Accès avec .value
console.log(count.value)
user.value = { id: '1', name: 'John' }

// ✅ reactive pour objets complexes
const state = reactive({
  loading: false,
  error: null as string | null,
  data: [] as Item[]
})

// Accès direct sans .value
state.loading = true
```

**Règle générale :** Préférer `ref` pour la cohérence.

---

#### Computed properties

```typescript
// ✅ Pour des valeurs dérivées
const fullName = computed(() => 
  `${firstName.value} ${lastName.value}`
)

// ✅ Avec getter et setter
const searchQuery = computed({
  get: () => store.query,
  set: (value) => store.query = value
})
```

---

#### Watchers

```typescript
import { watch, watchEffect } from 'vue'

// watch avec source spécifique
watch(userId, (newId, oldId) => {
  console.log(`User changed from ${oldId} to ${newId}`)
})

// watch multiple sources
watch([userId, boardId], ([newUser, newBoard]) => {
  fetchData(newUser, newBoard)
})

// watchEffect (détecte automatiquement les dépendances)
watchEffect(() => {
  console.log(`Count is: ${count.value}`)
})
```

---

## 🧩 Composants

### Structure d'un composant

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import MyButton from './MyButton.vue'

// 2. Props & Emits
interface Props {
  title: string
}
const props = defineProps<Props>()

interface Emits {
  (e: 'save'): void
}
const emit = defineEmits<Emits>()

// 3. Composables
const { user } = useAuth()

// 4. State
const isEditing = ref(false)

// 5. Computed
const displayTitle = computed(() => 
  isEditing.value ? `Edit: ${props.title}` : props.title
)

// 6. Methods
function handleSave() {
  emit('save')
}

// 7. Lifecycle
onMounted(() => {
  console.log('Component ready')
})
</script>

<template>
  <!-- Template -->
</template>

<style scoped>
/* Styles */
</style>
```

---

### Props best practices

```typescript
// ✅ Typer avec interface
interface Props {
  userId: string
  count?: number           // Optional
  items?: string[]
  metadata?: Record<string, unknown>
}
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => [],
  metadata: () => ({})
})

// ❌ Ne pas utiliser defineProps sans type
const props = defineProps({
  userId: String  // Éviter
})
```

---

### Emits best practices

```typescript
// ✅ Typer les événements
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: string): void
  (e: 'change', payload: { field: string; value: any }): void
}
const emit = defineEmits<Emits>()

// Usage
emit('update', 'new value')
emit('delete', '123')
emit('change', { field: 'name', value: 'John' })
```

---

### Slots

```vue
<!-- Parent -->
<template>
  <Modal>
    <template #header>
      <h2>Title</h2>
    </template>
    
    <template #default>
      <p>Content</p>
    </template>
    
    <template #footer>
      <button>Close</button>
    </template>
  </Modal>
</template>

<!-- Modal.vue -->
<template>
  <div class="modal">
    <div class="modal-header">
      <slot name="header" />
    </div>
    <div class="modal-body">
      <slot />
    </div>
    <div class="modal-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

---

### Provide/Inject

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { provide } from 'vue'

const theme = ref('dark')
provide('theme', theme)
</script>

<!-- Child.vue (n'importe où dans l'arbre) -->
<script setup lang="ts">
import { inject } from 'vue'

const theme = inject<Ref<string>>('theme')
console.log(theme?.value) // 'dark'
</script>
```

---

## 🗂️ State Management

### Utiliser les composables (singleton pattern)

**✅ Créer un composable :**

```typescript
// composables/useCounter.ts
import { ref } from 'vue'

// State partagé (en dehors de la fonction)
const count = ref(0)

export function useCounter() {
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  return {
    count: readonly(count),  // Lecture seule
    increment,
    decrement
  }
}
```

**Utilisation :**

```vue
<script setup lang="ts">
import { useCounter } from '@/composables/useCounter'

const { count, increment } = useCounter()
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
  </div>
</template>
```

**✅ Tous les composants partagent le même `count`.**

---

### Pattern: Loading, Error, Data

```typescript
// composables/useData.ts
import { ref } from 'vue'

export function useData() {
  const data = ref<Item[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  async function fetchData() {
    loading.value = true
    error.value = null
    
    try {
      data.value = await api.getData()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error'
    } finally {
      loading.value = false
    }
  }
  
  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    fetchData
  }
}
```

**Utilisation dans un composant :**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useData } from '@/composables/useData'

const { data, loading, error, fetchData } = useData()

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>
  <div v-else>
    <div v-for="item in data" :key="item.id">
      {{ item.name }}
    </div>
  </div>
</template>
```

---

## 🌐 API et services

### Appeler l'API

```typescript
import { boardsApi } from '@/services/api'

// Dans un composable
async function loadBoards() {
  loading.value = true
  error.value = null
  
  try {
    const boards = await boardsApi.getAll(userId)
    // Success
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed'
  } finally {
    loading.value = false
  }
}
```

---

### Gestion des erreurs

```typescript
// ✅ Pattern try-catch avec state
async function saveData() {
  try {
    await api.save(data)
    showSuccessToast('Saved!')
  } catch (err) {
    if (err instanceof Error) {
      showErrorToast(err.message)
    }
  }
}

// ✅ Rollback en cas d'erreur (optimistic update)
async function deleteItem(id: string) {
  const backup = [...items.value]
  items.value = items.value.filter(i => i.id !== id)
  
  try {
    await api.delete(id)
  } catch (err) {
    items.value = backup  // Rollback
    throw err
  }
}
```

---

## 🎨 Styling

### Tailwind CSS

**✅ Utiliser Tailwind pour le styling :**

```vue
<template>
  <div class="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
    <img 
      :src="avatar" 
      class="w-12 h-12 rounded-full object-cover"
    />
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-900">
        {{ name }}
      </h3>
      <p class="text-sm text-gray-500">
        {{ email }}
      </p>
    </div>
  </div>
</template>
```

---

### Classes dynamiques

```vue
<template>
  <button
    :class="[
      'px-4 py-2 rounded font-medium transition-colors',
      variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
      variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      disabled && 'opacity-50 cursor-not-allowed'
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false
})
</script>
```

---

### Utilitaire cn() (class-variance-authority)

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Usage :**

```vue
<template>
  <div :class="cn('base-class', { 'active': isActive }, className)">
    Content
  </div>
</template>

<script setup lang="ts">
interface Props {
  className?: string
  isActive?: boolean
}
const props = defineProps<Props>()
</script>
```

---

### Scoped styles

```vue
<style scoped>
/* Scopé uniquement à ce composant */
.card {
  background: white;
  padding: 1rem;
}

/* :deep() pour cibler les enfants */
:deep(.child-component) {
  color: red;
}

/* :global() pour styles globaux */
:global(body) {
  margin: 0;
}
</style>
```

---

## 📘 TypeScript

### Typage strict

```typescript
// tsconfig.json doit avoir:
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

### Typer les refs

```typescript
import type { Ref } from 'vue'
import type { User } from '@/services/api'

// ✅ Typer explicitement
const user = ref<User | null>(null)
const count = ref<number>(0)
const items = ref<string[]>([])

// ✅ Retour de fonction typé
function useUser(): {
  user: Ref<User | null>
  loadUser: (id: string) => Promise<void>
} {
  const user = ref<User | null>(null)
  
  async function loadUser(id: string) {
    user.value = await api.getUser(id)
  }
  
  return { user, loadUser }
}
```

---

### Type guards

```typescript
function isError(err: unknown): err is Error {
  return err instanceof Error
}

// Usage
try {
  await action()
} catch (err) {
  if (isError(err)) {
    console.error(err.message)
  }
}
```

---

### Assertions de type

```typescript
// ✅ Type assertion (quand vous êtes sûr)
const input = document.querySelector('input') as HTMLInputElement
const value = someValue as string

// ❌ Éviter 'any'
const data: any = response  // Éviter

// ✅ Utiliser 'unknown' puis narrower
const data: unknown = response
if (typeof data === 'object' && data !== null) {
  // TypeScript sait maintenant que data est un object
}
```

---

## 🧪 Testing

### Structure de test recommandée

```
src/
├── components/
│   ├── Button.vue
│   └── __tests__/
│       └── Button.spec.ts
└── composables/
    ├── useAuth.ts
    └── __tests__/
        └── useAuth.spec.ts
```

---

### Test unitaire (Vitest recommandé)

```typescript
// Button.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'

describe('Button', () => {
  it('renders correctly', () => {
    const wrapper = mount(Button, {
      props: { label: 'Click me' }
    })
    expect(wrapper.text()).toContain('Click me')
  })
  
  it('emits click event', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })
})
```

---

### Tester les composables

```typescript
// useCounter.spec.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from '../useCounter'

describe('useCounter', () => {
  it('increments count', () => {
    const { count, increment } = useCounter()
    expect(count.value).toBe(0)
    
    increment()
    expect(count.value).toBe(1)
  })
})
```

---

## ⚡ Performance

### Lazy loading des composants

```typescript
// ✅ Lazy load des composants lourds
const CardDetailModal = defineAsyncComponent(() => 
  import('@/components/CardDetailModal.vue')
)

// ✅ Lazy load des routes
const routes = [
  {
    path: '/kanban/:id',
    component: () => import('@/views/KanbanView.vue')
  }
]
```

---

### v-memo pour optimiser les rerenders

```vue
<template>
  <div 
    v-for="item in items" 
    :key="item.id"
    v-memo="[item.id, item.title]"
  >
    {{ item.title }}
  </div>
</template>
```

**Note :** `v-memo` ne rerender que si `item.id` ou `item.title` change.

---

### Computed vs Methods

```vue
<script setup lang="ts">
// ✅ Computed (caché)
const filteredItems = computed(() => 
  items.value.filter(i => i.active)
)

// ❌ Method (recalculé à chaque render)
function getFilteredItems() {
  return items.value.filter(i => i.active)
}
</script>

<template>
  <!-- ✅ Utiliser computed -->
  <div v-for="item in filteredItems" :key="item.id">
  
  <!-- ❌ Éviter method -->
  <div v-for="item in getFilteredItems()" :key="item.id">
</template>
```

---

### Débounce pour les inputs

```typescript
import { ref, watch } from 'vue'

const searchQuery = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (newQuery) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  
  debounceTimer = setTimeout(() => {
    performSearch(newQuery)
  }, 300)
})
```

---

## 🐛 Debugging

### Vue DevTools

```bash
# Installé automatiquement avec vite-plugin-vue-devtools
npm run dev
```

**Ouvrir :** Chrome DevTools → Vue tab

**Fonctionnalités :**
- Inspecter le state des composants
- Timeline des événements
- Router inspection
- Performance profiling

---

### Console logging

```typescript
// ✅ Utiliser console.log en dev
if (import.meta.env.DEV) {
  console.log('Debug:', data)
}

// ✅ Grouper les logs
console.group('User Login')
console.log('Email:', email)
console.log('Token:', token)
console.groupEnd()

// ✅ console.table pour arrays/objects
console.table(users)
```

---

### Debugging réactivité

```typescript
import { watchEffect } from 'vue'

// Track toutes les dépendances réactives
watchEffect(() => {
  console.log('Count changed:', count.value)
  console.log('User changed:', user.value)
})
```

---

### Network debugging

```typescript
// Dans services/api.ts, logger tous les appels
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  console.log(`→ ${options?.method || 'GET'} ${endpoint}`)
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
  
  console.log(`← ${response.status} ${endpoint}`)
  
  return response.json()
}
```

---

## 🏗️ Build et déploiement

### Build de production

```bash
# Type checking + build
npm run build

# Output dans dist/
# ├── assets/
# │   ├── index-abc123.js
# │   └── index-def456.css
# └── index.html
```

---

### Variables d'environnement

```env
# .env.production
VITE_API_URL=https://api.epitrello.com
```

```typescript
// Accès dans le code
const apiUrl = import.meta.env.VITE_API_URL

// Mode de l'app
if (import.meta.env.PROD) {
  // Production
}
```

---

### Optimisations du build

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Minification
    minify: 'terser',
    
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'ui-components': [
            './src/components/ui/Button.vue',
            './src/components/ui/Input.vue'
          ]
        }
      }
    },
    
    // Source maps (désactiver en prod)
    sourcemap: false
  }
})
```

---

### Preview du build

```bash
npm run preview
# Serveur sur http://localhost:4173
```

---

### Déploiement Docker

```dockerfile
# Dockerfile (production)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 📚 Ressources complémentaires

- **[FRONTEND.md](FRONTEND.md)** - Architecture frontend
- **[FRONTEND-COMPONENTS.md](FRONTEND-COMPONENTS.md)** - Composants Vue
- **[FRONTEND-SERVICES.md](FRONTEND-SERVICES.md)** - Services API
- **[FRONTEND-COMPOSABLES.md](FRONTEND-COMPOSABLES.md)** - Composables
- **[Vue 3 Documentation](https://vuejs.org/)** - Documentation officielle Vue
- **[Vite Documentation](https://vite.dev/)** - Documentation Vite
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - Documentation TypeScript
- **[Tailwind CSS](https://tailwindcss.com/docs)** - Documentation Tailwind
