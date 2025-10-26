<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  open?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

function handleBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    isOpen.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/80"
        @click="handleBackdropClick"
      >
        <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
