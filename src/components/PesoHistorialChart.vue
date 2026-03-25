<template>
  <div class="chart-wrapper">
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import {
  Chart,
  LineElement,
  LineController,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
  type ChartData,
} from 'chart.js';
import type { EjercicioDetalle } from '@/types';

Chart.register(LineElement, LineController, PointElement, CategoryScale, LinearScale, Tooltip, Filler);

const props = defineProps<{ ejercicio: EjercicioDetalle }>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function buildData(): ChartData<'line'> {
  // Ordenar semanas por numero ascendente
  const semanas = [...props.ejercicio.ejercicioSemanas].sort((a, b) => a.semanaId - b.semanaId);

  const labels = semanas.map((_, i) => `Sem ${i + 1}`);
  const datos = semanas.map((es) => {
    if (es.serieDetalles.length === 0) return es.kg ?? null;
    const validos = es.serieDetalles.map((d) => d.kg).filter((k): k is number => k !== null);
    if (validos.length === 0) return es.kg ?? null;
    return Math.max(...validos);
  });

  return {
    labels,
    datasets: [
      {
        label: 'Kg máx',
        data: datos,
        borderColor: 'rgba(255, 92, 43, 1)',
        backgroundColor: 'rgba(255, 92, 43, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 92, 43, 1)',
        pointRadius: 4,
        tension: 0.3,
        fill: true,
        spanGaps: true,
      },
    ],
  };
}

function createChart() {
  if (!canvasRef.value) return;
  chart?.destroy();
  chart = new Chart(canvasRef.value, {
    type: 'line',
    data: buildData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y ?? '—'} kg`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          beginAtZero: false,
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  });
}

onMounted(() => createChart());
onUnmounted(() => chart?.destroy());
watch(() => props.ejercicio, () => createChart(), { deep: true });
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 160px;
  width: 100%;
}
</style>
