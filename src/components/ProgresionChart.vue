<template>
  <div class="chart-wrapper"><canvas ref="canvasRef" /></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import {
  Chart, LineElement, LineController, PointElement, CategoryScale, LinearScale, Tooltip,
} from 'chart.js';
import type { PuntoProgresion } from '@/lib/estadisticas';

Chart.register(LineElement, LineController, PointElement, CategoryScale, LinearScale, Tooltip);

const props = defineProps<{ puntos: PuntoProgresion[]; metrica: 'maxKg' | 'e1rm' }>();
const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function fmt(f: string) {
  return new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
}

function crear() {
  if (!canvasRef.value) return;
  chart?.destroy();
  chart = new Chart(canvasRef.value, {
    type: 'line',
    data: {
      labels: props.puntos.map((p) => fmt(p.fecha)),
      datasets: [{
        data: props.puntos.map((p) => p[props.metrica]),
        borderColor: 'rgba(255, 92, 43, 1)',
        backgroundColor: 'rgba(255, 92, 43, 0.15)',
        pointBackgroundColor: 'rgba(255, 92, 43, 1)',
        tension: 0.25,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${c.parsed.y} kg` } },
      },
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });
}

onMounted(crear);
watch(() => [props.puntos, props.metrica], crear, { deep: true });
onUnmounted(() => chart?.destroy());
</script>

<style scoped>
.chart-wrapper { position: relative; height: 220px; }
</style>
