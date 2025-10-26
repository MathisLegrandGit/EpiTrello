<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <p :class="cn('text-sm text-[hsl(var(--color-muted-foreground))]', props.class)">
    <slot />
  </p>
</template>
