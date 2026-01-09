<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { notificationsApi, friendsApi } from '@/services/api'
import type { Notification, User, UserProfile } from '@/services/api'

const props = defineProps<{
    isOpen: boolean
    isDarkMode: boolean
    user: User | null
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'update-count', count: number): void
    (e: 'open-collaborators'): void
}>()

const notifications = ref<Notification[]>([])
const loading = ref(false)
const userProfiles = ref<Map<string, UserProfile>>(new Map())

const userId = computed(() => props.user?.id)

// Load notifications and user profiles when panel opens
watch(() => props.isOpen, async (isOpen) => {
    if (isOpen && userId.value) {
        await loadNotifications()
    }
})

async function loadNotifications() {
    if (!userId.value) return
    loading.value = true
    try {
        notifications.value = await notificationsApi.getAll(userId.value)

        // Load user profiles for notifications
        const userIds = new Set<string>()
        notifications.value.forEach(n => {
            if (n.data.from_user_id) userIds.add(n.data.from_user_id as string)
            if (n.data.friend_id) userIds.add(n.data.friend_id as string)
        })

        if (userIds.size > 0) {
            // Fetch each user profile
            for (const id of userIds) {
                if (!userProfiles.value.has(id)) {
                    try {
                        const results = await friendsApi.search(id, userId.value)
                        const found = results.find(u => u.id === id)
                        if (found) userProfiles.value.set(id, found)
                    } catch {
                        // Ignore errors for individual profile fetches
                    }
                }
            }
        }

        emit('update-count', notifications.value.filter(n => !n.read).length)
    } catch (err) {
        console.error('Error loading notifications:', err)
    } finally {
        loading.value = false
    }
}

async function markAsRead(notificationId: string) {
    try {
        await notificationsApi.markAsRead(notificationId)
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification) notification.read = true
        emit('update-count', notifications.value.filter(n => !n.read).length)
    } catch (err) {
        console.error('Error marking as read:', err)
    }
}

async function markAllAsRead() {
    if (!userId.value) return
    try {
        await notificationsApi.markAllAsRead(userId.value)
        notifications.value.forEach(n => n.read = true)
        emit('update-count', 0)
    } catch (err) {
        console.error('Error marking all as read:', err)
    }
}

async function deleteNotification(notificationId: string) {
    try {
        await notificationsApi.delete(notificationId)
        notifications.value = notifications.value.filter(n => n.id !== notificationId)
        emit('update-count', notifications.value.filter(n => !n.read).length)
    } catch (err) {
        console.error('Error deleting notification:', err)
    }
}

function getNotificationMessage(notification: Notification): string {
    const fromUserId = notification.data.from_user_id as string
    const friendId = notification.data.friend_id as string
    const profile = userProfiles.value.get(fromUserId || friendId)
    const name = profile?.full_name || profile?.username || 'Someone'

    switch (notification.type) {
        case 'friend_request':
            return `${name} sent you a friend request`
        case 'friend_accepted':
            return `${name} accepted your friend request`
        case 'friend_rejected':
            return `${name} declined your friend request`
        default:
            return 'New notification'
    }
}

function getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}

function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
        markAsRead(notification.id)
    }
    if (notification.type === 'friend_request') {
        emit('close')
        emit('open-collaborators')
    }
}
</script>

<template>
    <div v-if="isOpen" class="absolute right-0 top-full mt-2 w-80 z-50">
        <!-- Panel -->
        <div :class="isDarkMode ? 'bg-slate-900/95 border-white/10' : 'bg-white border-slate-200'"
            class="border rounded-xl overflow-hidden shadow-2xl animate-fade-in">

            <!-- Header -->
            <div class="p-4 flex items-center justify-between border-b"
                :class="isDarkMode ? 'border-slate-700/50' : 'border-slate-200'">
                <h3 :class="isDarkMode ? 'text-white' : 'text-slate-900'" class="font-semibold">
                    Notifications
                </h3>
                <button v-if="notifications.some(n => !n.read)" @click="markAllAsRead"
                    class="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                    Mark all read
                </button>
            </div>

            <!-- Content -->
            <div class="max-h-96 overflow-y-auto">
                <div v-if="loading" class="flex justify-center py-8">
                    <div class="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>

                <div v-else-if="notifications.length === 0" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'"
                    class="text-center py-8 text-sm">
                    No notifications
                </div>

                <div v-else>
                    <div v-for="notification in notifications" :key="notification.id"
                        @click="handleNotificationClick(notification)" :class="[
                            isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50',
                            !notification.read && (isDarkMode ? 'bg-slate-800/30' : 'bg-blue-50/50')
                        ]" class="p-4 border-b last:border-b-0 cursor-pointer transition-colors"
                        :style="{ borderColor: isDarkMode ? 'rgb(51 65 85 / 0.5)' : 'rgb(226 232 240)' }">
                        <div class="flex items-start gap-3">
                            <!-- Icon -->
                            <div :class="notification.type === 'friend_request' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'"
                                class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg v-if="notification.type === 'friend_request'" xmlns="http://www.w3.org/2000/svg"
                                    class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                            </div>

                            <!-- Content -->
                            <div class="flex-1 min-w-0">
                                <p :class="isDarkMode ? 'text-slate-200' : 'text-slate-700'" class="text-sm">
                                    {{ getNotificationMessage(notification) }}
                                </p>
                                <p :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'" class="text-xs mt-1">
                                    {{ getTimeAgo(notification.created_at) }}
                                </p>
                            </div>

                            <!-- Unread dot -->
                            <div v-if="!notification.read"
                                class="w-2 h-2 rounded-full bg-cyan-500 flex-shrink-0 mt-1.5" />

                            <!-- Delete button -->
                            <button @click.stop="deleteNotification(notification.id)"
                                :class="isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'"
                                class="p-1 rounded transition-colors flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Backdrop for closing -->
        <div class="fixed inset-0 -z-10" @click="$emit('close')" />
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
