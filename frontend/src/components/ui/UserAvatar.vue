<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    avatarUrl?: string | null
    name?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    isDarkMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    isDarkMode: true
})

// Size classes mapping
const sizeClasses = computed(() => {
    switch (props.size) {
        case 'xs': return 'w-5 h-5 text-[10px]'
        case 'sm': return 'w-6 h-6 text-xs'
        case 'md': return 'w-8 h-8 text-sm'
        case 'lg': return 'w-10 h-10 text-base'
        case 'xl': return 'w-12 h-12 text-lg'
        default: return 'w-8 h-8 text-sm'
    }
})

// Get initials from name
const initials = computed(() => {
    if (!props.name) return '?'
    return props.name.charAt(0).toUpperCase()
})
</script>

<template>
    <div class="rounded-full overflow-hidden shrink-0" :class="sizeClasses">
        <!-- Profile picture -->
        <img v-if="avatarUrl" :src="avatarUrl" :alt="name || 'User'" class="w-full h-full object-cover" />

        <!-- Fallback: Blue circle with initials -->
        <div v-else class="w-full h-full flex items-center justify-center font-semibold bg-blue-500 text-white">
            {{ initials }}
        </div>
    </div>
</template>
