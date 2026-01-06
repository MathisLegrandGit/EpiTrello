<template>
    <div class="inline-flex items-center gap-3">
        <div :class="[
            'rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30',
            sizeClasses
        ]">
            <svg xmlns="http://www.w3.org/2000/svg" :class="iconClasses" viewBox="0 0 20 20" fill="currentColor">
                <path
                    d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
            </svg>
        </div>
        <span v-if="showText"
            :class="['font-bold tracking-tight', textClasses, isDarkMode ? 'text-white' : 'text-slate-800']">EpiTrello</span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    size: {
        type: String,
        default: 'md',
        validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    showText: {
        type: Boolean,
        default: true
    },
    isDarkMode: {
        type: Boolean,
        default: true
    }
})

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm': return 'w-8 h-8 rounded-lg'
        case 'lg': return 'w-12 h-12 rounded-2xl'
        default: return 'w-10 h-10 rounded-xl'
    }
})

const iconClasses = computed(() => {
    switch (props.size) {
        case 'sm': return 'h-5 w-5 text-white'
        case 'lg': return 'h-7 w-7 text-white'
        default: return 'h-6 w-6 text-white'
    }
})

const textClasses = computed(() => {
    switch (props.size) {
        case 'sm': return 'text-xl'
        case 'lg': return 'text-3xl'
        default: return 'text-2xl'
    }
})
</script>
