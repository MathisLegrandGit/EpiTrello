<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button.vue'
import Card from '@/components/ui/card.vue'
import Input from '@/components/ui/input.vue'
import Dialog from '@/components/ui/dialog.vue'
import DialogContent from '@/components/ui/dialogContent.vue'
import DialogHeader from '@/components/ui/dialogHeader.vue'
import DialogTitle from '@/components/ui/dialogTitle.vue'
import DialogDescription from '@/components/ui/dialogDescription.vue'
import DialogFooter from '@/components/ui/dialogFooter.vue'

interface Card {
  id: number
  title: string
  description: string
}

interface Column {
  id: number
  name: string
  cards: Card[]
}

const columns = ref<Column[]>([
  {
    id: 1,
    name: 'To Do',
    cards: [
      { id: 1, title: 'Set up project repository', description: 'Initialize Git and configure basic structure' },
      { id: 2, title: 'Design database schema', description: 'Create ERD and define relationships' },
    ],
  },
  {
    id: 2,
    name: 'In Progress',
    cards: [
      { id: 3, title: 'Implement authentication', description: 'Add JWT-based user authentication' },
    ],
  },
  {
    id: 3,
    name: 'Done',
    cards: [
      { id: 4, title: 'Setup Tailwind CSS', description: 'Configure Tailwind v4 with Vue' },
    ],
  },
])

// Dialog state
const isDialogOpen = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const selectedColumnId = ref<number | null>(null)
const selectedCardId = ref<number | null>(null)

// Form data
const cardTitle = ref('')
const cardDescription = ref('')

// Drag and drop state
const draggedCard = ref<{ card: Card; columnId: number } | null>(null)

function openAddDialog(columnId: number) {
  dialogMode.value = 'add'
  selectedColumnId.value = columnId
  cardTitle.value = ''
  cardDescription.value = ''
  isDialogOpen.value = true
}

function openEditDialog(columnId: number, cardId: number) {
  dialogMode.value = 'edit'
  selectedColumnId.value = columnId
  selectedCardId.value = cardId
  
  const column = columns.value.find((c) => c.id === columnId)
  const card = column?.cards.find((c) => c.id === cardId)
  
  if (card) {
    cardTitle.value = card.title
    cardDescription.value = card.description
  }
  
  isDialogOpen.value = true
}

function saveCard() {
  if (!cardTitle.value.trim()) return

  if (dialogMode.value === 'add' && selectedColumnId.value) {
    const column = columns.value.find((c) => c.id === selectedColumnId.value)
    if (column) {
      column.cards.push({
        id: Date.now(),
        title: cardTitle.value,
        description: cardDescription.value,
      })
    }
  } else if (dialogMode.value === 'edit' && selectedColumnId.value && selectedCardId.value) {
    const column = columns.value.find((c) => c.id === selectedColumnId.value)
    const card = column?.cards.find((c) => c.id === selectedCardId.value)
    if (card) {
      card.title = cardTitle.value
      card.description = cardDescription.value
    }
  }

  closeDialog()
}

function deleteCard(columnId: number, cardId: number) {
  const column = columns.value.find((c) => c.id === columnId)
  if (column) {
    column.cards = column.cards.filter((c) => c.id !== cardId)
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
function onDragStart(card: Card, columnId: number) {
  draggedCard.value = { card, columnId }
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
}

function onDrop(targetColumnId: number) {
  if (!draggedCard.value) return

  const { card, columnId: sourceColumnId } = draggedCard.value

  // Remove from source column
  const sourceColumn = columns.value.find((c) => c.id === sourceColumnId)
  if (sourceColumn) {
    sourceColumn.cards = sourceColumn.cards.filter((c) => c.id !== card.id)
  }

  // Add to target column
  const targetColumn = columns.value.find((c) => c.id === targetColumnId)
  if (targetColumn) {
    targetColumn.cards.push(card)
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

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="column in columns"
          :key="column.id"
          class="flex flex-col"
          @dragover="onDragOver"
          @drop="onDrop(column.id)"
        >
          <!-- Column Header -->
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-3 h-3 rounded-full"
                :class="{
                  'bg-blue-500': column.name === 'To Do',
                  'bg-yellow-500': column.name === 'In Progress',
                  'bg-green-500': column.name === 'Done',
                }"
              />
              <h2 class="text-xl font-semibold text-slate-800">
                {{ column.name }}
              </h2>
              <span class="text-sm text-slate-500 bg-slate-200 rounded-full px-2 py-0.5">
                {{ column.cards.length }}
              </span>
            </div>
            <Button size="sm" variant="ghost" @click="openAddDialog(column.id)">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </Button>
          </div>

          <!-- Cards Container -->
          <div class="flex-1 space-y-3 min-h-[200px]">
            <Card
              v-for="card in column.cards"
              :key="card.id"
              class="p-4 cursor-move hover:shadow-lg transition-shadow"
              draggable="true"
              @dragstart="onDragStart(card, column.id)"
            >
              <div class="space-y-2">
                <h3 class="font-medium text-slate-900">{{ card.title }}</h3>
                <p class="text-sm text-slate-600">{{ card.description }}</p>
                <div class="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" @click="openEditDialog(column.id, card.id)">
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    @click="deleteCard(column.id, card.id)"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>

            <!-- Empty state -->
            <div
              v-if="column.cards.length === 0"
              class="flex items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-lg text-slate-400"
            >
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
            <Input
              v-model="cardTitle"
              placeholder="Enter card title"
              @keyup.enter="saveCard"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-900">Description</label>
            <Input
              v-model="cardDescription"
              placeholder="Enter card description"
              @keyup.enter="saveCard"
            />
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
