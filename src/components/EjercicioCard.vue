<template>
  <div class="ejercicio-card" role="button" tabindex="0" @click="goDetalle" @keydown.enter="goDetalle">
    <div class="ejercicio-row">
      <div class="ejercicio-name">
        <h3>{{ ejercicio.nombre }}</h3>
        <span v-if="ejercicio.codigo" class="pill pill-subtle">{{ ejercicio.codigo }}</span>
      </div>
      <svg class="chevron-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>

    <div class="ejercicio-metrics">
      <!-- Kg: por serie si varían, único si son iguales -->
      <template v-if="kgsVariables.length > 0">
        <span class="metric-chip kg-chip-variable">
          <span class="metric-chip-label">Kg</span>
          <span class="metric-chip-value kg-series">{{ kgsVariables.join(' / ') }}</span>
        </span>
      </template>
      <template v-else>
        <span class="metric-chip">
          <span class="metric-chip-label">Kg</span>
          <span class="metric-chip-value">{{ serie?.kg ?? '—' }}</span>
        </span>
      </template>

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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Ejercicio, EjercicioSemana } from '@/types';

const props = defineProps<{
  ejercicio: Ejercicio;
  serie?: EjercicioSemana;
}>();

const router = useRouter();

// Muestra los kg individuales si hay serieDetalles con valores distintos entre sí
const kgsVariables = computed(() => {
  const detalles = props.serie?.serieDetalles;
  if (!detalles || detalles.length === 0) return [];
  const kgs = detalles.map((d) => d.kg ?? '—');
  // Si todos los valores son iguales, no necesitamos mostrarlos por separado
  const allSame = kgs.every((k) => k === kgs[0]);
  return allSame ? [] : kgs.map(String);
});

function goDetalle() {
  router.push({ name: 'ejercicio-detalle', params: { id: props.ejercicio.id } });
}
</script>

<style scoped>
.ejercicio-card {
  cursor: pointer;
  border-radius: var(--radius-md, 10px);
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  outline: none;
}

.ejercicio-card:hover,
.ejercicio-card:focus-visible {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.ejercicio-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ejercicio-name {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ejercicio-name h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.chevron-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.ejercicio-metrics {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.metric-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.metric-chip-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.metric-chip-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.kg-chip-variable .metric-chip-value.kg-series {
  font-size: 11px;
  letter-spacing: 0.04em;
}
</style>
