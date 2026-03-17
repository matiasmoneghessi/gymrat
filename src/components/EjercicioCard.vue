<template>
  <div class="ejercicio-card">
    <div class="ejercicio-row">
      <div class="ejercicio-name">
        <h3>{{ ejercicio.nombre }}</h3>
        <span v-if="ejercicio.codigo" class="pill pill-subtle">{{ ejercicio.codigo }}</span>
      </div>
      <div class="ejercicio-metrics">
        <span class="metric-chip">
          <span class="metric-chip-label">Kg</span>
          <span class="metric-chip-value">{{ serie?.kg ?? '—' }}</span>
        </span>
        <span class="metric-chip">
          <span class="metric-chip-label">{{ serie?.tipo_reps === 'seg' ? 'Seg' : 'Reps' }}</span>
          <span class="metric-chip-value">{{ serie?.reps ?? '—' }}</span>
        </span>
        <span class="metric-chip">
          <span class="metric-chip-label">Series</span>
          <span class="metric-chip-value">{{ serie?.series ?? '—' }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ejercicio, EjercicioSemana } from '@/types';

defineProps<{
  ejercicio: Ejercicio;
  serie?: EjercicioSemana;
}>();
</script>
