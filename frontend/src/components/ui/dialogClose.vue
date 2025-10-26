<script setup lang="ts">
defineEmits(['close'])
</script>
<template>
  <span @click="$emit('close')">
    <slot />
  </span>
</template>
