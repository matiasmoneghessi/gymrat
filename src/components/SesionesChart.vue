<template>
  <div class="chart-wrapper">
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import {
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
  Tooltip,
  type ChartData,
} from 'chart.js';
import type { SesionResumen } from '@/types';

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip);

const props = defineProps<{ sesiones: SesionResumen[] }>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

function buildData(): ChartData<'bar'> {
  // Últimos 6 meses
  const ahora = new Date();
  const meses: { label: string; key: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
    meses.push({ label, key });
  }

  const conteo: Record<string, number> = {};
  for (const s of props.sesiones) {
    const key = s.fecha.substring(0, 7); // YYYY-MM
    conteo[key] = (conteo[key] ?? 0) + 1;
  }

  return {
    labels: meses.map((m) => m.label),
    datasets: [
      {
        label: 'Entrenamientos',
        data: meses.map((m) => conteo[m.key] ?? 0),
        backgroundColor: 'rgba(255, 92, 43, 0.7)',
        borderColor: 'rgba(255, 92, 43, 1)',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };
}

function createChart() {
  if (!canvasRef.value) return;
  chart?.destroy();
  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data: buildData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y} sesión${ctx.parsed.y !== 1 ? 'es' : ''}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          beginAtZero: true,
          ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 }, stepSize: 1 },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  });
}

onMounted(() => createChart());
onUnmounted(() => chart?.destroy());
watch(() => props.sesiones, () => createChart(), { deep: true });
</script>

<style scoped>
.chart-wrapper {
  position: relative;
  height: 180px;
  width: 100%;
}
</style>
