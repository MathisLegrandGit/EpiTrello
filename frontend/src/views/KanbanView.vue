<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import Button from '@/components/ui/button.vue'
import CardDetailModal from '@/components/CardDetailModal.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import { listsApi, cardsApi, labelsApi, boardsApi, type Card as CardType, type Label } from '@/services/api'
import { useAuth } from '@/composables/useAuth'

interface Column {
  id: string
  title: string
  position: number
  color?: string
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
const editingCardLabelIds = ref<string[]>([])

const columnColors = ['#3b82f6', '#f97316', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#eab308']

// Column color picker state
const colorPickerColumnId = ref<string | null>(null)

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

// Inline column editing state
const editingColumnId = ref<string | null>(null)
const editingColumnTitle = ref('')
const columnMenuOpen = ref<string | null>(null)

// Settings State
const isSettingsOpen = ref(false)
const { user } = useAuth()

const currentBoardId = ref<string | null>(null)

// Fetch data from API
async function fetchData() {
  try {
    isLoading.value = true
    error.value = null

    if (!user.value) return

    // 1. Fetch User's Boards
    const userBoards = await boardsApi.getAll(user.value!.id)
    let boardId: string

    if (!userBoards || userBoards.length === 0) {
      // Create default board if none exists
      const newBoard = await boardsApi.create({
        name: 'My First Board',
        user_id: user.value.id
      })
      if (!newBoard || !newBoard.id) throw new Error('Failed to create default board')
      boardId = newBoard.id

      // Create default columns for new board
      const defaultColumns = [
        { title: 'To Do', position: 1, color: '#3b82f6' },
        { title: 'In Progress', position: 2, color: '#f97316' },
        { title: 'Done', position: 3, color: '#22c55e' }
      ]

      await Promise.all(
        defaultColumns.map(col =>
          listsApi.create({ board_id: boardId, title: col.title, position: col.position, color: col.color })
        )
      )
    } else {
      boardId = userBoards[0]!.id! // Load first board for now
    }

    currentBoardId.value = boardId

    // 2. Fetch Lists and Cards
    // Note: listsApi.getAll now supports boardId which we should use!
    const [lists, cards] = await Promise.all([
      listsApi.getAll(boardId),
      cardsApi.getAll()
    ])

    // Load correct labels for this board
    const boardLabels = await labelsApi.getAll(boardId)
    labels.value = boardLabels

    columns.value = lists
      .sort((a, b) => a.position - b.position)
      .map(list => ({
        id: list.id!,
        title: list.title,
        position: list.position,
        color: list.color,
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
  // fetchLabels() is handled in fetchData now
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
      board_id: currentBoardId.value!,
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
  editingCardLabelIds.value = [...(card.label_ids || [])]
  isCardDetailOpen.value = true
}

// Handler for CardDetailModal save event
async function handleCardSave(data: { title: string; description: string; labelIds: string[] }) {
  if (!selectedCard.value || !selectedCardColumnId.value) return

  try {
    const updatedCard = await cardsApi.update(selectedCard.value.id!, {
      title: data.title,
      description: data.description,
      label_ids: data.labelIds,
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
}

async function fetchLabels() {
  console.log('fetchLabels called, currentBoardId:', currentBoardId.value)
  if (!currentBoardId.value) {
    console.warn('fetchLabels called but currentBoardId is null!')
    return
  }
  try {
    const result = await labelsApi.getAll(currentBoardId.value)
    console.log('fetchLabels got result:', result)
    labels.value = result
  } catch (err) {
    console.error('Error fetching labels:', err)
  }
}

function getLabelById(labelId: string | null | undefined): Label | undefined {
  if (!labelId) return undefined
  return labels.value.find(l => l.id === labelId)
}

// Inline column editing functions
function startEditingColumn(columnId: string, title: string) {
  editingColumnId.value = columnId
  editingColumnTitle.value = title
  columnMenuOpen.value = null
  nextTick(() => {
    const input = document.querySelector(`input[data-column-edit="${columnId}"]`) as HTMLInputElement
    if (input) input.focus()
  })
}

async function saveColumnTitle() {
  if (!editingColumnTitle.value.trim() || !editingColumnId.value) {
    cancelEditingColumn()
    return
  }

  try {
    await listsApi.update(editingColumnId.value, {
      title: editingColumnTitle.value,
    })
    const column = columns.value.find(c => c.id === editingColumnId.value)
    if (column) {
      column.title = editingColumnTitle.value
    }
  } catch (err) {
    console.error('Error saving column:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save column'
  }

  cancelEditingColumn()
}

function cancelEditingColumn() {
  editingColumnId.value = null
  editingColumnTitle.value = ''
}

function toggleColumnMenu(columnId: string) {
  columnMenuOpen.value = columnMenuOpen.value === columnId ? null : columnId
  colorPickerColumnId.value = null // Close color picker when toggling menu
}

function toggleColorPicker(columnId: string) {
  colorPickerColumnId.value = colorPickerColumnId.value === columnId ? null : columnId
}

async function updateColumnColor(columnId: string, color: string) {
  try {
    await listsApi.update(columnId, { color })
    const column = columns.value.find(c => c.id === columnId)
    if (column) {
      column.color = color
    }
    colorPickerColumnId.value = null
    columnMenuOpen.value = null
  } catch (err) {
    console.error('Error updating column color:', err)
    error.value = err instanceof Error ? err.message : 'Failed to update column color'
  }
}

async function deleteColumn(columnId: string) {
  // if (!confirm('Are you sure you want to delete this column and all its cards?')) return

  columnMenuOpen.value = null
  const originalColumns = [...columns.value]
  columns.value = columns.value.filter(c => c.id !== columnId)

  try {
    await listsApi.delete(columnId)
  } catch (err) {
    console.error('Error deleting column:', err)
    error.value = err instanceof Error ? err.message : 'Failed to delete column'
    columns.value = originalColumns
  }
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
  <div @click="columnMenuOpen = null"
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

        <!-- Header Controls -->
        <div class="flex items-center gap-3">
          <!-- Settings Button -->
          <button @click="isSettingsOpen = true"
            :class="isDarkMode ? 'bg-slate-700/80 hover:bg-slate-600 text-slate-200' : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'"
            class="h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md active:scale-95">
            <div v-if="user?.user_metadata?.avatar_url" class="h-8 w-8 rounded-full overflow-hidden">
              <img :src="user.user_metadata.avatar_url" alt="User" class="h-full w-full object-cover" />
            </div>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clip-rule="evenodd" />
            </svg>
          </button>

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
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                :style="{ backgroundColor: column.color || '#64748b' }" />

              <!-- Inline title editing -->
              <input v-if="editingColumnId === column.id" v-model="editingColumnTitle" :data-column-edit="column.id"
                :class="isDarkMode ? 'bg-transparent text-slate-100' : 'bg-transparent text-slate-800'"
                class="text-lg font-semibold outline-none flex-1 min-w-0" @blur="saveColumnTitle"
                @keyup.enter="saveColumnTitle" @keyup.escape="cancelEditingColumn" />
              <h2 v-else
                :class="isDarkMode ? 'text-slate-100 hover:text-blue-400' : 'text-slate-800 hover:text-blue-600'"
                class="text-lg font-semibold cursor-pointer transition-colors duration-200 truncate"
                @click="startEditingColumn(column.id, column.title)">
                {{ column.title }}
              </h2>

              <span :class="isDarkMode ? 'text-slate-400 bg-slate-700/60' : 'text-slate-500 bg-slate-100'"
                class="text-xs font-medium rounded-full px-2.5 py-1 flex-shrink-0">
                {{ column.cards.length }}
              </span>
            </div>

            <!-- Column Menu -->
            <div class="relative" @click.stop>
              <button @click="toggleColumnMenu(column.id)"
                :class="isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'"
                class="p-1.5 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div v-if="columnMenuOpen === column.id" @click.stop
                :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
                class="absolute right-0 top-full mt-1 w-48 rounded-xl border shadow-lg overflow-hidden z-50">
                <button @click="startAddingCard(column.id); columnMenuOpen = null"
                  :class="isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'"
                  class="w-full px-3 py-2.5 text-sm text-left flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clip-rule="evenodd" />
                  </svg>
                  Add card
                </button>

                <!-- Color Picker Toggle -->
                <button @click="toggleColorPicker(column.id)"
                  :class="isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'"
                  class="w-full px-3 py-2.5 text-sm text-left flex items-center gap-2 transition-colors">
                  <div class="w-4 h-4 rounded-full border-2" :style="{ backgroundColor: column.color || '#64748b' }"
                    :class="isDarkMode ? 'border-slate-600' : 'border-slate-300'" />
                  Change color
                </button>

                <!-- Color Picker Grid -->
                <div v-if="colorPickerColumnId === column.id" class="px-3 py-2 border-t"
                  :class="isDarkMode ? 'border-slate-700' : 'border-slate-200'">
                  <div class="grid grid-cols-4 gap-2">
                    <button v-for="color in columnColors" :key="color" @click="updateColumnColor(column.id, color)"
                      class="w-8 h-8 rounded-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      :class="column.color === color ? 'ring-2 ring-offset-2' : ''" :style="{ backgroundColor: color }"
                      :title="color" />
                  </div>
                </div>

                <button @click="deleteColumn(column.id)"
                  :class="[isDarkMode ? 'text-red-400 hover:bg-red-500/20' : 'text-red-500 hover:bg-red-50', colorPickerColumnId === column.id ? (isDarkMode ? 'border-t border-slate-700' : 'border-t border-slate-200') : '']"
                  class="w-full px-3 py-2.5 text-sm text-left flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd" />
                  </svg>
                  Delete column
                </button>
              </div>
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
                <!-- Label Badges -->
                <div v-if="card.label_ids && card.label_ids.length > 0" class="flex flex-wrap gap-1">
                  <template v-for="(labelId, idx) in card.label_ids" :key="idx">
                    <span v-if="getLabelById(labelId)"
                      class="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      :style="{ backgroundColor: getLabelById(labelId)?.color }">
                      {{ getLabelById(labelId)?.name }}
                    </span>
                  </template>
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
            <div v-if="draggedCard.label_ids && draggedCard.label_ids.length > 0" class="flex flex-wrap gap-1">
              <template v-for="(labelId, idx) in draggedCard.label_ids" :key="idx">
                <span v-if="getLabelById(labelId)" class="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                  :style="{ backgroundColor: getLabelById(labelId)?.color }">
                  {{ getLabelById(labelId)?.name }}
                </span>
              </template>
            </div>
            <h3 :class="isDarkMode ? 'text-slate-100' : 'text-slate-700'" class="font-medium text-sm">
              {{ draggedCard.title }}
            </h3>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Card Detail Modal -->
    <CardDetailModal :isOpen="isCardDetailOpen" :card="selectedCard"
      :columnTitle="selectedCardColumnId ? (columns.find(c => c.id === selectedCardColumnId)?.title || '') : ''"
      :labels="labels" :isDarkMode="isDarkMode" :boardId="currentBoardId" @close="closeCardDetail"
      @save="handleCardSave" @delete="deleteCardFromDetail" @labelCreated="(label) => labels.push(label)"
      @refresh="fetchLabels" />

    <!-- Settings Modal -->
    <SettingsModal :is-open="isSettingsOpen" :is-dark-mode="isDarkMode" @close="isSettingsOpen = false" />
  </div>
</template>
