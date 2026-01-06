<script setup lang="ts">
import type { User } from '@/services/api'
import BrandLogo from '@/components/BrandLogo.vue'

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
    <header
        class="w-full px-8 py-5 flex items-center justify-between backdrop-blur-xl sticky top-0 z-40 transition-colors duration-300"
        :class="isDarkMode ? 'bg-slate-950/80 border-b border-white/5' : 'bg-slate-200 border-b border-slate-300'">

        <!-- Brand -->
        <div class="flex items-center gap-3">
            <BrandLogo size="md" :isDarkMode="isDarkMode" />
        </div>

        <!-- Header Controls -->
        <div class="flex items-center gap-4">
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

            <!-- Dark Mode Toggle -->
            <button @click="emit('toggle-dark-mode')" :class="isDarkMode ? 'bg-slate-800' : 'bg-slate-300'"
                class="relative w-20 h-11 rounded-full transition-all duration-300 focus:outline-none">
                <div class="absolute inset-0 flex items-center justify-between px-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                            clip-rule="evenodd" />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                </div>
                <span :class="isDarkMode ? 'translate-x-9 bg-slate-600' : 'translate-x-0 bg-white shadow-md'"
                    class="absolute top-1 left-1 w-9 h-9 rounded-full transition-transform duration-300 ease-out z-10">
                </span>
            </button>
        </div>
    </header>
</template>
