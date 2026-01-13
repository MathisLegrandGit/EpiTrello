<script setup lang="ts">
import type { User } from '@/services/api'
import BrandLogo from '@/components/BrandLogo.vue'

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
    (e: 'open-collaborators'): void
    (e: 'open-board-collaborators'): void
    (e: 'open-notifications'): void
    (e: 'go-to-dashboard'): void
}>()
</script>

<template>
    <header
        class="w-full px-8 py-5 flex items-center justify-between backdrop-blur-xl sticky top-0 z-40 transition-colors duration-300"
        :class="isDarkMode ? 'bg-slate-950/80 border-b border-white/5' : 'bg-slate-200 border-b border-slate-300'">

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
            <!-- Board Share Button (only when viewing a board) -->
            <button v-if="boardTitle" @click="emit('open-board-collaborators')"
                :class="isDarkMode ? 'bg-slate-800 text-emerald-400 hover:text-emerald-300' : 'bg-slate-300 text-emerald-600 hover:text-emerald-500'"
                class="h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 focus:outline-none"
                title="Share Board">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
            </button>

            <!-- Friends Button -->
            <button @click="emit('open-collaborators')"
                :class="isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-cyan-400' : 'bg-slate-300 text-slate-500 hover:text-cyan-600'"
                class="h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 focus:outline-none"
                title="Friends">
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
                    class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg">
                    {{ notificationCount > 9 ? '9+' : notificationCount }}
                </span>
            </button>

            <!-- Settings Button -->
            <button @click="emit('open-settings')"
                :class="isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-300 text-slate-500 hover:text-blue-500'"
                class="h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-95 group focus:outline-none">
                <div v-if="user?.user_metadata?.avatar_url"
                    class="h-full w-full rounded-xl overflow-hidden ring-0 group-hover:opacity-90 transition-all p-0.5">
                    <img :src="user.user_metadata.avatar_url" alt="User"
                        class="h-full w-full object-cover rounded-[10px]" />
                </div>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>
        </div>
    </header>
</template>
