<template>
    <div class="inline-flex items-center gap-3">
        <img src="/EpiTrello-Logo.png" alt="EpiTrello Logo" :class="sizeClasses" />
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
        case 'sm': return 'w-6 h-6'
        case 'lg': return 'w-10 h-10'
        default: return 'w-8 h-8'
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
