<template>
  <section class="page page-estadisticas">
    <header class="page-header">
      <button class="back-btn" @click="router.push({ name: 'home' })" aria-label="Volver">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <h1>Estadísticas</h1>
    </header>

    <LoadingSpinner v-if="loading" label="Calculando estadísticas..." />
    <p v-if="error && !loading" class="error-banner">{{ error }}</p>

    <template v-if="!loading && !error">
      <p v-if="!conDetalle" class="empty-msg card">
        Todavía no hay datos de series para calcular estadísticas. Aparecen a medida que
        completás series con peso y repeticiones en tus sesiones.
      </p>

      <template v-else>
        <!-- Resumen -->
        <div class="stats-grid">
          <div class="stat-card card">
            <span class="stat-value">{{ formatKg(volumenTotal) }}</span>
            <span class="stat-label">Kg movidos</span>
          </div>
          <div class="stat-card card">
            <span class="stat-value">{{ totalSeries }}</span>
            <span class="stat-label">Series</span>
          </div>
          <div class="stat-card card">
            <span class="stat-value">{{ ejercicios.length }}</span>
            <span class="stat-label">Ejercicios</span>
          </div>
        </div>

        <!-- Volumen semanal -->
        <section class="chart-section card">
          <h2 class="section-title">Volumen por semana</h2>
          <p class="hint">Kg × reps de las series completadas, últimas 8 semanas.</p>
          <VolumenSemanalChart :semanas="semanas" />
        </section>

        <!-- Más trabajados -->
        <section class="chart-section card">
          <h2 class="section-title">Ejercicios más trabajados</h2>
          <ol class="ranking">
            <li v-for="e in masTrabajados" :key="e.id" class="rank-item">
              <div class="rank-top">
                <span class="rank-nombre">{{ e.nombre }}</span>
                <span class="rank-valor">{{ e.series }} series</span>
              </div>
              <div class="rank-bar"><div class="rank-fill" :style="{ width: (e.series / maxSeries) * 100 + '%' }" /></div>
              <span class="rank-sub">{{ e.sesiones }} sesiones · {{ formatKg(e.volumen) }} kg de volumen</span>
            </li>
          </ol>
        </section>

        <!-- Progresión -->
        <section class="chart-section card">
          <h2 class="section-title">Progresión por ejercicio</h2>
          <select v-model.number="seleccionId" class="form-input">
            <option v-for="e in ejercicios" :key="e.id" :value="e.id">{{ e.nombre }}</option>
          </select>
          <div class="metrica-toggle">
            <button type="button" :class="{ active: metrica === 'maxKg' }" @click="metrica = 'maxKg'">Peso máximo</button>
            <button type="button" :class="{ active: metrica === 'e1rm' }" @click="metrica = 'e1rm'">1RM estimado</button>
          </div>
          <p v-if="seleccionado && seleccionado.progresion.length < 2" class="hint">
            Necesitás al menos 2 sesiones con este ejercicio para ver la evolución.
          </p>
          <ProgresionChart v-if="seleccionado && seleccionado.progresion.length >= 2"
            :puntos="seleccionado.progresion" :metrica="metrica" />
        </section>

        <!-- Récords -->
        <section class="chart-section card">
          <h2 class="section-title">Récords personales</h2>
          <ul class="records">
            <li v-for="e in porRecord" :key="e.id" class="record-item">
              <div>
                <span class="rank-nombre">{{ e.nombre }}</span>
                <span class="rank-sub">{{ formatFecha(e.record.fecha) }}</span>
              </div>
              <div class="record-vals">
                <strong>{{ formatKg(e.record.kg) }} kg × {{ e.record.reps }}</strong>
                <span class="rank-sub">1RM est. {{ formatKg(e.mejorE1rm.valor) }} kg</span>
              </div>
            </li>
          </ul>
        </section>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { fetchSesiones } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import VolumenSemanalChart from '@/components/VolumenSemanalChart.vue';
import ProgresionChart from '@/components/ProgresionChart.vue';
import { calcularPorEjercicio, volumenSemanal, hayDetalle, formatKg } from '@/lib/estadisticas';
import type { SesionResumen } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref('');
const sesiones = ref<SesionResumen[]>([]);
const seleccionId = ref<number | null>(null);
const metrica = ref<'maxKg' | 'e1rm'>('maxKg');

const conDetalle = computed(() => hayDetalle(sesiones.value));
const ejercicios = computed(() => calcularPorEjercicio(sesiones.value));
const semanas = computed(() => volumenSemanal(sesiones.value, 8));

const volumenTotal = computed(() => Math.round(ejercicios.value.reduce((n, e) => n + e.volumen, 0)));
const totalSeries = computed(() => ejercicios.value.reduce((n, e) => n + e.series, 0));

const masTrabajados = computed(() => [...ejercicios.value].sort((a, b) => b.series - a.series || b.volumen - a.volumen).slice(0, 5));
const maxSeries = computed(() => Math.max(1, ...masTrabajados.value.map((e) => e.series)));
const porRecord = computed(() => [...ejercicios.value].sort((a, b) => a.nombre.localeCompare(b.nombre)));
const seleccionado = computed(() => ejercicios.value.find((e) => e.id === seleccionId.value) ?? null);

function formatFecha(fecha: string) {
  return new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

onMounted(async () => {
  const token = authStore.session?.access_token;
  if (!token) { loading.value = false; return; }
  try {
    sesiones.value = await fetchSesiones(token);
    seleccionId.value = masTrabajados.value[0]?.id ?? null;
  } catch {
    error.value = 'No se pudieron cargar las estadísticas.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-estadisticas { display: flex; flex-direction: column; gap: 14px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.stat-card { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px 8px; }
.stat-value { font-size: 24px; font-weight: 700; color: var(--accent-strong); line-height: 1; }
.stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--text-muted); }
.chart-section { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
.section-title { margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; }
.hint { margin: 0; font-size: 12px; color: var(--text-muted); }
.empty-msg { padding: 20px; color: var(--text-muted); font-size: 14px; line-height: 1.5; }

.ranking, .records { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.rank-top { display: flex; justify-content: space-between; gap: 8px; }
.rank-nombre { display: block; font-weight: 500; }
.rank-valor { color: var(--accent-strong); font-weight: 600; white-space: nowrap; }
.rank-bar { height: 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.08); margin: 6px 0 4px; overflow: hidden; }
.rank-fill { height: 100%; background: var(--accent); border-radius: 999px; }
.rank-sub { display: block; font-size: 11px; color: var(--text-muted); }

.record-item { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.record-item:last-child { border-bottom: none; padding-bottom: 0; }
.record-vals { text-align: right; }

.metrica-toggle { display: flex; gap: 8px; }
.metrica-toggle button {
  flex: 1; padding: 8px; border-radius: var(--radius-pill); border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent; color: var(--text-muted); font-size: 12px; font-family: inherit;
  text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer;
}
.metrica-toggle button.active { border-color: var(--accent); background: var(--accent-soft); color: var(--accent-strong); }
</style>
