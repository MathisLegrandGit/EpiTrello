<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div
    :class="cn('grid w-full max-w-lg gap-4 border border-slate-200/50 bg-white/95 backdrop-blur-xl p-6 shadow-2xl rounded-2xl animate-scale-in', props.class)">
    <slot />
  </div>
</template>
