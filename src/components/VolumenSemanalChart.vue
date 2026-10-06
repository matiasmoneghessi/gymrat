<template>
  <div class="chart-wrapper"><canvas ref="canvasRef" /></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Chart, BarElement, BarController, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import type { VolumenSemana } from '@/lib/estadisticas';

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip);

const props = defineProps<{ semanas: VolumenSemana[] }>();
const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function crear() {
  if (!canvasRef.value) return;
  chart?.destroy();
  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels: props.semanas.map((s) => s.label),
      datasets: [{
        data: props.semanas.map((s) => s.volumen),
        backgroundColor: 'rgba(255, 92, 43, 0.7)',
        borderColor: 'rgba(255, 92, 43, 1)',
        borderWidth: 1,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${(c.parsed.y ?? 0).toLocaleString('es-AR')} kg` } },
      },
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { beginAtZero: true, ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });
}

onMounted(crear);
watch(() => props.semanas, crear, { deep: true });
onUnmounted(() => chart?.destroy());
</script>

<style scoped>
.chart-wrapper { position: relative; height: 200px; }
</style>
