<template>
  <div class="card ejercicio-card">
    <header class="card-header">
      <h3>{{ ejercicio.nombre }}</h3>
      <span v-if="ejercicio.codigo" class="pill pill-subtle">{{ ejercicio.codigo }}</span>
    </header>
    <div class="ejercicio-grid">
      <div class="metric">
        <span class="metric-label">Kg</span>
        <span class="metric-value">
          {{ serie?.kg ?? '—' }}
        </span>
      </div>
      <div class="metric">
        <span class="metric-label">{{ serie?.tipo_reps === 'seg' ? 'Seg' : 'Reps' }}</span>
        <span class="metric-value">{{ serie?.reps ?? '—' }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Series</span>
        <span class="metric-value">{{ serie?.series ?? '—' }}</span>
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

