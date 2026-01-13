<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/ui/button.vue'
import CardDetailModal from '@/components/CardDetailModal.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import CollaboratorsModal from '@/components/CollaboratorsModal.vue'
import BoardCollaboratorsModal from '@/components/BoardCollaboratorsModal.vue'
import NotificationsPanel from '@/components/NotificationsPanel.vue'
import KanbanHeader from '@/components/kanban/KanbanHeader.vue'
import KanbanColumn from '@/components/kanban/KanbanColumn.vue'
import AddColumnButton from '@/components/kanban/AddColumnButton.vue'
import FloatingCard from '@/components/kanban/FloatingCard.vue'
import { useBoard } from '@/composables/useBoard'
import { useDragDrop } from '@/composables/useDragDrop'
import { useAuth } from '@/composables/useAuth'
import { notificationsApi, boardsApi, collaboratorsApi, type Board, type SharedBoard } from '@/services/api'
import type { Card } from '@/services/api'

const route = useRoute()
const router = useRouter()

// Board state from composable
const {
  columns,
  labels,
  currentBoardId,
  isLoading,
  error,
  fetchData,
  fetchLabels,
  addColumn,
  updateColumn,
  deleteColumn,
  addCard,
  updateCard,
  deleteCard,
} = useBoard()

// UI state
const isDarkMode = ref(true)
const isSettingsOpen = ref(false)
const isCollaboratorsOpen = ref(false)
const isBoardCollaboratorsOpen = ref(false)
const isNotificationsOpen = ref(false)
const notificationCount = ref(0)
const { user } = useAuth()

// Board info
const currentBoard = ref<Board | null>(null)
const boardId = computed(() => route.params.id as string)
const isOwner = computed(() => currentBoard.value?.user_id === user.value?.id)
const userRole = ref<string>('viewer')
const canEdit = computed(() => isOwner.value || userRole.value === 'editor')

// Column menu state
const columnMenuOpen = ref<string | null>(null)
const colorPickerColumnId = ref<string | null>(null)
const editingColumnId = ref<string | null>(null)
const columnColors = ['#3b82f6', '#f97316', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#eab308']

// Card detail modal state
const isCardDetailOpen = ref(false)
const selectedCard = ref<Card | null>(null)
const selectedCardColumnId = ref<string | null>(null)

// Computed column title for modal
const selectedCardColumnTitle = computed(() => {
  if (!selectedCardColumnId.value) return ''
  const column = columns.value.find((c) => c.id === selectedCardColumnId.value)
  return column?.title || ''
})

// Drag and drop with callbacks
const {
  isDragging,
  hasDragStarted,
  draggedCard,
  floatingCardStyle,
  onCardMouseDown,
  setupListeners,
  cleanupListeners,
} = useDragDrop({
  onDragStart: (card, columnId) => {
    // Remove card from source column visually
    const sourceColumn = columns.value.find(c => c.id === columnId)
    if (sourceColumn) {
      sourceColumn.cards = sourceColumn.cards.filter(c => c.id !== card.id)
    }
  },
  onDragEnd: async (card, sourceColumnId, targetColumnId) => {
    const finalTargetId = targetColumnId || sourceColumnId
    const targetColumn = columns.value.find(c => c.id === finalTargetId)
    const maxPosition = targetColumn ? Math.max(0, ...targetColumn.cards.map(c => c.position)) : 0
    const newPosition = maxPosition + 1

    // Add card back to target column (we removed it in onDragStart)
    if (targetColumn) {
      targetColumn.cards.push({ ...card, list_id: finalTargetId, position: newPosition })
    }

    // Sync with backend only if column changed
    if (finalTargetId !== sourceColumnId) {
      try {
        await updateCard(card.id!, {
          list_id: finalTargetId,
          position: newPosition,
        })
      } catch (err) {
        console.error('Error moving card:', err)
        // Revert: refresh data
        fetchData()
      }
    }
  },
  onCardClick: (card, columnId) => {
    openCardDetail(card, columnId)
  },
})

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
}

// Card detail modal functions
function openCardDetail(card: Card, columnId: string) {
  selectedCard.value = card
  selectedCardColumnId.value = columnId
  isCardDetailOpen.value = true
}

async function handleCardSave(data: { title: string; description: string; labelIds: string[] }) {
  if (!selectedCard.value || !selectedCardColumnId.value) return

  try {
    const updatedCard = await updateCard(selectedCard.value.id!, {
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
  }
}

async function deleteCardFromDetail() {
  if (!selectedCard.value || !selectedCardColumnId.value) return
  await deleteCard(selectedCard.value.id!, selectedCardColumnId.value)
  closeCardDetail()
}

function closeCardDetail() {
  isCardDetailOpen.value = false
  selectedCard.value = null
  selectedCardColumnId.value = null
}

// Column handlers
function handleToggleColumnMenu(columnId: string) {
  columnMenuOpen.value = columnMenuOpen.value === columnId ? null : columnId
  colorPickerColumnId.value = null
}

function handleToggleColorPicker(columnId: string) {
  colorPickerColumnId.value = colorPickerColumnId.value === columnId ? null : columnId
}

async function handleUpdateColumnColor(columnId: string, color: string) {
  await updateColumn(columnId, { color })
  colorPickerColumnId.value = null
  columnMenuOpen.value = null
}

async function handleDeleteColumn(columnId: string) {
  columnMenuOpen.value = null
  await deleteColumn(columnId)
}

function handleStartEditingColumn(columnId: string) {
  editingColumnId.value = columnId
  columnMenuOpen.value = null
}

async function handleSaveColumnTitle(columnId: string, title: string) {
  await updateColumn(columnId, { title })
  editingColumnId.value = null
}

function handleCancelEditingColumn() {
  editingColumnId.value = null
}

async function handleAddCard(columnId: string, title: string) {
  await addCard(columnId, title)
}

async function handleAddColumn(title: string) {
  await addColumn(title)
}

function handleCardMouseDown(event: MouseEvent, card: Card, columnId: string) {
  onCardMouseDown(event, card, columnId)
}

function openCollaborators() {
  isCollaboratorsOpen.value = true
  isNotificationsOpen.value = false
}

function openNotifications() {
  isNotificationsOpen.value = !isNotificationsOpen.value
  isCollaboratorsOpen.value = false
}

async function loadNotificationCount() {
  if (!user.value?.id) return
  try {
    const result = await notificationsApi.getUnreadCount(user.value.id)
    notificationCount.value = result.count
  } catch (err) {
    console.error('Error loading notification count:', err)
  }
}

function handleNotificationCountUpdate(count: number) {
  notificationCount.value = count
}

// Polling interval for near real-time notifications
let notificationPollingInterval: ReturnType<typeof setInterval> | null = null

async function loadBoardInfo() {
  if (!boardId.value) return
  try {
    currentBoard.value = await boardsApi.getOne(boardId.value)

    // Determine user's role
    if (currentBoard.value?.user_id === user.value?.id) {
      userRole.value = 'owner'
    } else if (user.value?.id) {
      // Check if user is a collaborator
      const sharedBoards = await collaboratorsApi.getSharedBoards(user.value.id)
      const thisBoard = sharedBoards.find((b: SharedBoard) => b.id === boardId.value)
      userRole.value = thisBoard?.role || 'viewer'
    }
  } catch (err) {
    console.error('Error loading board:', err)
    router.push('/dashboard')
  }
}

function goToDashboard() {
  router.push('/dashboard')
}

onMounted(async () => {
  await loadBoardInfo()
  fetchData(boardId.value)
  setupListeners()
  loadNotificationCount()

  // Poll for new notifications every 3 seconds
  notificationPollingInterval = setInterval(() => {
    loadNotificationCount()
  }, 3000)
})

// Watch for route changes (switching boards)
watch(() => route.params.id, async (newId) => {
  if (newId && typeof newId === 'string') {
    await loadBoardInfo()
    fetchData(newId)
  }
})

onUnmounted(() => {
  cleanupListeners()
  if (notificationPollingInterval) {
    clearInterval(notificationPollingInterval)
  }
})
</script>

<template>
  <div @click="columnMenuOpen = null"
    :class="isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'"
    class="min-h-screen flex flex-col transition-all duration-500">

    <!-- Header (Full Width Banner) -->
    <div class="relative">
      <KanbanHeader :isDarkMode="isDarkMode" :user="user" :notificationCount="notificationCount"
        :boardTitle="currentBoard?.title" :showBackButton="true" @toggle-dark-mode="toggleDarkMode"
        @open-settings="isSettingsOpen = true" @open-collaborators="openCollaborators"
        @open-board-collaborators="isBoardCollaboratorsOpen = true" @open-notifications="openNotifications"
        @go-to-dashboard="goToDashboard" />

      <!-- Notifications Panel (positioned relative to header) -->
      <div class="absolute right-8 top-full z-50">
        <NotificationsPanel :isOpen="isNotificationsOpen" :isDarkMode="isDarkMode" :user="user"
          @close="isNotificationsOpen = false" @update-count="handleNotificationCountUpdate"
          @open-collaborators="openCollaborators" />
      </div>
    </div>

    <div class="p-8 flex-1 flex flex-col overflow-hidden">
      <div class="max-w-7xl mx-auto w-full flex-1 flex flex-col">

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
          <KanbanColumn v-for="column in columns" :key="column.id" :column="column" :isDarkMode="isDarkMode"
            :labels="labels" :menuOpen="columnMenuOpen === column.id"
            :colorPickerOpen="colorPickerColumnId === column.id" :editingTitle="editingColumnId === column.id"
            :columnColors="columnColors" :canEdit="canEdit" @toggle-menu="handleToggleColumnMenu(column.id)"
            @toggle-color-picker="handleToggleColorPicker(column.id)"
            @update-color="(color) => handleUpdateColumnColor(column.id, color)" @delete="handleDeleteColumn(column.id)"
            @start-editing-title="handleStartEditingColumn(column.id)"
            @save-title="(title) => handleSaveColumnTitle(column.id, title)" @cancel-editing="handleCancelEditingColumn"
            @add-card="(title) => handleAddCard(column.id, title)"
            @card-mousedown="(event, card) => handleCardMouseDown(event, card, column.id)" />

          <!-- Add Column Button (only for editors/owners) -->
          <AddColumnButton v-if="canEdit" :isDarkMode="isDarkMode" @add-column="handleAddColumn" />
        </div>
      </div>
    </div>

    <!-- Floating Card during drag -->
    <FloatingCard v-if="isDragging && hasDragStarted && draggedCard" :card="draggedCard" :style="floatingCardStyle"
      :isDarkMode="isDarkMode" :labels="labels" />

    <!-- Card Detail Modal -->
    <CardDetailModal :isOpen="isCardDetailOpen" :card="selectedCard" :columnTitle="selectedCardColumnTitle"
      :labels="labels" :isDarkMode="isDarkMode" :boardId="currentBoardId" :canEdit="canEdit" @close="closeCardDetail"
      @save="handleCardSave" @delete="deleteCardFromDetail" @labelCreated="fetchLabels" @refresh="fetchLabels" />

    <!-- Settings Modal -->
    <SettingsModal :isOpen="isSettingsOpen" :isDarkMode="isDarkMode" @close="isSettingsOpen = false"
      @toggle-dark-mode="toggleDarkMode" />

    <!-- Collaborators Modal -->
    <CollaboratorsModal :isOpen="isCollaboratorsOpen" :isDarkMode="isDarkMode" :user="user"
      @close="isCollaboratorsOpen = false" @refresh-notifications="loadNotificationCount" />

    <!-- Board Collaborators Modal -->
    <BoardCollaboratorsModal :isOpen="isBoardCollaboratorsOpen" :isDarkMode="isDarkMode" :boardId="boardId"
      :userId="user?.id || ''" :isOwner="isOwner" @close="isBoardCollaboratorsOpen = false" />
  </div>
</template>

<style>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>
