<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { friendsApi } from '@/services/api'
import type { UserProfile, Friendship, FriendRequest, User } from '@/services/api'

const props = defineProps<{
    isOpen: boolean
    isDarkMode: boolean
    user: User | null
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'refresh-notifications'): void
}>()

// State
const searchQuery = ref('')
const searchResults = ref<UserProfile[]>([])
const friends = ref<Friendship[]>([])
const incomingRequests = ref<FriendRequest[]>([])
const loading = ref(false)
const searchLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const pendingRequestUserIds = ref<Set<string>>(new Set())
const searchInputRef = ref<HTMLInputElement | null>(null)

// Computed
const userId = computed(() => props.user?.id)
const hasRequests = computed(() => incomingRequests.value.length > 0)

// Watch for modal open
watch(() => props.isOpen, async (isOpen) => {
    if (isOpen && userId.value) {
        await loadData()
        nextTick(() => searchInputRef.value?.focus())
    } else {
        searchQuery.value = ''
        searchResults.value = []
        error.value = ''
        successMessage.value = ''
    }
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

async function loadData() {
    if (!userId.value) return
    loading.value = true
    try {
        const [friendsList, requests, outgoing] = await Promise.all([
            friendsApi.getFriends(userId.value),
            friendsApi.getIncomingRequests(userId.value),
            friendsApi.getOutgoingRequests(userId.value),
        ])
        friends.value = friendsList
        incomingRequests.value = requests
        pendingRequestUserIds.value = new Set(outgoing.map(r => r.to_user_id))
    } catch (err) {
        console.error('Error loading data:', err)
    } finally {
        loading.value = false
    }
}

async function handleSearch() {
    if (!searchQuery.value.trim() || !userId.value) return
    searchLoading.value = true
    error.value = ''
    try {
        searchResults.value = await friendsApi.search(searchQuery.value, userId.value)
    } catch (err) {
        error.value = 'Search failed'
        console.error(err)
    } finally {
        searchLoading.value = false
    }
}

async function sendRequest(toUserId: string) {
    if (!userId.value) return
    try {
        await friendsApi.sendRequest(userId.value, toUserId)
        pendingRequestUserIds.value.add(toUserId)
        showSuccess('Request sent!')
    } catch (err: unknown) {
        error.value = err instanceof Error ? err.message : 'Failed to send request'
    }
}

async function acceptRequest(requestId: string) {
    try {
        await friendsApi.respondToRequest(requestId, 'accepted')
        await loadData()
        emit('refresh-notifications')
        showSuccess('Friend added!')
    } catch (err) {
        error.value = 'Failed to accept'
        console.error(err)
    }
}

async function rejectRequest(requestId: string) {
    try {
        await friendsApi.respondToRequest(requestId, 'rejected')
        await loadData()
        emit('refresh-notifications')
    } catch (err) {
        error.value = 'Failed to decline'
        console.error(err)
    }
}

async function removeFriend(friendId: string) {
    if (!userId.value) return
    try {
        await friendsApi.removeFriend(userId.value, friendId)
        await loadData()
        showSuccess('Removed')
    } catch (err) {
        error.value = 'Failed to remove'
        console.error(err)
    }
}

function showSuccess(msg: string) {
    successMessage.value = msg
    setTimeout(() => successMessage.value = '', 2500)
}

function isFriend(id: string): boolean {
    return friends.value.some(f => f.friend_id === id)
}

function isRequestPending(id: string): boolean {
    return pendingRequestUserIds.value.has(id)
}

function getInitials(profile: UserProfile | undefined): string {
    if (!profile) return '?'
    if (profile.full_name) {
        return profile.full_name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)
    }
    const username = profile.username || '?'
    return username.charAt(0).toUpperCase() || '?'
}

function getDisplayName(profile: UserProfile | undefined): string {
    if (!profile) return 'Unknown'
    return profile.full_name || profile.username || 'Unknown'
}
</script>

<template>
    <Transition name="modal">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')" />

            <!-- Panel -->
            <div class="relative w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
                :class="isDarkMode ? 'bg-slate-900' : 'bg-white'">

                <!-- Header -->
                <div class="relative px-6 pt-6 pb-4">
                    <!-- Close Button -->
                    <button @click="$emit('close')" class="absolute top-4 right-4 p-2 rounded-xl transition-colors"
                        :class="isDarkMode ? 'text-slate-500 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <!-- Title -->
                    <h2 class="text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                        People
                    </h2>

                    <!-- Search Input -->
                    <div class="relative mt-4">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
                            :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input ref="searchInputRef" v-model="searchQuery" type="text"
                            placeholder="Search by name or username..."
                            class="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
                            :class="isDarkMode
                                ? 'bg-white/5 text-white placeholder-slate-500 focus:ring-cyan-500/50 focus:bg-white/10'
                                : 'bg-slate-100 text-slate-900 placeholder-slate-400 focus:ring-blue-500/50'" />
                        <div v-if="searchLoading" class="absolute right-3 top-1/2 -translate-y-1/2">
                            <div class="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                                :class="isDarkMode ? 'border-cyan-500' : 'border-blue-500'" />
                        </div>
                    </div>
                </div>

                <!-- Toast Message (pushes content down) -->
                <Transition name="toast">
                    <div v-if="successMessage || error" class="px-6 pb-3">
                        <div class="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2"
                            :class="successMessage ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'">
                            <svg v-if="successMessage" class="w-4 h-4 flex-shrink-0" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd" />
                            </svg>
                            <svg v-else class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clip-rule="evenodd" />
                            </svg>
                            {{ successMessage || error }}
                        </div>
                    </div>
                </Transition>

                <!-- Content -->
                <div class="px-6 pb-6 max-h-[60vh] overflow-y-auto space-y-6"
                    :class="isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'">

                    <!-- Search Results -->
                    <div v-if="searchQuery.trim() && searchResults.length > 0">
                        <div class="space-y-2">
                            <div v-for="user in searchResults" :key="user.id"
                                class="flex items-center gap-3 p-3 rounded-xl transition-all"
                                :class="isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'">

                                <!-- Avatar -->
                                <div class="relative flex-shrink-0">
                                    <img v-if="user.avatar_url" :src="user.avatar_url"
                                        class="w-11 h-11 rounded-full object-cover ring-2 ring-offset-2"
                                        :class="isDarkMode ? 'ring-slate-700 ring-offset-slate-900' : 'ring-slate-200 ring-offset-white'" />
                                    <div v-else
                                        class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                                        {{ getInitials(user) }}
                                    </div>
                                </div>

                                <!-- Info -->
                                <div class="flex-1 min-w-0">
                                    <p class="font-medium truncate"
                                        :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                                        {{ getDisplayName(user) }}
                                    </p>
                                    <p class="text-xs truncate"
                                        :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
                                        @{{ user.username }}
                                    </p>
                                </div>

                                <!-- Action -->
                                <button v-if="isFriend(user.id)"
                                    class="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-500"
                                    disabled>
                                    ✓ Friend
                                </button>
                                <button v-else-if="isRequestPending(user.id)"
                                    class="px-3 py-1.5 rounded-lg text-xs font-medium"
                                    :class="isDarkMode ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-500'"
                                    disabled>
                                    Pending
                                </button>
                                <button v-else @click="sendRequest(user.id)"
                                    class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 transition-opacity">
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- No Search Results -->
                    <div v-else-if="searchQuery.trim() && !searchLoading && searchResults.length === 0"
                        class="py-8 text-center">
                        <p :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'" class="text-sm">
                            No users found for "{{ searchQuery }}"
                        </p>
                    </div>

                    <!-- Default View (no search active) -->
                    <template v-else-if="!searchQuery.trim()">

                        <!-- Pending Requests Section -->
                        <div v-if="hasRequests">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-xs font-semibold uppercase tracking-wider"
                                    :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
                                    Requests
                                </span>
                                <span
                                    class="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                                    {{ incomingRequests.length }}
                                </span>
                            </div>

                            <div class="space-y-2">
                                <div v-for="request in incomingRequests" :key="request.id"
                                    class="flex items-center gap-3 p-3 rounded-xl"
                                    :class="isDarkMode ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20' : 'bg-blue-50 border border-blue-100'">

                                    <!-- Avatar -->
                                    <div class="relative flex-shrink-0">
                                        <img v-if="request.from_user?.avatar_url" :src="request.from_user.avatar_url"
                                            class="w-11 h-11 rounded-full object-cover" />
                                        <div v-else
                                            class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                                            {{ getInitials(request.from_user) }}
                                        </div>
                                    </div>

                                    <!-- Info -->
                                    <div class="flex-1 min-w-0">
                                        <p class="font-medium truncate"
                                            :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                                            {{ getDisplayName(request.from_user) }}
                                        </p>
                                        <p class="text-xs" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">
                                            wants to connect
                                        </p>
                                    </div>

                                    <!-- Actions -->
                                    <div class="flex gap-2">
                                        <button @click="acceptRequest(request.id)"
                                            class="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90 transition-opacity">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                    d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                        <button @click="rejectRequest(request.id)"
                                            class="p-2 rounded-lg transition-colors"
                                            :class="isDarkMode ? 'bg-white/10 text-slate-400 hover:text-red-400 hover:bg-red-500/20' : 'bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50'">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                                                    d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Friends Section -->
                        <div>
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-xs font-semibold uppercase tracking-wider"
                                    :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
                                    Friends
                                </span>
                                <span v-if="friends.length > 0" class="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                                    :class="isDarkMode ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-500'">
                                    {{ friends.length }}
                                </span>
                            </div>

                            <div v-if="loading" class="py-12 flex justify-center">
                                <div class="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                                    :class="isDarkMode ? 'border-cyan-500' : 'border-blue-500'" />
                            </div>

                            <div v-else-if="friends.length === 0" class="py-12 text-center">
                                <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                    :class="isDarkMode ? 'bg-white/5' : 'bg-slate-100'">
                                    <svg class="w-8 h-8" :class="isDarkMode ? 'text-slate-600' : 'text-slate-300'"
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p class="font-medium mb-1" :class="isDarkMode ? 'text-slate-300' : 'text-slate-700'">
                                    No friends yet
                                </p>
                                <p class="text-sm" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
                                    Search above to find people
                                </p>
                            </div>

                            <div v-else class="space-y-2">
                                <div v-for="friendship in friends" :key="friendship.id"
                                    class="group flex items-center gap-3 p-3 rounded-xl transition-all"
                                    :class="isDarkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'">

                                    <!-- Avatar -->
                                    <div class="relative flex-shrink-0">
                                        <img v-if="friendship.friend?.avatar_url" :src="friendship.friend.avatar_url"
                                            class="w-11 h-11 rounded-full object-cover ring-2 ring-offset-2"
                                            :class="isDarkMode ? 'ring-slate-700 ring-offset-slate-900' : 'ring-slate-200 ring-offset-white'" />
                                        <div v-else
                                            class="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                                            {{ getInitials(friendship.friend) }}
                                        </div>
                                        <!-- Online indicator (placeholder) -->
                                        <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 bg-emerald-500"
                                            :class="isDarkMode ? 'border-slate-900' : 'border-white'" />
                                    </div>

                                    <!-- Info -->
                                    <div class="flex-1 min-w-0">
                                        <p class="font-medium truncate"
                                            :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                                            {{ getDisplayName(friendship.friend) }}
                                        </p>
                                        <p class="text-xs truncate"
                                            :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'">
                                            @{{ friendship.friend?.username }}
                                        </p>
                                    </div>

                                    <!-- Remove Button (on hover) -->
                                    <button @click="removeFriend(friendship.friend_id)"
                                        class="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all"
                                        :class="isDarkMode ? 'text-slate-500 hover:text-red-400 hover:bg-red-500/20' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
/* Modal transitions */
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

/* Toast transitions */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}

/* Custom scrollbar */
.scrollbar-dark::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-dark::-webkit-scrollbar-track {
    background: transparent;
}

.scrollbar-dark::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
}

.scrollbar-dark::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
}

.scrollbar-light::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-light::-webkit-scrollbar-track {
    background: transparent;
}

.scrollbar-light::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

.scrollbar-light::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.2);
}
</style>
