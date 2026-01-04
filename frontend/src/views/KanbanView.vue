<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Dialog from '@/components/ui/dialog.vue'
import DialogContent from '@/components/ui/dialogContent.vue'
import DialogHeader from '@/components/ui/dialogHeader.vue'
import DialogTitle from '@/components/ui/dialogTitle.vue'
import DialogDescription from '@/components/ui/dialogDescription.vue'
import DialogFooter from '@/components/ui/dialogFooter.vue'
import { listsApi, cardsApi, labelsApi, type Card as CardType, type Label } from '@/services/api'

interface Column {
  id: string
  title: string
  position: number
  cards: CardType[]
}

const columns = ref<Column[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const isDarkMode = ref(true)

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
}

// Inline editing state for cards
const isAddingCardInColumn = ref<string | null>(null) // columnId where we're adding
const newCardTitle = ref('')

// Inline editing state for columns
const isAddingColumn = ref(false)
const newColumnTitle = ref('')

// Labels state
const labels = ref<Label[]>([])

// Card detail modal state
const isCardDetailOpen = ref(false)
const selectedCard = ref<CardType | null>(null)
const selectedCardColumnId = ref<string | null>(null)
const editingCardTitle = ref('')
const editingCardDescription = ref('')
const editingCardLabelId = ref<string | null>(null)

// New label creation
const isCreatingLabel = ref(false)
const newLabelName = ref('')
const newLabelColor = ref('#3b82f6')
const labelColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899']

// Custom drag state
const isDragging = ref(false)
const hasDragStarted = ref(false) // True only after mouse moved past threshold
const draggedCard = ref<CardType | null>(null)
const draggedFromColumnId = ref<string | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)
const mouseStartX = ref(0)
const mouseStartY = ref(0)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
const smoothedRotation = ref(0)
const DRAG_THRESHOLD = 5 // Pixels to move before considering it a drag

// Column dialog state
const isColumnDialogOpen = ref(false)
const columnDialogMode = ref<'add' | 'edit'>('add')
const selectedColumnForEdit = ref<string | null>(null)
const columnTitle = ref('')
const BOARD_ID = '00000000-0000-0000-0000-000000000001' // Default board

// Fetch data from API
async function fetchData() {
  try {
    isLoading.value = true
    error.value = null

    const [lists, cards] = await Promise.all([
      listsApi.getAll(),
      cardsApi.getAll()
    ])

    columns.value = lists
      .sort((a, b) => a.position - b.position)
      .map(list => ({
        id: list.id!,
        title: list.title,
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

onMounted(() => {
  fetchData()
  fetchLabels()
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
})

// Inline card creation functions
function startAddingCard(columnId: string) {
  isAddingCardInColumn.value = columnId
  newCardTitle.value = ''
  // Focus the input after it appears in DOM
  nextTick(() => {
    const input = document.querySelector(`input[placeholder="Enter card title..."]`) as HTMLInputElement
    if (input) input.focus()
  })
}

async function addCardInline() {
  if (!newCardTitle.value.trim() || !isAddingCardInColumn.value) {
    cancelAddingCard()
    return
  }

  try {
    const column = columns.value.find((c) => c.id === isAddingCardInColumn.value)
    const maxPosition = column ? Math.max(0, ...column.cards.map(c => c.position)) : 0

    const newCard = await cardsApi.create({
      list_id: isAddingCardInColumn.value,
      title: newCardTitle.value,
      position: maxPosition + 1,
    })

    if (column) {
      column.cards.push(newCard)
    }
  } catch (err) {
    console.error('Error saving card:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save card'
  }

  cancelAddingCard()
}

function cancelAddingCard() {
  isAddingCardInColumn.value = null
  newCardTitle.value = ''
}

// Inline column creation functions
function startAddingColumn() {
  isAddingColumn.value = true
  newColumnTitle.value = ''
  // Focus the input after it appears in DOM
  nextTick(() => {
    const input = document.querySelector(`input[placeholder="Column title..."]`) as HTMLInputElement
    if (input) input.focus()
  })
}

async function addColumnInline() {
  if (!newColumnTitle.value.trim()) {
    cancelAddingColumn()
    return
  }

  try {
    const maxPosition = columns.value.length > 0
      ? Math.max(...columns.value.map(c => c.position))
      : 0

    const newList = await listsApi.create({
      board_id: BOARD_ID,
      title: newColumnTitle.value,
      position: maxPosition + 1,
    })

    columns.value.push({
      id: newList.id!,
      title: newList.title,
      position: newList.position,
      cards: [],
    })
  } catch (err) {
    console.error('Error creating column:', err)
    error.value = err instanceof Error ? err.message : 'Failed to create column'
  }

  cancelAddingColumn()
}

function cancelAddingColumn() {
  isAddingColumn.value = false
  newColumnTitle.value = ''
}

// Card detail modal functions
function openCardDetail(card: CardType, columnId: string) {
  selectedCard.value = card
  selectedCardColumnId.value = columnId
  editingCardTitle.value = card.title
  editingCardDescription.value = card.description || ''
  editingCardLabelId.value = card.label_id || null
  isCardDetailOpen.value = true
}

async function saveCardDetail() {
  if (!selectedCard.value || !editingCardTitle.value.trim()) return

  try {
    const updatedCard = await cardsApi.update(selectedCard.value.id!, {
      title: editingCardTitle.value,
      description: editingCardDescription.value,
      label_id: editingCardLabelId.value,
    })

    // Update in columns
    const column = columns.value.find((c) => c.id === selectedCardColumnId.value)
    const cardIndex = column?.cards.findIndex((c) => c.id === selectedCard.value!.id)
    if (column && cardIndex !== undefined && cardIndex >= 0) {
      column.cards[cardIndex] = updatedCard
    }

    closeCardDetail()
  } catch (err) {
    console.error('Error saving card:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save card'
  }
}

async function deleteCardFromDetail() {
  if (!selectedCard.value || !selectedCardColumnId.value) return

  const column = columns.value.find((c) => c.id === selectedCardColumnId.value)
  if (!column) return

  try {
    await cardsApi.delete(selectedCard.value.id!)
    column.cards = column.cards.filter((c) => c.id !== selectedCard.value!.id)
    closeCardDetail()
  } catch (err) {
    console.error('Error deleting card:', err)
    error.value = err instanceof Error ? err.message : 'Failed to delete card'
  }
}

function closeCardDetail() {
  isCardDetailOpen.value = false
  selectedCard.value = null
  selectedCardColumnId.value = null
  isCreatingLabel.value = false
}

async function fetchLabels() {
  try {
    labels.value = await labelsApi.getAll(BOARD_ID)
  } catch (err) {
    console.error('Error fetching labels:', err)
  }
}

async function createLabel() {
  if (!newLabelName.value.trim()) return

  try {
    const label = await labelsApi.create({
      board_id: BOARD_ID,
      name: newLabelName.value,
      color: newLabelColor.value,
    })
    labels.value.push(label)
    editingCardLabelId.value = label.id!
    isCreatingLabel.value = false
    newLabelName.value = ''
    newLabelColor.value = '#3b82f6'
  } catch (err) {
    console.error('Error creating label:', err)
  }
}

function getLabelById(labelId: string | null | undefined): Label | undefined {
  if (!labelId) return undefined
  return labels.value.find(l => l.id === labelId)
}

// Column management functions
function openColumnEditDialog(columnId: string, title: string) {
  columnDialogMode.value = 'edit'
  selectedColumnForEdit.value = columnId
  columnTitle.value = title
  isColumnDialogOpen.value = true
}

async function saveColumn() {
  if (!columnTitle.value.trim()) return

  try {
    if (columnDialogMode.value === 'add') {
      const maxPosition = Math.max(0, ...columns.value.map(c => c.position))
      const newList = await listsApi.create({
        board_id: BOARD_ID,
        title: columnTitle.value,
        position: maxPosition + 1,
      })
      columns.value.push({
        id: newList.id!,
        title: newList.title,
        position: newList.position,
        cards: [],
      })
    } else if (selectedColumnForEdit.value) {
      await listsApi.update(selectedColumnForEdit.value, {
        title: columnTitle.value,
      })
      const column = columns.value.find(c => c.id === selectedColumnForEdit.value)
      if (column) {
        column.title = columnTitle.value
      }
    }
  } catch (err) {
    console.error('Error saving column:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save column'
  }

  closeColumnDialog()
}

async function deleteColumn(columnId: string) {
  if (!confirm('Are you sure you want to delete this column and all its cards?')) return

  const originalColumns = [...columns.value]
  columns.value = columns.value.filter(c => c.id !== columnId)

  try {
    await listsApi.delete(columnId)
  } catch (err) {
    console.error('Error deleting column:', err)
    error.value = err instanceof Error ? err.message : 'Failed to delete column'
    columns.value = originalColumns
  }

  closeColumnDialog()
}

function closeColumnDialog() {
  isColumnDialogOpen.value = false
  columnTitle.value = ''
  selectedColumnForEdit.value = null
}

// Custom drag functions
function onCardMouseDown(event: MouseEvent, card: CardType, columnId: string) {
  // Ignore if clicking on buttons
  if ((event.target as HTMLElement).closest('button')) return

  event.preventDefault()

  const cardElement = (event.currentTarget as HTMLElement)
  const rect = cardElement.getBoundingClientRect()

  // Store offset from mouse to card top-left
  dragOffsetX.value = event.clientX - rect.left
  dragOffsetY.value = event.clientY - rect.top

  // Store initial mouse position
  mouseStartX.value = event.clientX
  mouseStartY.value = event.clientY
  mouseX.value = event.clientX
  mouseY.value = event.clientY

  // Prepare for potential drag (but don't start yet)
  isDragging.value = true
  hasDragStarted.value = false
  draggedCard.value = card
  draggedFromColumnId.value = columnId
  smoothedRotation.value = 0
}

function onMouseMove(event: MouseEvent) {
  if (!isDragging.value) return

  // Check if we've moved past threshold to start actual drag
  if (!hasDragStarted.value) {
    const deltaX = Math.abs(event.clientX - mouseStartX.value)
    const deltaY = Math.abs(event.clientY - mouseStartY.value)

    if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
      hasDragStarted.value = true

      // Now remove card from source column
      const sourceColumn = columns.value.find(c => c.id === draggedFromColumnId.value)
      if (sourceColumn && draggedCard.value) {
        sourceColumn.cards = sourceColumn.cards.filter(c => c.id !== draggedCard.value!.id)
      }
    } else {
      return // Don't update position until drag actually starts
    }
  }

  // Calculate raw velocity
  const rawVelocity = event.clientX - mouseX.value

  // Smooth the rotation with dampening
  const targetRotation = Math.abs(rawVelocity) > 2
    ? Math.max(-12, Math.min(12, rawVelocity * 0.6))
    : 0

  smoothedRotation.value += (targetRotation - smoothedRotation.value) * 0.15

  if (Math.abs(smoothedRotation.value) < 0.5) {
    smoothedRotation.value = 0
  }

  mouseX.value = event.clientX
  mouseY.value = event.clientY
}

async function onMouseUp(event: MouseEvent) {
  if (!isDragging.value || !draggedCard.value || !draggedFromColumnId.value) return

  const card = draggedCard.value
  const sourceColumnId = draggedFromColumnId.value

  // If drag never actually started (no movement), open card detail modal
  if (!hasDragStarted.value) {
    isDragging.value = false
    hasDragStarted.value = false
    openCardDetail(card, sourceColumnId)
    draggedCard.value = null
    draggedFromColumnId.value = null
    return
  }

  // Find which column we're dropping on
  let targetColumnId: string | null = null
  const columnElements = document.querySelectorAll('[data-column-id]')

  for (const colEl of columnElements) {
    const rect = colEl.getBoundingClientRect()
    if (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    ) {
      targetColumnId = colEl.getAttribute('data-column-id')
      break
    }
  }

  // If no valid target, put card back in source
  if (!targetColumnId) {
    targetColumnId = sourceColumnId
  }

  const targetColumn = columns.value.find(c => c.id === targetColumnId)
  const maxPosition = targetColumn ? Math.max(0, ...targetColumn.cards.map(c => c.position)) : 0
  const newPosition = maxPosition + 1

  // Add card to target column
  if (targetColumn) {
    targetColumn.cards.push({ ...card, list_id: targetColumnId!, position: newPosition })
  }

  // Reset drag state
  isDragging.value = false
  hasDragStarted.value = false
  draggedCard.value = null
  draggedFromColumnId.value = null

  // Sync with backend if column changed
  if (targetColumnId !== sourceColumnId) {
    try {
      await cardsApi.update(card.id!, {
        list_id: targetColumnId!,
        position: newPosition,
      })
    } catch (err) {
      console.error('Error moving card:', err)
      error.value = err instanceof Error ? err.message : 'Failed to move card'
      fetchData() // Refresh to get correct state
    }
  }
}

// Computed style for floating card with swing rotation
const floatingCardStyle = computed(() => {
  return {
    left: `${mouseX.value - dragOffsetX.value}px`,
    top: `${mouseY.value - dragOffsetY.value}px`,
    transform: `rotate(${smoothedRotation.value.toFixed(1)}deg)`,
    transition: 'transform 0.1s ease-out',
  }
})
</script>

<template>
  <div
    :class="isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'"
    class="min-h-screen p-8 flex flex-col transition-all duration-500">
    <div class="max-w-7xl mx-auto w-full flex-1 flex flex-col">
      <!-- Header -->
      <div class="mb-10 flex items-center justify-between animate-fade-in">
        <div>
          <h1 :class="isDarkMode ? 'text-white' : 'text-slate-900'" class="text-4xl font-bold mb-2 tracking-tight">
            EpiTrello
          </h1>
          <p :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'" class="text-lg font-light">
            Organize your tasks with style
          </p>
        </div>

        <!-- Dark Mode Toggle -->
        <button @click="toggleDarkMode" :class="isDarkMode ? 'bg-slate-700/80 shadow-inner' : 'bg-slate-200/80'"
          class="relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 backdrop-blur-sm">
          <div class="absolute inset-0 flex items-center justify-between px-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-400" viewBox="0 0 20 20"
              fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clip-rule="evenodd" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" viewBox="0 0 20 20"
              fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </div>
          <span :class="isDarkMode ? 'translate-x-8' : 'translate-x-0'"
            class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-out z-10"></span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <div class="flex flex-col items-center gap-4">
          <div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'" class="text-sm font-medium">Loading your
            board...</span>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-4 flex items-center gap-4 animate-scale-in">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd" />
        </svg>
        <span class="flex-1">{{ error }}</span>
        <Button size="sm" variant="outline" @click="fetchData">Retry</Button>
      </div>

      <!-- Kanban Board -->
      <div v-else class="flex gap-6 flex-1 overflow-x-auto pb-4">
        <div v-for="column in columns" :key="column.id" :data-column-id="column.id"
          :class="isDarkMode ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm' : 'bg-white/60 border-slate-200/60 backdrop-blur-sm'"
          class="flex flex-col rounded-2xl p-5 border shadow-sm min-w-[320px] flex-shrink-0 transition-all duration-200 hover:shadow-md animate-slide-up">
          <!-- Column Header -->
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-3 h-3 rounded-full shadow-sm" :class="{
                'bg-gradient-to-br from-blue-400 to-blue-600': column.title === 'To Do',
                'bg-gradient-to-br from-amber-400 to-orange-500': column.title === 'Doing' || column.title === 'In Progress',
                'bg-gradient-to-br from-emerald-400 to-green-600': column.title === 'Done',
                'bg-gradient-to-br from-slate-400 to-slate-500': !['To Do', 'Doing', 'In Progress', 'Done'].includes(column.title),
              }" />
              <h2 :class="isDarkMode ? 'text-slate-100 hover:text-blue-400' : 'text-slate-800 hover:text-blue-600'"
                class="text-lg font-semibold cursor-pointer transition-colors duration-200"
                @click="openColumnEditDialog(column.id, column.title)">
                {{ column.title }}
              </h2>
              <span :class="isDarkMode ? 'text-slate-400 bg-slate-700/60' : 'text-slate-500 bg-slate-100'"
                class="text-xs font-medium rounded-full px-2.5 py-1">
                {{ column.cards.length }}
              </span>
            </div>
          </div>

          <!-- Cards Container -->
          <div class="flex-1 space-y-3 min-h-[80px]">
            <!-- Empty State with dotted border -->
            <div v-if="column.cards.length === 0 && isAddingCardInColumn !== column.id"
              :class="isDarkMode ? 'border-slate-600/50 text-slate-500' : 'border-slate-300 text-slate-400'"
              class="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2 opacity-50" viewBox="0 0 20 20"
                fill="currentColor">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                <path fill-rule="evenodd"
                  d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                  clip-rule="evenodd" />
              </svg>
              <p class="text-sm font-medium">Drop cards here</p>
            </div>

            <div v-for="card in column.cards" :key="card.id" :class="isDarkMode
              ? 'bg-slate-700/60 border-slate-600/40 hover:bg-slate-600/70 hover:border-slate-500/60'
              : 'bg-white border-slate-200/80 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5'"
              class="p-3.5 cursor-pointer transition-all duration-200 select-none border rounded-xl"
              @click="openCardDetail(card, column.id)" @mousedown="onCardMouseDown($event, card, column.id)">
              <div class="space-y-2">
                <!-- Label Badge -->
                <div v-if="getLabelById(card.label_id)" class="flex">
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                    :style="{ backgroundColor: getLabelById(card.label_id)?.color }">
                    {{ getLabelById(card.label_id)?.name }}
                  </span>
                </div>
                <h3 :class="isDarkMode ? 'text-slate-100' : 'text-slate-700'" class="font-medium text-sm leading-snug">
                  {{ card.title }}
                </h3>
              </div>
            </div>

            <!-- Inline Add Card Input -->
            <div v-if="isAddingCardInColumn === column.id"
              :class="isDarkMode ? 'bg-slate-700/60 border-slate-600/40' : 'bg-white border-slate-200'"
              class="p-3 border rounded-xl animate-scale-in">
              <input v-model="newCardTitle" :class="isDarkMode
                ? 'bg-transparent text-slate-100 placeholder-slate-500'
                : 'bg-transparent text-slate-800 placeholder-slate-400'"
                class="w-full text-sm font-medium outline-none" placeholder="Enter card title..."
                @keyup.enter="addCardInline" @keyup.escape="cancelAddingCard" @blur="addCardInline" autofocus />
            </div>
          </div>

          <!-- Add Card Button at Bottom - Always visible -->
          <div @click="startAddingCard(column.id)" :class="isDarkMode
            ? 'bg-slate-700/40 border-slate-600/40 text-slate-400 hover:bg-slate-700/60 hover:text-slate-300'
            : 'bg-slate-100/60 border-slate-200/60 text-slate-500 hover:bg-slate-100 hover:text-slate-600'"
            class="mt-3 py-2.5 flex items-center justify-center gap-2 rounded-xl transition-all duration-200 text-sm font-medium cursor-pointer border">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd" />
            </svg>
            Add card
          </div>
        </div>

        <!-- Add Column - Inline or Button -->
        <div v-if="isAddingColumn"
          :class="isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/60 border-slate-200/60'"
          class="flex flex-col rounded-2xl p-5 border min-w-[320px] flex-shrink-0 animate-scale-in">
          <input v-model="newColumnTitle" :class="isDarkMode
            ? 'bg-transparent text-slate-100 placeholder-slate-500'
            : 'bg-transparent text-slate-800 placeholder-slate-400'" class="w-full text-lg font-semibold outline-none"
            placeholder="Column title..." @keyup.enter="addColumnInline" @keyup.escape="cancelAddingColumn"
            @blur="addColumnInline" autofocus />
        </div>

        <!-- Add Column Button -->
        <div v-else :class="isDarkMode
          ? 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/30'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'"
          class="flex flex-col items-center justify-center min-w-[320px] h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 flex-shrink-0 group"
          @click="startAddingColumn">
          <svg xmlns="http://www.w3.org/2000/svg" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'"
            class="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clip-rule="evenodd" />
          </svg>
          <p :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'" class="text-sm font-medium">Add Column</p>
        </div>
      </div>
    </div>

    <!-- Floating card that follows cursor -->
    <Teleport to="body">
      <div v-if="isDragging && hasDragStarted && draggedCard" class="fixed pointer-events-none z-[9999] w-72"
        :style="floatingCardStyle">
        <div :class="isDarkMode ? 'bg-slate-700 border-slate-500' : 'bg-white border-blue-200'"
          class="p-3.5 rounded-xl shadow-2xl border-2 ring-4 ring-blue-500/20">
          <div class="space-y-2">
            <div v-if="getLabelById(draggedCard.label_id)" class="flex">
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                :style="{ backgroundColor: getLabelById(draggedCard.label_id)?.color }">
                {{ getLabelById(draggedCard.label_id)?.name }}
              </span>
            </div>
            <h3 :class="isDarkMode ? 'text-slate-100' : 'text-slate-700'" class="font-medium text-sm">
              {{ draggedCard.title }}
            </h3>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Column Dialog -->
    <Dialog :open="isColumnDialogOpen" @update:open="isColumnDialogOpen = $event">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ columnDialogMode === 'add' ? 'Add New Column' : 'Edit Column' }}</DialogTitle>
          <DialogDescription>
            {{ columnDialogMode === 'add' ? 'Create a new column for your board' : 'Rename or delete this column' }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-900">Column Name</label>
            <Input v-model="columnTitle" placeholder="Enter column name" @keyup.enter="saveColumn" />
          </div>
        </div>

        <DialogFooter>
          <div class="flex w-full justify-between">
            <Button v-if="columnDialogMode === 'edit'" variant="destructive"
              @click="deleteColumn(selectedColumnForEdit!)">
              Delete Column
            </Button>
            <div class="flex gap-2">
              <Button variant="outline" @click="closeColumnDialog">Cancel</Button>
              <Button @click="saveColumn">{{ columnDialogMode === 'add' ? 'Add Column' : 'Save' }}</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Card Detail Modal -->
    <Dialog :open="isCardDetailOpen" @update:open="isCardDetailOpen = $event">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>Card Details</DialogTitle>
          <DialogDescription>Edit card information and manage labels</DialogDescription>
        </DialogHeader>

        <div class="space-y-5 py-4">
          <!-- Title -->
          <div class="space-y-2">
            <label :class="isDarkMode ? 'text-slate-300' : 'text-slate-700'" class="text-sm font-medium">Title</label>
            <Input v-model="editingCardTitle" :class="isDarkMode ? 'bg-slate-800 border-slate-600 text-white' : ''"
              placeholder="Card title" />
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label :class="isDarkMode ? 'text-slate-300' : 'text-slate-700'"
              class="text-sm font-medium">Description</label>
            <textarea v-model="editingCardDescription"
              :class="isDarkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-slate-300'"
              class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3" placeholder="Add a more detailed description..."></textarea>
          </div>

          <!-- Labels -->
          <div class="space-y-3">
            <label :class="isDarkMode ? 'text-slate-300' : 'text-slate-700'" class="text-sm font-medium">Label</label>

            <!-- Label Options -->
            <div class="flex flex-wrap gap-2">
              <button v-for="label in labels" :key="label.id"
                @click="editingCardLabelId = editingCardLabelId === label.id ? null : label.id!"
                :class="editingCardLabelId === label.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''"
                class="px-3 py-1.5 rounded-full text-sm font-medium text-white transition-all"
                :style="{ backgroundColor: label.color }">
                {{ label.name }}
              </button>

              <!-- Add Label Button -->
              <button v-if="!isCreatingLabel" @click="isCreatingLabel = true"
                :class="isDarkMode ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'border-slate-300 text-slate-500 hover:border-slate-400'"
                class="px-3 py-1.5 rounded-full text-sm font-medium border border-dashed transition-colors">
                + New Label
              </button>
            </div>

            <!-- Create Label Form -->
            <div v-if="isCreatingLabel" class="p-3 rounded-lg" :class="isDarkMode ? 'bg-slate-800' : 'bg-slate-50'">
              <div class="space-y-3">
                <Input v-model="newLabelName" :class="isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : ''"
                  placeholder="Label name" />
                <div class="flex flex-wrap gap-2">
                  <button v-for="color in labelColors" :key="color" @click="newLabelColor = color"
                    :class="newLabelColor === color ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : ''"
                    class="w-6 h-6 rounded-full transition-transform" :style="{ backgroundColor: color }"></button>
                </div>
                <div class="flex gap-2">
                  <Button size="sm" @click="createLabel">Create</Button>
                  <Button size="sm" variant="outline" @click="isCreatingLabel = false">Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div class="flex w-full justify-between">
            <Button variant="destructive" @click="deleteCardFromDetail">Delete Card</Button>
            <div class="flex gap-2">
              <Button variant="outline" @click="closeCardDetail">Cancel</Button>
              <Button @click="saveCardDetail">Save Changes</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
