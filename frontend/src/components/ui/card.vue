<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div
    :class="cn('rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-200 hover:shadow-md', props.class)">
    <slot />
  </div>
</template>
