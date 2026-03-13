<template>
  <div class="loading-spinner">
    <div class="ring"></div>
    <span class="label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: 'Cargando...',
  },
);
</script>

