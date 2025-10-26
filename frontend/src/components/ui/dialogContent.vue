<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div
    :class="cn('grid w-full max-w-lg gap-4 border border-[hsl(var(--color-border))] bg-[hsl(var(--color-background))] p-6 shadow-lg sm:rounded-lg', props.class)"
  >
    <slot />
  </div>
</template>
