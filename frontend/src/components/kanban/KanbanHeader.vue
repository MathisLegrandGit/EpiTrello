<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { User } from '@/services/api'
import BrandLogo from '@/components/BrandLogo.vue'
import UserAvatar from '@/components/ui/UserAvatar.vue'

defineProps<{
    isDarkMode: boolean
    user: User | null
    notificationCount: number
    boardTitle?: string
    showBackButton?: boolean
}>()

const emit = defineEmits<{
    (e: 'toggle-dark-mode'): void
    (e: 'open-settings'): void
    (e: 'open-board-collaborators'): void
    (e: 'open-notifications'): void
    (e: 'go-to-dashboard'): void
}>()

// Mobile menu state
const isMobileMenuOpen = ref(false)
const isMobile = ref(false)

function updateIsMobile() {
    isMobile.value = window.matchMedia('(max-width: 640px)').matches
}

function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
    isMobileMenuOpen.value = false
}

function handleMobileAction(action: () => void) {
    action()
    closeMobileMenu()
}

onMounted(() => {
    updateIsMobile()
    window.addEventListener('resize', updateIsMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateIsMobile)
})
</script>

<template>
    <header
        class="w-full px-8 py-5 sm:py-5 flex items-center justify-between backdrop-blur-xl sticky top-0 z-40 transition-colors duration-300"
        :class="isDarkMode ? 'bg-slate-950/80 border-b border-white/5' : 'bg-slate-200 border-b border-slate-300'">

        <!-- Mobile Layout: Logo + Title + Controls -->
        <template v-if="isMobile">
            <!-- Logo (clickable to dashboard when in a board) -->
            <button v-if="showBackButton" @click="emit('go-to-dashboard')"
                class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
                :class="isDarkMode ? 'hover:bg-white/10' : 'hover:bg-slate-400/30'">
                <img src="/EpiTrello%20Logo.png" alt="EpiTrello" class="w-8 h-8 rounded-lg" />
            </button>
            <!-- Logo (non-clickable when not in a board) -->
            <div v-else class="h-10 w-10 rounded-xl flex items-center justify-center shrink-0">
                <img src="/EpiTrello%20Logo.png" alt="EpiTrello" class="w-8 h-8 rounded-lg" />
            </div>

            <!-- Board Title (left-aligned, grows to fill space, truncates) -->
            <h1 v-if="boardTitle" class="flex-1 text-2xl font-semibold truncate pl-2 pr-3"
                :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                {{ boardTitle }}
            </h1>
            <h1 v-else class="flex-1 text-2xl font-semibold truncate pl-2 pr-3"
                :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                EpiTrello
            </h1>

            <!-- Dashboard: Direct Controls (No Hamburger) -->
            <div v-if="!boardTitle" class="flex items-center gap-2">
                <!-- Notifications -->
                <button @click="emit('open-notifications')"
                    :class="isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-amber-400' : 'bg-slate-300 text-slate-500 hover:text-amber-600'"
                    class="relative h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <span v-if="notificationCount > 0"
                        class="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg">
                        {{ notificationCount > 9 ? '9+' : notificationCount }}
                    </span>
                </button>

                <!-- Settings -->
                <button @click="emit('open-settings')"
                    :class="isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-300 text-slate-500 hover:text-blue-500'"
                    class="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 group focus:outline-none overflow-hidden">
                    <UserAvatar
                        v-if="user?.user_metadata?.avatar_url || user?.user_metadata?.full_name || user?.user_metadata?.username"
                        :avatarUrl="user?.user_metadata?.avatar_url"
                        :name="user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email"
                        size="md" />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            <!-- Board: Hamburger Menu (only when in board) -->
            <div v-else class="relative shrink-0">
                <button @click="toggleMobileMenu"
                    :class="isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-300 text-slate-500 hover:text-slate-900'"
                    class="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-95 focus:outline-none relative">
                    <!-- Hamburger icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <!-- Notification badge on hamburger -->
                    <span v-if="notificationCount > 0"
                        class="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg">
                        {{ notificationCount > 9 ? '9+' : notificationCount }}
                    </span>
                </button>

                <!-- Mobile Dropdown Menu -->
                <Transition enter-active-class="transition ease-out duration-200"
                    enter-from-class="opacity-0 scale-95 -translate-y-2"
                    enter-to-class="opacity-100 scale-100 translate-y-0"
                    leave-active-class="transition ease-in duration-150"
                    leave-from-class="opacity-100 scale-100 translate-y-0"
                    leave-to-class="opacity-0 scale-95 -translate-y-2">
                    <div v-if="isMobileMenuOpen"
                        class="absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden z-50"
                        :class="isDarkMode ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'">

                        <!-- Dashboard -->
                        <button v-if="showBackButton" @click="handleMobileAction(() => emit('go-to-dashboard'))"
                            class="w-full px-4 py-3 flex items-center gap-3 transition-colors"
                            :class="isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span class="font-medium">Dashboard</span>
                        </button>

                        <!-- Divider (only if dashboard is shown) -->
                        <div v-if="showBackButton" class="h-px" :class="isDarkMode ? 'bg-white/10' : 'bg-slate-200'" />

                        <!-- Collaborators -->
                        <button v-if="boardTitle" @click="handleMobileAction(() => emit('open-board-collaborators'))"
                            class="w-full px-4 py-3 flex items-center gap-3 transition-colors"
                            :class="isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <span class="font-medium">Collaborators</span>
                        </button>

                        <!-- Notifications -->
                        <button @click="handleMobileAction(() => emit('open-notifications'))"
                            class="w-full px-4 py-3 flex items-center gap-3 transition-colors"
                            :class="isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                            </svg>
                            <span class="font-medium">Notifications</span>
                            <span v-if="notificationCount > 0"
                                class="ml-auto min-w-[20px] h-[20px] px-1.5 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {{ notificationCount > 9 ? '9+' : notificationCount }}
                            </span>
                        </button>

                        <!-- Divider -->
                        <div class="h-px" :class="isDarkMode ? 'bg-white/10' : 'bg-slate-200'" />

                        <!-- Settings / Profile -->
                        <button @click="handleMobileAction(() => emit('open-settings'))"
                            class="w-full px-4 py-3 flex items-center gap-3 transition-colors"
                            :class="isDarkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'">
                            <div class="h-5 w-5 rounded-full overflow-hidden flex items-center justify-center"
                                :class="isDarkMode ? 'bg-slate-600' : 'bg-slate-300'">
                                <UserAvatar
                                    v-if="user?.user_metadata?.avatar_url || user?.user_metadata?.full_name || user?.user_metadata?.username"
                                    :avatarUrl="user?.user_metadata?.avatar_url"
                                    :name="user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email"
                                    size="sm" />
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <span class="font-medium">Settings</span>
                        </button>
                    </div>
                </Transition>
            </div>
        </template>

        <!-- Desktop Layout: Original design -->
        <template v-else>
            <!-- Brand & Board Title -->
            <div class="flex items-center gap-4">
                <!-- Back to Dashboard (only show if showBackButton is true) -->
                <template v-if="showBackButton">
                    <button @click="emit('go-to-dashboard')" class="flex items-center gap-3 transition-all group"
                        :class="isDarkMode ? 'hover:text-cyan-400' : 'hover:text-cyan-600'">
                        <div class="p-2 rounded-xl transition-colors"
                            :class="isDarkMode ? 'bg-white/5 group-hover:bg-cyan-500/20' : 'bg-slate-100 group-hover:bg-cyan-100'">
                            <svg class="w-5 h-5"
                                :class="isDarkMode ? 'text-slate-400 group-hover:text-cyan-400' : 'text-slate-500 group-hover:text-cyan-600'"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </div>
                    </button>

                    <!-- Divider -->
                    <div class="h-8 w-px" :class="isDarkMode ? 'bg-white/10' : 'bg-slate-300'" />
                </template>

                <!-- Brand Logo -->
                <BrandLogo size="md" :isDarkMode="isDarkMode" />

                <!-- Board Title -->
                <div v-if="boardTitle" class="flex items-center gap-4">
                    <div class="h-6 w-px" :class="isDarkMode ? 'bg-white/10' : 'bg-slate-300'" />
                    <h1 class="text-lg font-semibold" :class="isDarkMode ? 'text-white' : 'text-slate-900'">
                        {{ boardTitle }}
                    </h1>
                </div>
            </div>

            <!-- Header Controls -->
            <div class="flex items-center gap-3">
                <!-- Board Collaborators Button (only when viewing a board) -->
                <button v-if="boardTitle" @click="emit('open-board-collaborators')"
                    :class="isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-cyan-400' : 'bg-slate-300 text-slate-500 hover:text-cyan-600'"
                    class="h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 focus:outline-none"
                    title="Board Collaborators">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                </button>

                <!-- Notifications Button -->
                <button @click="emit('open-notifications')"
                    :class="isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-amber-400' : 'bg-slate-300 text-slate-500 hover:text-amber-600'"
                    class="relative h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 focus:outline-none"
                    title="Notifications">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    <!-- Badge -->
                    <span v-if="notificationCount > 0"
                        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-linear-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                        {{ notificationCount > 9 ? '9+' : notificationCount }}
                    </span>
                </button>

                <!-- Settings Button -->
                <button @click="emit('open-settings')"
                    :class="isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-300 text-slate-500 hover:text-blue-500'"
                    class="h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 group focus:outline-none overflow-hidden">
                    <UserAvatar
                        v-if="user?.user_metadata?.avatar_url || user?.user_metadata?.full_name || user?.user_metadata?.username"
                        :avatarUrl="user?.user_metadata?.avatar_url"
                        :name="user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email"
                        size="lg" />
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
        </template>
    </header>

    <!-- Backdrop for mobile menu (click outside to close) -->
    <div v-if="isMobileMenuOpen && isMobile" class="fixed inset-0 z-30" @click="closeMobileMenu" />
</template>
