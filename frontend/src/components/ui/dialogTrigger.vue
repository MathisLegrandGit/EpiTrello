<script setup lang="ts">
defineEmits(['trigger'])
</script>
<template>
  <span @click="$emit('trigger')">
    <slot />
  </span>
</template>
