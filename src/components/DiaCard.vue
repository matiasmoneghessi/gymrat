<template>
  <section class="card dia-card">
    <header class="card-header">
      <span class="pill">Día {{ dia.numero }}</span>
      <h2>{{ dia.nombre }}</h2>
    </header>

    <div class="dia-meta" v-if="dia.movilidad || dia.activacion">
      <div v-if="dia.movilidad" class="meta-block">
        <span class="meta-label">Movilidad</span>
        <p class="meta-text">{{ dia.movilidad }}</p>
      </div>
      <div v-if="dia.activacion" class="meta-block">
        <span class="meta-label">Activación</span>
        <p class="meta-text">{{ dia.activacion }}</p>
      </div>
    </div>

    <div class="ejercicios-list">
      <EjercicioCard
        v-for="ej in dia.ejercicios"
        :key="ej.id"
        :ejercicio="ej"
        :serie="ej.ejercicioSemanas[0]"
      />
    </div>

    <button
      v-if="mostrarEntrenar"
      type="button"
      class="btn-entrenar"
      @click="$emit('entrenar', dia.id)"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      Entrenar este día
    </button>
  </section>
</template>

<script setup lang="ts">
import type { Dia } from '@/types';
import EjercicioCard from './EjercicioCard.vue';

defineProps<{
  dia: Dia;
  mostrarEntrenar?: boolean;
}>();

defineEmits<{
  (e: 'entrenar', diaId: number): void;
}>();
</script>

<style scoped>
.btn-entrenar {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  margin-top: 4px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 92, 43, 0.35);
  background: rgba(255, 92, 43, 0.08);
  color: var(--accent-strong);
  font-size: 12px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  justify-content: center;
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}

.btn-entrenar:hover {
  background: rgba(255, 92, 43, 0.16);
  box-shadow: var(--shadow-accent);
}
</style>
