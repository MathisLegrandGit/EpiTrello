<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { boardsApi, notificationsApi, collaboratorsApi, type Board, type SharedBoard } from '@/services/api'
import { useAuth } from '@/composables/useAuth'
import KanbanHeader from '@/components/kanban/KanbanHeader.vue'
import SettingsModal from '@/components/SettingsModal.vue'
import CollaboratorsModal from '@/components/CollaboratorsModal.vue'
import NotificationsPanel from '@/components/NotificationsPanel.vue'
import BoardCollaboratorsModal from '@/components/BoardCollaboratorsModal.vue'

const router = useRouter()
const { user } = useAuth()

// State
const boards = ref<Board[]>([])
const sharedBoards = ref<SharedBoard[]>([])
const loading = ref(true)
const showCreateModal = ref(false)
const showDeleteModal = ref(false)
const newBoardName = ref('')
const editingBoardId = ref<string | null>(null)
const editingBoardName = ref('')
const boardToDelete = ref<Board | null>(null)
const creating = ref(false)
const isDarkMode = ref(true)
const showLeaveModal = ref(false)
const boardToLeave = ref<SharedBoard | null>(null)
const openMenuBoardId = ref<string | null>(null)

// Modal states (same as KanbanView)
const isSettingsOpen = ref(false)
const isCollaboratorsOpen = ref(false)
const isNotificationsOpen = ref(false)
const notificationCount = ref(0)

// Board Collaborators Modal State
const isBoardCollaboratorsOpen = ref(false)
const collaboratingBoardId = ref<string>('')
const collaboratingBoardOwnerId = ref<string>('')

// Computed
const userId = computed(() => user.value?.id)
const pendingInvitations = computed(() => sharedBoards.value.filter(b => b.status === 'pending'))
const acceptedSharedBoards = computed(() => sharedBoards.value.filter(b => b.status === 'accepted' || !b.status))

// Load boards
async function loadBoards(background = false) {
    if (!userId.value) return
    if (!background) loading.value = true
    try {
        const [ownedBoards, shared] = await Promise.all([
            boardsApi.getAll(userId.value),
            collaboratorsApi.getSharedBoards(userId.value),
        ])
        boards.value = ownedBoards
        sharedBoards.value = shared

        // If no boards exist, create default one
        if (ownedBoards.length === 0 && shared.length === 0) {
            await createDefaultBoard()
        }
    } catch (err) {
        console.error('Error loading boards:', err)
    } finally {
        if (!background) loading.value = false
    }
}

async function createDefaultBoard() {
    if (!userId.value) return
    try {
        const board = await boardsApi.create({
            user_id: userId.value,
            title: 'My First Board',
        })
        boards.value = [board]
    } catch (err) {
        console.error('Error creating default board:', err)
    }
}

// Board actions
function openBoard(boardId: string) {
    router.push(`/board/${boardId}`)
}

async function createBoard() {
    if (!newBoardName.value.trim() || !userId.value) return
    creating.value = true
    try {
        const board = await boardsApi.create({
            user_id: userId.value,
            title: newBoardName.value.trim(),
            color: getRandomColor(),
        })
        boards.value.unshift(board)
        newBoardName.value = ''
        showCreateModal.value = false
    } catch (err) {
        console.error('Error creating board:', err)
    } finally {
        creating.value = false
    }
}

function startEditing(board: Board) {
    editingBoardId.value = board.id || null
    editingBoardName.value = board.title
    editingBoardColor.value = getBoardColor(board)
}

async function saveEdit() {
    if (!editingBoardId.value || !editingBoardName.value.trim()) return
    try {
        await boardsApi.update(editingBoardId.value, {
            title: editingBoardName.value.trim(),
            color: editingBoardColor.value,
        })
        const board = boards.value.find(b => b.id === editingBoardId.value)
        if (board) {
            board.title = editingBoardName.value.trim()
            board.color = editingBoardColor.value
        }
        cancelEdit()
    } catch (err) {
        console.error('Error updating board:', err)
    }
}

function cancelEdit() {
    editingBoardId.value = null
    editingBoardName.value = ''
    editingBoardColor.value = '#8b5cf6'
}

function confirmDelete(board: Board) {
    boardToDelete.value = board
    showDeleteModal.value = true
}

async function deleteBoard() {
    if (!boardToDelete.value?.id) return
    try {
        await boardsApi.delete(boardToDelete.value.id)
        boards.value = boards.value.filter(b => b.id !== boardToDelete.value?.id)
        showDeleteModal.value = false
        boardToDelete.value = null
    } catch (err) {
        console.error('Error deleting board:', err)
    }
}

function formatDate(dateString?: string): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Board color options with gradient classes and display colors
const colorOptions = [
    { gradient: 'from-violet-500 to-purple-600', color: '#8b5cf6', name: 'Purple' },
    { gradient: 'from-cyan-500 to-blue-600', color: '#06b6d4', name: 'Cyan' },
    { gradient: 'from-emerald-500 to-teal-600', color: '#10b981', name: 'Emerald' },
    { gradient: 'from-rose-500 to-pink-600', color: '#f43f5e', name: 'Rose' },
    { gradient: 'from-amber-500 to-orange-600', color: '#f59e0b', name: 'Amber' },
    { gradient: 'from-indigo-500 to-violet-600', color: '#6366f1', name: 'Indigo' },
    { gradient: 'from-fuchsia-500 to-pink-600', color: '#d946ef', name: 'Fuchsia' },
    { gradient: 'from-sky-500 to-cyan-600', color: '#0ea5e9', name: 'Sky' },
]

const editingBoardColor = ref<string>('#8b5cf6')

// Get truly random color using crypto API for better distribution
function getRandomColor(): string {
    const array = new Uint32Array(1)
    crypto.getRandomValues(array)
    const randomIndex = (array[0] ?? 0) % colorOptions.length
    return colorOptions[randomIndex]?.color ?? '#8b5cf6'
}

// Get the fallback color for boards without stored color (based on ID hash)
function getFallbackColor(boardId: string): string {
    const hash = Math.abs(boardId.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))
    return colorOptions[hash % colorOptions.length]?.color ?? '#8b5cf6'
}

// Get gradient class from color hex
function getBoardGradient(board: Board): string {
    const actualColor = board.color || (board.id ? getFallbackColor(board.id) : '#8b5cf6')
    const colorOption = colorOptions.find(c => c.color === actualColor)
    return colorOption?.gradient ?? 'from-violet-500 to-purple-600'
}

// Get the actual color for a board (stored or fallback)
function getBoardColor(board: Board): string {
    return board.color || (board.id ? getFallbackColor(board.id) : '#8b5cf6')
}

// Get gradient for shared boards
function getSharedBoardGradient(board: SharedBoard): string {
    const actualColor = board.color || (board.id ? getFallbackColor(board.id) : '#8b5cf6')
    const colorOption = colorOptions.find(c => c.color === actualColor)
    return colorOption?.gradient ?? 'from-violet-500 to-purple-600'
}

// Header handlers
function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
}

function openCollaborators() {
    isCollaboratorsOpen.value = true
}

function openBoardCollaborators(board: Board | SharedBoard) {
    if (!board.id) return
    collaboratingBoardId.value = board.id
    // If board is SharedBoard, it has owner object. If Board, user_id is owner.
    collaboratingBoardOwnerId.value = 'user_id' in board ? (board.user_id ?? '') : ((board as SharedBoard).owner?.id ?? '')
    isBoardCollaboratorsOpen.value = true
}

function openNotifications() {
    isNotificationsOpen.value = !isNotificationsOpen.value
}

async function loadNotificationCount() {
    if (!user.value?.id) return
    try {
        const { count } = await notificationsApi.getUnreadCount(user.value.id)
        notificationCount.value = count
    } catch (err) {
        console.error('Error loading notification count:', err)
    }
}

function handleNotificationCountUpdate(count: number) {
    notificationCount.value = count
}

async function respondToInvitation(board: SharedBoard, accept: boolean) {
    if (!userId.value) return
    try {
        await collaboratorsApi.respondToInvitation(board.id, userId.value, accept)
        await loadBoards()
    } catch (err) {
        console.error('Error responding to invitation:', err)
    }
}

function confirmLeave(board: SharedBoard) {
    boardToLeave.value = board
    showLeaveModal.value = true
    openMenuBoardId.value = null
}

function toggleBoardMenu(boardId: string) {
    openMenuBoardId.value = openMenuBoardId.value === boardId ? null : boardId
}

function closeBoardMenu() {
    openMenuBoardId.value = null
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

async function leaveBoard() {
    if (!userId.value || !boardToLeave.value) return
    try {
        await collaboratorsApi.removeCollaborator(boardToLeave.value.id, userId.value, userId.value)
        showLeaveModal.value = false
        boardToLeave.value = null
        await loadBoards()
    } catch (err) {
        console.error('Error leaving board:', err)
    }
}

onMounted(() => {
    loadBoards()
    loadNotificationCount()

    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
        if (userId.value) {
            loadBoards(true)
            loadNotificationCount()
        }
    }, 3000)

    onUnmounted(() => {
        clearInterval(interval)
        document.removeEventListener('click', handleClickOutside)
    })

    // Close menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
        const target = event.target as HTMLElement
        if (!target.closest('[data-board-menu]')) {
            closeBoardMenu()
        }
    }
    document.addEventListener('click', handleClickOutside)
})

watch(userId, (newId) => {
    if (newId) {
        loadBoards()
        loadNotificationCount()
    }
})
</script>

<template>
    <div class="min-h-screen flex flex-col transition-colors duration-300"
        :class="isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'">

        <!-- Real KanbanHeader -->
        <div class="relative">
            <KanbanHeader :isDarkMode="isDarkMode" :user="user" :notificationCount="notificationCount"
                @toggle-dark-mode="toggleDarkMode" @open-settings="isSettingsOpen = true"
                @open-collaborators="openCollaborators" @open-notifications="openNotifications" />

            <!-- Notifications Panel -->
            <div class="absolute right-8 top-full z-50">
                <NotificationsPanel :isOpen="isNotificationsOpen" :isDarkMode="isDarkMode" :user="user"
                    @close="isNotificationsOpen = false" @update-count="handleNotificationCountUpdate"
                    @open-collaborators="openCollaborators" />
            </div>
        </div>

        <!-- Content -->
        <main class="px-8 py-8 max-w-7xl mx-auto w-full flex-1">
            <!-- My Boards Title -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold mb-1" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                    My Boards
                </h1>
                <p class="text-base" :class="isDarkMode ? 'text-slate-500' : 'text-slate-500'">
                    {{ boards.length }} board{{ boards.length !== 1 ? 's' : '' }}
                </p>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-20">
                <div class="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin"
                    :class="isDarkMode ? 'border-cyan-500' : 'border-blue-500'" />
            </div>

            <!-- Empty State -->
            <div v-else-if="boards.length === 0" class="text-center py-20">
                <div class="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                    :class="isDarkMode ? 'bg-white/5' : 'bg-slate-100'">
                    <svg class="w-10 h-10" :class="isDarkMode ? 'text-slate-600' : 'text-slate-300'" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                </div>
                <h2 class="text-xl font-bold mb-2" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                    No boards yet
                </h2>
                <p class="mb-6" :class="isDarkMode ? 'text-slate-500' : 'text-slate-500'">
                    Create your first board to get started
                </p>
                <button @click="showCreateModal = true"
                    class="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/25">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Board
                </button>
            </div>

            <!-- Boards Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <div v-for="board in boards" :key="board.id"
                    class="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    :class="isDarkMode ? 'bg-white/5 hover:bg-white/10 hover:shadow-cyan-500/10' : 'bg-white hover:shadow-slate-300/50 border border-slate-200'"
                    @click="openBoard(board.id!)">

                    <!-- Board Color Banner -->
                    <div class="h-24 relative bg-gradient-to-br" :class="getBoardGradient(board)">
                        <!-- Pattern overlay -->
                        <div class="absolute inset-0 opacity-20"
                            style="background-image: url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z\' fill=\'%23ffffff\' fill-opacity=\'0.1\'/%3E%3C/svg%3E');" />

                        <!-- Actions (always visible) -->
                        <div class="absolute top-3 right-3 flex gap-2">
                            <button @click.stop="openBoardCollaborators(board)"
                                class="p-2 rounded-lg bg-black/30 backdrop-blur-sm text-white/80 hover:text-emerald-400 hover:bg-black/40 transition-colors"
                                title="Share Board">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0020 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" />
                                </svg>
                            </button>
                            <button @click.stop="startEditing(board)"
                                class="p-2 rounded-lg bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/40 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button @click.stop="confirmDelete(board)"
                                class="p-2 rounded-lg bg-black/30 backdrop-blur-sm text-white/80 hover:text-red-400 hover:bg-black/40 transition-colors">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Board Info -->
                    <div class="p-4">
                        <h3 class="font-semibold text-lg truncate mb-1"
                            :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                            {{ board.title }}
                        </h3>
                        <p class="text-sm" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
                            Created {{ formatDate(board.created_at) }}
                        </p>
                    </div>
                </div>

                <!-- Create New Board Card -->
                <button @click="showCreateModal = true"
                    class="group rounded-2xl border-2 border-dashed transition-all duration-300 h-[180px] flex flex-col items-center justify-center gap-3"
                    :class="isDarkMode ? 'border-white/10 hover:border-cyan-500/50 hover:bg-white/5' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                        :class="isDarkMode ? 'bg-white/5 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-400' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span class="font-medium"
                        :class="isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700'">
                        Create new board
                    </span>
                </button>
            </div>

            <!-- Pending Invitations Section -->
            <div v-if="pendingInvitations.length > 0" class="mt-12">
                <div class="mb-6">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-xl" :class="isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'">
                            <svg class="w-5 h-5" :class="isDarkMode ? 'text-amber-400' : 'text-amber-600'" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                                Pending Invitations
                            </h2>
                            <p class="text-sm" :class="isDarkMode ? 'text-slate-500' : 'text-slate-500'">
                                {{ pendingInvitations.length }} invitation{{ pendingInvitations.length !== 1 ? 's' : ''
                                }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    <div v-for="board in pendingInvitations" :key="board.id"
                        class="group relative rounded-2xl overflow-hidden cursor-default transition-all duration-300 hover:shadow-xl"
                        :class="isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:shadow-slate-300/50 border border-slate-200'">

                        <!-- Board Color Banner -->
                        <div class="h-24 relative bg-gradient-to-br" :class="getSharedBoardGradient(board)">
                            <!-- Pattern overlay -->
                            <div class="absolute inset-0 opacity-20"
                                style="background-image: url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z\' fill=\'%23ffffff\' fill-opacity=\'0.1\'/%3E%3C/svg%3E');" />

                            <!-- Invite Badge -->
                            <div
                                class="absolute top-3 left-3 px-2 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-lg">
                                Invitation
                            </div>
                        </div>

                        <!-- Board Info -->
                        <div class="p-4">
                            <h3 class="font-semibold text-lg truncate mb-1"
                                :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                                {{ board.title }}
                            </h3>
                            <div class="flex items-center gap-2 mb-4">
                                <div
                                    class="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs overflow-hidden">
                                    <img v-if="board.owner?.avatar_url" :src="board.owner.avatar_url"
                                        class="w-full h-full object-cover" />
                                    <span v-else>{{ String(board.owner?.full_name || board.owner?.username || '?')[0]
                                    }}</span>
                                </div>
                                <p class="text-sm truncate" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
                                    Invited by {{ board.owner?.full_name || board.owner?.username }}
                                </p>
                            </div>

                            <!-- Actions -->
                            <div class="flex gap-3">
                                <button @click="respondToInvitation(board, false)"
                                    class="flex-1 px-4 py-2.5 bg-gradient-to-br from-slate-700/80 to-slate-800/80 text-slate-300 rounded-xl font-semibold hover:from-slate-600 hover:to-slate-700 hover:text-slate-100 transition-all duration-300 flex items-center justify-center gap-2 text-sm border border-slate-600/30 hover:border-slate-500/50">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Decline
                                </button>
                                <button @click="respondToInvitation(board, true)"
                                    class="flex-1 px-4 py-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/40 hover:scale-[1.02]">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M5 13l4 4L19 7" />
                                    </svg>
                                    Accept
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Shared With Me Section -->
            <div v-if="acceptedSharedBoards.length > 0" class="mt-12">
                <div class="mb-6">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-xl" :class="isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'">
                            <svg class="w-5 h-5" :class="isDarkMode ? 'text-emerald-400' : 'text-emerald-600'"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-2xl font-bold" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                                Shared With Me
                            </h2>
                            <p class="text-sm" :class="isDarkMode ? 'text-slate-500' : 'text-slate-500'">
                                {{ acceptedSharedBoards.length }} board{{ acceptedSharedBoards.length !== 1 ? 's' : ''
                                }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    <div v-for="board in acceptedSharedBoards" :key="board.id"
                        class="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                        :class="isDarkMode ? 'bg-white/5 hover:bg-white/10 hover:shadow-emerald-500/10' : 'bg-white hover:shadow-slate-300/50 border border-slate-200'"
                        @click="openBoard(board.id)">

                        <!-- Board Color Banner -->
                        <div class="h-24 relative bg-gradient-to-br" :class="getSharedBoardGradient(board)">
                            <!-- Pattern overlay -->
                            <div class="absolute inset-0 opacity-20"
                                style="background-image: url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z\' fill=\'%23ffffff\' fill-opacity=\'0.1\'/%3E%3C/svg%3E');" />

                            <!-- Actions (Three-dot menu) -->
                            <div class="absolute top-3 right-3" data-board-menu>
                                <button @click.stop="toggleBoardMenu(board.id)"
                                    class="p-2 rounded-lg bg-black/30 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/50 transition-colors">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="5" r="2" />
                                        <circle cx="12" cy="12" r="2" />
                                        <circle cx="12" cy="19" r="2" />
                                    </svg>
                                </button>
                                <!-- Dropdown Menu -->
                                <Transition name="dropdown">
                                    <div v-if="openMenuBoardId === board.id"
                                        class="absolute right-0 top-full mt-1 w-40 rounded-xl shadow-xl overflow-hidden z-10"
                                        :class="isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'">
                                        <button @click.stop="confirmLeave(board)"
                                            class="w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-2 transition-colors"
                                            :class="isDarkMode ? 'text-red-400 hover:bg-slate-700' : 'text-red-500 hover:bg-slate-100'">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Leave Board
                                        </button>
                                    </div>
                                </Transition>
                            </div>

                            <!-- Collaboration Badge -->
                            <div
                                class="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm flex items-center gap-1.5">
                                <!-- Editor icon (pencil) -->
                                <svg v-if="board.role === 'editor'" class="w-4 h-4 text-emerald-400" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <!-- Viewer icon (eye) -->
                                <svg v-else class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span class="text-xs text-white/90">{{ capitalize(board.role) }}</span>
                            </div>
                        </div>

                        <!-- Board Info -->
                        <div class="p-4">
                            <h3 class="font-semibold text-lg truncate mb-1"
                                :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                                {{ board.title }}
                            </h3>
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs overflow-hidden">
                                    <img v-if="board.owner?.avatar_url" :src="board.owner.avatar_url"
                                        class="w-full h-full object-cover" />
                                    <span v-else>{{ String(board.owner?.full_name || board.owner?.username || '?')[0]
                                    }}</span>
                                </div>
                                <p class="text-sm truncate" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
                                    {{ board.owner?.full_name || board.owner?.username }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- Settings Modal -->
        <SettingsModal :isOpen="isSettingsOpen" :isDarkMode="isDarkMode" @close="isSettingsOpen = false"
            @toggle-dark-mode="toggleDarkMode" />

        <!-- Collaborators Modal -->
        <CollaboratorsModal :isOpen="isCollaboratorsOpen" :isDarkMode="isDarkMode" :user="user"
            @close="isCollaboratorsOpen = false" />

        <!-- Board Collaborators Modal -->
        <BoardCollaboratorsModal :isOpen="isBoardCollaboratorsOpen" :isDarkMode="isDarkMode"
            :boardId="collaboratingBoardId" :userId="user?.id || ''" :isOwner="collaboratingBoardOwnerId === user?.id"
            @close="isBoardCollaboratorsOpen = false" />

        <!-- Create Modal -->
        <Transition name="modal">
            <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showCreateModal = false" />
                <div class="relative w-full max-w-md rounded-2xl shadow-2xl p-6"
                    :class="isDarkMode ? 'bg-slate-900' : 'bg-white'">
                    <h2 class="text-xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                        Create New Board
                    </h2>
                    <input v-model="newBoardName" type="text" placeholder="Board name..."
                        class="w-full px-4 py-3 rounded-xl text-base transition-all focus:outline-none focus:ring-2 mb-4"
                        :class="isDarkMode
                            ? 'bg-white/5 text-white placeholder-slate-500 focus:ring-cyan-500/50'
                            : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-blue-500/50'"
                        @keyup.enter="createBoard" />
                    <div class="flex gap-3">
                        <button @click="showCreateModal = false"
                            class="flex-1 py-3 rounded-xl font-medium transition-colors"
                            :class="isDarkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
                            Cancel
                        </button>
                        <button @click="createBoard" :disabled="!newBoardName.trim() || creating"
                            class="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            {{ creating ? 'Creating...' : 'Create' }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Edit Modal -->
        <Transition name="modal">
            <div v-if="editingBoardId" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancelEdit" />
                <div class="relative w-full max-w-md rounded-2xl shadow-2xl p-6"
                    :class="isDarkMode ? 'bg-slate-900' : 'bg-white'">
                    <h2 class="text-xl font-bold mb-4" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                        Edit Board
                    </h2>
                    <input v-model="editingBoardName" type="text" placeholder="Board name..."
                        class="w-full px-4 py-3 rounded-xl text-base transition-all focus:outline-none focus:ring-2 mb-4"
                        :class="isDarkMode
                            ? 'bg-white/5 text-white placeholder-slate-500 focus:ring-cyan-500/50'
                            : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-blue-500/50'"
                        @keyup.enter="saveEdit" />

                    <!-- Color Picker -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium mb-2"
                            :class="isDarkMode ? 'text-slate-400' : 'text-slate-600'">
                            Board Color
                        </label>
                        <div class="grid grid-cols-8 gap-2">
                            <button v-for="option in colorOptions" :key="option.color"
                                @click="editingBoardColor = option.color"
                                class="aspect-square rounded-xl transition-all hover:brightness-110"
                                :class="editingBoardColor === option.color ? 'ring-[3px] ring-inset ring-white/70' : ''"
                                :style="{ backgroundColor: option.color }" :title="option.name" />
                        </div>
                    </div>

                    <div class="flex gap-3">
                        <button @click="cancelEdit" class="flex-1 py-3 rounded-xl font-medium transition-colors"
                            :class="isDarkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
                            Cancel
                        </button>
                        <button @click="saveEdit" :disabled="!editingBoardName.trim()"
                            class="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Delete Confirmation Modal -->
        <Transition name="modal">
            <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showDeleteModal = false" />
                <div class="relative w-full max-w-md rounded-2xl shadow-2xl p-6"
                    :class="isDarkMode ? 'bg-slate-900' : 'bg-white'">
                    <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 class="text-xl font-bold text-center mb-2"
                        :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                        Delete Board?
                    </h2>
                    <p class="text-center mb-6" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">
                        "{{ boardToDelete?.title }}" and all its lists and cards will be permanently deleted.
                    </p>
                    <div class="flex gap-3">
                        <button @click="showDeleteModal = false"
                            class="flex-1 py-3 rounded-xl font-medium transition-colors"
                            :class="isDarkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
                            Cancel
                        </button>
                        <button @click="deleteBoard"
                            class="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 transition-all">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Leave Confirmation Modal -->
        <Transition name="modal">
            <div v-if="showLeaveModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showLeaveModal = false" />
                <div class="relative w-full max-w-md rounded-2xl shadow-2xl p-6"
                    :class="isDarkMode ? 'bg-slate-900' : 'bg-white'">
                    <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </div>
                    <h2 class="text-xl font-bold text-center mb-2"
                        :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                        Leave Board?
                    </h2>
                    <p class="text-center mb-6" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">
                        Are you sure you want to leave "{{ boardToLeave?.title }}"? You will lose access to this board.
                    </p>
                    <div class="flex gap-3">
                        <button @click="showLeaveModal = false"
                            class="flex-1 py-3 rounded-xl font-medium transition-colors"
                            :class="isDarkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'">
                            Cancel
                        </button>
                        <button @click="leaveBoard"
                            class="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transition-all">
                            Leave
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from>div:last-child,
.modal-leave-to>div:last-child {
    transform: scale(0.95) translateY(10px);
}
</style>
