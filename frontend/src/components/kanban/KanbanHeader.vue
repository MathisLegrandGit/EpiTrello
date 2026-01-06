<script setup lang="ts">
import type { User } from '@/services/api'

defineProps<{
    isDarkMode: boolean
    user: User | null
}>()

const emit = defineEmits<{
    (e: 'toggle-dark-mode'): void
    (e: 'open-settings'): void
}>()
</script>

<template>
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
            <button @click="emit('open-settings')"
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
            <button @click="emit('toggle-dark-mode')"
                :class="isDarkMode ? 'bg-slate-700/80 shadow-inner' : 'bg-slate-200/80'"
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
</template>
