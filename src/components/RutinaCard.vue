<template>
  <article class="card rutina-card" @click="onClick">
    <header class="card-header">
      <span class="pill">Semana {{ rutina.numero }}</span>
      <h2>{{ rutina.nombre }}</h2>
    </header>
    <p class="card-meta">
      Tipo de esfuerzo:
      <span class="highlight">{{ rutina.tipo_esfuerzo }}</span>
    </p>
    <footer class="card-footer">
      <span class="cta">Ver detalle</span>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { SemanaSummary } from '@/types';

const props = defineProps<{
  rutina: SemanaSummary;
}>();

const emit = defineEmits<{
  (e: 'select', id: number): void;
}>();

function onClick() {
  emit('select', props.rutina.id);
}
</script>

