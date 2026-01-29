<template>
    <Transition name="modal">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="close" />

            <!-- Modal -->
            <div class="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                :class="isDarkMode ? 'bg-slate-900' : 'bg-white'">

                <!-- Header -->
                <div class="px-6 py-4 border-b" :class="isDarkMode ? 'border-white/10' : 'border-slate-200'">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="p-2 rounded-xl" :class="isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-100'">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" :class="isDarkMode ? 'text-cyan-400' : 'text-cyan-600'"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                            </div>
                            <h2 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                                Board Collaborators
                            </h2>
                        </div>
                        <button @click="close" class="p-2 rounded-lg transition-colors"
                            :class="isDarkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-6 max-h-[70vh] overflow-y-auto">
                    <!-- Add Collaborator Section (only for owners) -->
                    <div v-if="isOwner" class="mb-6">
                        <label class="block text-sm font-medium mb-2"
                            :class="isDarkMode ? 'text-slate-400' : 'text-slate-600'">
                            Add Collaborators
                        </label>
                        <div class="relative">
                            <input ref="searchInputRef" v-model="searchQuery" type="text"
                                placeholder="Search by username or name..."
                                class="w-full px-4 py-3 rounded-xl text-base transition-all focus:outline-none focus:ring-2"
                                :class="isDarkMode
                                    ? 'bg-white/5 text-white placeholder-slate-500 focus:ring-blue-500/50 border border-white/10'
                                    : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-blue-500/50'" />
                            <div v-if="searchLoading"
                                class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>

                        <!-- Search Results -->
                        <div v-if="searchResults.length > 0" class="mt-3 space-y-2">
                            <div v-for="user in searchResults" :key="user.id"
                                class="flex items-center justify-between p-3 rounded-xl transition-colors"
                                :class="isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'">
                                <div class="flex items-center gap-3">
                                    <UserAvatar :avatarUrl="user.avatar_url" :name="user.full_name || user.username"
                                        size="lg" />
                                    <div>
                                        <p class="font-medium" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                                            {{ user.full_name || user.username }}
                                        </p>
                                        <p class="text-xs" :class="isDarkMode ? 'text-slate-500' : 'text-slate-500'">
                                            @{{ user.username }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <!-- Role Dropdown -->
                                    <div class="relative" @click.stop>
                                        <button @click="toggleRoleDropdown(user.id, $event)"
                                            class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                                            :class="(selectedRoles[user.id] || 'editor') === 'editor'
                                                ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/25 hover:shadow-emerald-500/40'
                                                : 'bg-linear-to-r from-sky-500 to-sky-600 text-white shadow-sm shadow-sky-500/25 hover:shadow-sky-500/40'">
                                            <span class="text-white/80">Role:</span>
                                            <span class="font-semibold">{{ capitalize(selectedRoles[user.id] ||
                                                'editor') }}</span>
                                            <svg class="w-3 h-3 text-white/70" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                    <button @click="addCollaborator(user.id)" :disabled="adding === user.id"
                                        class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50">
                                        {{ adding === user.id ? 'Adding...' : 'Add' }}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p v-else-if="searchQuery && !searchLoading"
                            class="mt-3 text-sm text-slate-500 text-center py-4">
                            No users found matching "{{ searchQuery }}"
                        </p>
                    </div>

                    <!-- Divider -->
                    <div v-if="isOwner" class="border-t mb-6"
                        :class="isDarkMode ? 'border-white/10' : 'border-slate-200'" />

                    <!-- Current Collaborators -->
                    <div>
                        <label class="block text-sm font-medium mb-3"
                            :class="isDarkMode ? 'text-slate-400' : 'text-slate-600'">
                            Current Collaborators ({{ allCollaborators.length }})
                        </label>

                        <div v-if="loading" class="flex justify-center py-8">
                            <div
                                class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>

                        <div v-else-if="allCollaborators.length === 0" class="text-center py-8">
                            <div class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                                :class="isDarkMode ? 'bg-white/5' : 'bg-slate-100'">
                                <svg class="w-8 h-8" :class="isDarkMode ? 'text-slate-600' : 'text-slate-400'"
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <p :class="isDarkMode ? 'text-slate-500' : 'text-slate-500'">
                                No collaborators yet
                            </p>
                            <p v-if="isOwner" class="text-sm mt-1"
                                :class="isDarkMode ? 'text-slate-600' : 'text-slate-400'">
                                Search for users above to add collaborators
                            </p>
                        </div>

                        <div v-else class="space-y-2">
                            <div v-for="collab in allCollaborators" :key="collab.id || collab.user_id"
                                class="flex items-center justify-between p-3 rounded-xl"
                                :class="isDarkMode ? 'bg-white/5' : 'bg-slate-50'">
                                <div class="flex items-center gap-3">
                                    <UserAvatar :avatarUrl="collab.user?.avatar_url"
                                        :name="collab.user?.full_name || collab.user?.username" size="lg" />
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <p class="font-medium"
                                                :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                                                {{ collab.user?.full_name || collab.user?.username }}
                                            </p>
                                            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                                :class="collab.role === 'owner'
                                                    ? (isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700')
                                                    : (isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')">
                                                {{ capitalize(collab.role) }}
                                            </span>
                                            <span v-if="collab.status === 'pending'"
                                                class="px-2 py-0.5 rounded-full text-xs font-medium"
                                                :class="isDarkMode ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-100 text-amber-700'">
                                                Pending
                                            </span>
                                        </div>
                                        <p class="text-xs" :class="isDarkMode ? 'text-slate-500' : 'text-slate-500'">
                                            @{{ collab.user?.username }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center gap-2">
                                    <!-- Role Dropdown for owner (only on non-owner collaborators) -->
                                    <div v-if="isOwner && collab.role !== 'owner'" class="relative" @click.stop>
                                        <button @click="toggleCollabDropdown(collab.user_id, $event)"
                                            class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all"
                                            :class="collab.role === 'editor'
                                                ? 'bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/25 hover:shadow-emerald-500/40'
                                                : 'bg-linear-to-r from-sky-500 to-sky-600 text-white shadow-sm shadow-sky-500/25 hover:shadow-sky-500/40'">
                                            <span class="text-white/80">Role:</span>
                                            <span class="font-semibold">{{ capitalize(collab.role) }}</span>
                                            <svg class="w-3 h-3 text-white/70" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                    <button v-if="isOwner && collab.role !== 'owner'"
                                        @click="removeCollaborator(collab.user_id)"
                                        :disabled="removing === collab.user_id"
                                        class="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Transition>

    <!-- Teleported Dropdown for Role Selection (search results) -->
    <Teleport to="body">
        <div v-if="openRoleDropdown" class="fixed inset-0 z-100" @click="openRoleDropdown = null">
            <div class="fixed w-36 rounded-xl shadow-2xl overflow-hidden"
                :style="{ top: roleDropdownPos.top + 'px', left: roleDropdownPos.left + 'px' }"
                :class="isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'"
                @click.stop>
                <button @click="selectedRoles[openRoleDropdown] = 'editor'; openRoleDropdown = null"
                    class="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 transition-colors"
                    :class="[
                        (selectedRoles[openRoleDropdown] || 'editor') === 'editor' ? 'text-emerald-500' : (isDarkMode ? 'text-slate-300' : 'text-slate-700'),
                        isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                    ]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editor
                    <svg v-if="(selectedRoles[openRoleDropdown] || 'editor') === 'editor'"
                        class="w-4 h-4 ml-auto text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
                <button @click="selectedRoles[openRoleDropdown] = 'viewer'; openRoleDropdown = null"
                    class="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 transition-colors"
                    :class="[
                        selectedRoles[openRoleDropdown] === 'viewer' ? 'text-sky-500' : (isDarkMode ? 'text-slate-300' : 'text-slate-700'),
                        isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                    ]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Viewer
                    <svg v-if="selectedRoles[openRoleDropdown] === 'viewer'" class="w-4 h-4 ml-auto text-sky-500"
                        fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </Teleport>

    <!-- Teleported Dropdown for Role Change (existing collaborators) -->
    <Teleport to="body">
        <div v-if="openCollabRoleDropdown" class="fixed inset-0 z-100" @click="openCollabRoleDropdown = null">
            <div class="fixed w-36 rounded-xl shadow-2xl overflow-hidden"
                :style="{ top: collabDropdownPos.top + 'px', left: collabDropdownPos.left + 'px' }"
                :class="isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'"
                @click.stop>
                <button v-for="collab in collaborators.filter(c => c.user_id === openCollabRoleDropdown)"
                    :key="'editor-' + collab.user_id" @click="updateRole(collab.user_id, 'editor')"
                    class="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 transition-colors"
                    :class="[
                        collab.role === 'editor' ? 'text-emerald-500' : (isDarkMode ? 'text-slate-300' : 'text-slate-700'),
                        isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                    ]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editor
                    <svg v-if="collab.role === 'editor'" class="w-4 h-4 ml-auto" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
                <button v-for="collab in collaborators.filter(c => c.user_id === openCollabRoleDropdown)"
                    :key="'viewer-' + collab.user_id" @click="updateRole(collab.user_id, 'viewer')"
                    class="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 transition-colors"
                    :class="[
                        collab.role === 'viewer' ? 'text-sky-500' : (isDarkMode ? 'text-slate-300' : 'text-slate-700'),
                        isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                    ]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Viewer
                    <svg v-if="collab.role === 'viewer'" class="w-4 h-4 ml-auto" fill="currentColor"
                        viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { collaboratorsApi, usersApi, type BoardCollaborator, type UserProfile } from '@/services/api'
import UserAvatar from '@/components/ui/UserAvatar.vue'

const props = defineProps<{
    isOpen: boolean
    isDarkMode: boolean
    boardId: string
    userId: string
    isOwner: boolean
    ownerId?: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'updated'): void
}>()

const loading = ref(false)
const adding = ref<string | null>(null)
const removing = ref<string | null>(null)
const searchQuery = ref('')
const searchResults = ref<UserProfile[]>([])
const searchLoading = ref(false)
const collaborators = ref<BoardCollaborator[]>([])
const selectedRoles = ref<Record<string, string>>({})
const openRoleDropdown = ref<string | null>(null)
const openCollabRoleDropdown = ref<string | null>(null)
const collabDropdownPos = ref({ top: 0, left: 0 })
const roleDropdownPos = ref({ top: 0, left: 0 })
const ownerProfile = ref<UserProfile | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// All collaborators including owner
const allCollaborators = computed(() => {
    const list: (BoardCollaborator & { role: string })[] = []

    // Add owner first if we have their profile
    if (ownerProfile.value) {
        list.push({
            id: 'owner',
            board_id: props.boardId,
            user_id: props.ownerId || '',
            role: 'owner',
            status: 'accepted',
            created_at: '',
            user: ownerProfile.value,
        } as BoardCollaborator & { role: string })
    }

    // Add regular collaborators
    list.push(...collaborators.value)

    return list
})

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (query) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    if (!query.trim()) {
        searchResults.value = []
        return
    }
    searchTimeout = setTimeout(() => handleSearch(), 300)
})

async function handleSearch() {
    if (!searchQuery.value.trim() || !props.userId) return
    searchLoading.value = true
    try {
        const results = await usersApi.search(searchQuery.value, props.userId)
        // Filter out users who are already collaborators or the owner
        const collabIds = new Set(collaborators.value.map(c => c.user_id))
        if (props.ownerId) {
            collabIds.add(props.ownerId)
        }
        searchResults.value = results.filter(u => !collabIds.has(u.id))
    } catch (err) {
        console.error('Search failed:', err)
        searchResults.value = []
    } finally {
        searchLoading.value = false
    }
}

async function loadData() {
    if (!props.boardId || !props.userId) return
    loading.value = true
    try {
        collaborators.value = await collaboratorsApi.getCollaborators(props.boardId)

        // Fetch owner profile if we have ownerId
        if (props.ownerId) {
            const profile = await usersApi.getProfile(props.ownerId)
            ownerProfile.value = profile
        }
    } catch (err) {
        console.error('Error loading collaborators:', err)
    } finally {
        loading.value = false
    }
}

async function addCollaborator(userId: string) {
    adding.value = userId
    try {
        const role = selectedRoles.value[userId] || 'editor'
        await collaboratorsApi.addCollaborator(props.boardId, userId, props.userId, role)
        // Remove from search results
        searchResults.value = searchResults.value.filter(u => u.id !== userId)
        // Reload collaborators
        await loadData()
        emit('updated')
    } catch (err) {
        console.error('Error adding collaborator:', err)
    } finally {
        adding.value = null
    }
}

async function updateRole(userId: string, newRole: string) {
    openCollabRoleDropdown.value = null
    try {
        await collaboratorsApi.updateCollaboratorRole(props.boardId, userId, newRole, props.userId)
        // Update locally
        const collab = collaborators.value.find(c => c.user_id === userId)
        if (collab) {
            collab.role = newRole as 'editor' | 'viewer' | 'owner'
        }
        emit('updated')
    } catch (err) {
        console.error('Error updating role:', err)
    }
}

function toggleCollabDropdown(userId: string, event: MouseEvent) {
    if (openCollabRoleDropdown.value === userId) {
        openCollabRoleDropdown.value = null
    } else {
        const btn = event.currentTarget as HTMLElement
        const rect = btn.getBoundingClientRect()
        collabDropdownPos.value = {
            top: rect.bottom + 4,
            left: rect.right - 140
        }
        openCollabRoleDropdown.value = userId
    }
}

function toggleRoleDropdown(userId: string, event: MouseEvent) {
    if (openRoleDropdown.value === userId) {
        openRoleDropdown.value = null
    } else {
        const btn = event.currentTarget as HTMLElement
        const rect = btn.getBoundingClientRect()
        roleDropdownPos.value = {
            top: rect.bottom + 4,
            left: rect.right - 140
        }
        openRoleDropdown.value = userId
    }
}

async function removeCollaborator(userId: string) {
    removing.value = userId
    try {
        await collaboratorsApi.removeCollaborator(props.boardId, userId, props.userId)
        await loadData()
        emit('updated')
    } catch (err) {
        console.error('Error removing collaborator:', err)
    } finally {
        removing.value = null
    }
}

function close() {
    emit('close')
}

watch(() => props.isOpen, (isOpen) => {
    if (isOpen) {
        loadData()
        searchQuery.value = ''
        searchResults.value = []
        nextTick(() => searchInputRef.value?.focus())
    }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active>div:last-child,
.modal-leave-active>div:last-child {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from>div:last-child,
.modal-leave-to>div:last-child {
    transform: scale(0.95);
    opacity: 0;
}
</style>
