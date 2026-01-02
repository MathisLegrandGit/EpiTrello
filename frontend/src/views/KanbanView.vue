<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from '@/components/ui/button.vue'
import Card from '@/components/ui/card.vue'
import Input from '@/components/ui/input.vue'
import Dialog from '@/components/ui/dialog.vue'
import DialogContent from '@/components/ui/dialogContent.vue'
import DialogHeader from '@/components/ui/dialogHeader.vue'
import DialogTitle from '@/components/ui/dialogTitle.vue'
import DialogDescription from '@/components/ui/dialogDescription.vue'
import DialogFooter from '@/components/ui/dialogFooter.vue'
import { listsApi, cardsApi, type Card as CardType, type List } from '@/services/api'

interface Column {
  id: string
  name: string
  position: number
  cards: CardType[]
}

const columns = ref<Column[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Dialog state
const isDialogOpen = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const selectedColumnId = ref<string | null>(null)
const selectedCardId = ref<string | null>(null)

// Form data
const cardTitle = ref('')
const cardDescription = ref('')

// Drag and drop state
const draggedCard = ref<{ card: CardType; columnId: string } | null>(null)

// Fetch data from API
async function fetchData() {
  try {
    isLoading.value = true
    error.value = null

    // Fetch lists and cards
    const [lists, cards] = await Promise.all([
      listsApi.getAll(),
      cardsApi.getAll()
    ])

    // Group cards by list_id
    columns.value = lists
      .sort((a, b) => a.position - b.position)
      .map(list => ({
        id: list.id!,
        name: list.name,
        position: list.position,
        cards: cards
          .filter(card => card.list_id === list.id)
          .sort((a, b) => a.position - b.position)
      }))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load data'
    console.error('Error fetching data:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

function openAddDialog(columnId: string) {
  dialogMode.value = 'add'
  selectedColumnId.value = columnId
  cardTitle.value = ''
  cardDescription.value = ''
  isDialogOpen.value = true
}

function openEditDialog(columnId: string, cardId: string) {
  dialogMode.value = 'edit'
  selectedColumnId.value = columnId
  selectedCardId.value = cardId

  const column = columns.value.find((c) => c.id === columnId)
  const card = column?.cards.find((c) => c.id === cardId)

  if (card) {
    cardTitle.value = card.title
    cardDescription.value = card.description || ''
  }

  isDialogOpen.value = true
}

async function saveCard() {
  if (!cardTitle.value.trim()) return

  try {
    if (dialogMode.value === 'add' && selectedColumnId.value) {
      const column = columns.value.find((c) => c.id === selectedColumnId.value)
      const maxPosition = column ? Math.max(0, ...column.cards.map(c => c.position)) : 0

      const newCard = await cardsApi.create({
        list_id: selectedColumnId.value,
        title: cardTitle.value,
        description: cardDescription.value,
        position: maxPosition + 1,
      })

      if (column) {
        column.cards.push(newCard)
      }
    } else if (dialogMode.value === 'edit' && selectedColumnId.value && selectedCardId.value) {
      const updatedCard = await cardsApi.update(selectedCardId.value, {
        title: cardTitle.value,
        description: cardDescription.value,
      })

      const column = columns.value.find((c) => c.id === selectedColumnId.value)
      const cardIndex = column?.cards.findIndex((c) => c.id === selectedCardId.value)
      if (column && cardIndex !== undefined && cardIndex >= 0) {
        column.cards[cardIndex] = updatedCard
      }
    }
  } catch (err) {
    console.error('Error saving card:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save card'
  }

  closeDialog()
}

async function deleteCard(columnId: string, cardId: string) {
  try {
    await cardsApi.delete(cardId)
    const column = columns.value.find((c) => c.id === columnId)
    if (column) {
      column.cards = column.cards.filter((c) => c.id !== cardId)
    }
  } catch (err) {
    console.error('Error deleting card:', err)
    error.value = err instanceof Error ? err.message : 'Failed to delete card'
  }
}

function closeDialog() {
  isDialogOpen.value = false
  cardTitle.value = ''
  cardDescription.value = ''
  selectedColumnId.value = null
  selectedCardId.value = null
}

// Drag and drop functions
function onDragStart(card: CardType, columnId: string) {
  draggedCard.value = { card, columnId }
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
}

async function onDrop(targetColumnId: string) {
  if (!draggedCard.value) return

  const { card, columnId: sourceColumnId } = draggedCard.value

  // Skip if dropped on same column
  if (sourceColumnId === targetColumnId) {
    draggedCard.value = null
    return
  }

  try {
    // Calculate new position (add to end of target column)
    const targetColumn = columns.value.find((c) => c.id === targetColumnId)
    const maxPosition = targetColumn ? Math.max(0, ...targetColumn.cards.map(c => c.position)) : 0

    // Update card in backend
    await cardsApi.update(card.id!, {
      list_id: targetColumnId,
      position: maxPosition + 1,
    })

    // Update local state
    const sourceColumn = columns.value.find((c) => c.id === sourceColumnId)
    if (sourceColumn) {
      sourceColumn.cards = sourceColumn.cards.filter((c) => c.id !== card.id)
    }

    if (targetColumn) {
      targetColumn.cards.push({ ...card, list_id: targetColumnId, position: maxPosition + 1 })
    }
  } catch (err) {
    console.error('Error moving card:', err)
    error.value = err instanceof Error ? err.message : 'Failed to move card'
  }

  draggedCard.value = null
}
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 p-8">
    <div class="max-w-7xl mx-auto">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-slate-900 mb-2">EpiTrello</h1>
        <p class="text-slate-600">Organize your tasks with a beautiful Kanban board</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <div class="text-slate-600">Loading...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {{ error }}
        <Button size="sm" variant="outline" class="ml-4" @click="fetchData">Retry</Button>
      </div>

      <!-- Kanban Board -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="column in columns" :key="column.id" class="flex flex-col" @dragover="onDragOver"
          @drop="onDrop(column.id)">
          <!-- Column Header -->
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full" :class="{
                'bg-blue-500': column.name === 'To Do',
                'bg-yellow-500': column.name === 'In Progress',
                'bg-green-500': column.name === 'Done',
                'bg-slate-400': !['To Do', 'In Progress', 'Done'].includes(column.name),
              }" />
              <h2 class="text-xl font-semibold text-slate-800">
                {{ column.name }}
              </h2>
              <span class="text-sm text-slate-500 bg-slate-200 rounded-full px-2 py-0.5">
                {{ column.cards.length }}
              </span>
            </div>
            <Button size="sm" variant="ghost" @click="openAddDialog(column.id)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd" />
              </svg>
            </Button>
          </div>

          <!-- Cards Container -->
          <div class="flex-1 space-y-3 min-h-[200px]">
            <Card v-for="card in column.cards" :key="card.id" class="p-4 cursor-move hover:shadow-lg transition-shadow"
              draggable="true" @dragstart="onDragStart(card, column.id)">
              <div class="space-y-2">
                <h3 class="font-medium text-slate-900">{{ card.title }}</h3>
                <p class="text-sm text-slate-600">{{ card.description }}</p>
                <div class="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" @click="openEditDialog(column.id, card.id!)">
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" @click="deleteCard(column.id, card.id!)">
                    Delete
                  </Button>
                </div>
              </div>
            </Card>

            <!-- Empty state -->
            <div v-if="column.cards.length === 0"
              class="flex items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-lg text-slate-400">
              <p class="text-sm">Drop cards here</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Card Dialog -->
    <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ dialogMode === 'add' ? 'Add New Card' : 'Edit Card' }}</DialogTitle>
          <DialogDescription>
            {{ dialogMode === 'add' ? 'Create a new task card' : 'Update your task card' }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-900">Title</label>
            <Input v-model="cardTitle" placeholder="Enter card title" @keyup.enter="saveCard" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-900">Description</label>
            <Input v-model="cardDescription" placeholder="Enter card description" @keyup.enter="saveCard" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="closeDialog">Cancel</Button>
          <Button @click="saveCard">{{ dialogMode === 'add' ? 'Add Card' : 'Save Changes' }}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
