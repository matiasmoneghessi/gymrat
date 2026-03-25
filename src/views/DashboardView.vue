<template>
  <section class="page page-dashboard">
    <header class="page-header">
      <button class="back-btn" @click="router.push({ name: 'home' })" aria-label="Volver">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <h1>Progreso</h1>
    </header>

    <LoadingSpinner v-if="loading" label="Cargando historial..." />
    <p v-if="error && !loading" class="error-banner">{{ error }}</p>

    <template v-if="!loading && !error">
      <!-- Stats rápidas -->
      <div class="stats-grid">
        <div class="stat-card card">
          <span class="stat-value">{{ sesiones.length }}</span>
          <span class="stat-label">Sesiones</span>
        </div>
        <div class="stat-card card">
          <span class="stat-value">{{ totalMinutos }}</span>
          <span class="stat-label">Minutos</span>
        </div>
        <div class="stat-card card">
          <span class="stat-value">{{ promedioCompletado }}%</span>
          <span class="stat-label">Completado</span>
        </div>
      </div>

      <!-- Gráfico sesiones por mes -->
      <section v-if="sesiones.length > 0" class="chart-section card">
        <h2 class="section-title">Entrenamientos por mes</h2>
        <SesionesChart :sesiones="sesiones" />
      </section>

      <!-- Historial -->
      <section class="historial-section">
        <h2 class="section-title">Historial</h2>

        <p v-if="sesiones.length === 0" class="empty-msg">
          Todavía no completaste ninguna sesión. ¡Empezá a entrenar!
        </p>

        <div v-else class="sesiones-list">
          <div
            v-for="s in sesiones"
            :key="s.id"
            class="sesion-item card"
          >
            <div class="sesion-item-header">
              <div class="sesion-item-info">
                <span class="sesion-item-rutina">{{ s.rutinaNombre }}</span>
                <span class="sesion-item-dia">S{{ s.semanaNumero }} · {{ s.diaNombre }}</span>
              </div>
              <span class="sesion-item-fecha">{{ formatFecha(s.fecha) }}</span>
            </div>

            <div class="sesion-item-meta">
              <span class="meta-chip">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ s.duracion_minutos }} min
              </span>
              <span class="meta-chip">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ s.ejerciciosCompletados }}/{{ s.totalEjercicios }} ejercicios
              </span>
              <span
                class="meta-chip"
                :class="completadoClass(s)"
              >
                {{ Math.round((s.ejerciciosCompletados / Math.max(s.totalEjercicios, 1)) * 100) }}%
              </span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { fetchSesiones } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import SesionesChart from '@/components/SesionesChart.vue';
import type { SesionResumen } from '@/types';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref('');
const sesiones = ref<SesionResumen[]>([]);

const totalMinutos = computed(() => sesiones.value.reduce((sum, s) => sum + s.duracion_minutos, 0));

const promedioCompletado = computed(() => {
  if (sesiones.value.length === 0) return 0;
  const total = sesiones.value.reduce(
    (sum, s) => sum + (s.ejerciciosCompletados / Math.max(s.totalEjercicios, 1)),
    0,
  );
  return Math.round((total / sesiones.value.length) * 100);
});

function formatFecha(fecha: string) {
  try {
    return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(fecha + 'T12:00:00'));
  } catch {
    return fecha;
  }
}

function completadoClass(s: SesionResumen) {
  const pct = (s.ejerciciosCompletados / Math.max(s.totalEjercicios, 1)) * 100;
  if (pct >= 80) return 'chip-success';
  if (pct >= 50) return 'chip-warn';
  return 'chip-low';
}

onMounted(async () => {
  const token = authStore.session?.access_token;
  if (!token) {
    error.value = 'No hay sesión activa.';
    loading.value = false;
    return;
  }
  try {
    sesiones.value = await fetchSesiones(token);
  } catch {
    error.value = 'No se pudo cargar el historial.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(17px, 4vw, 22px);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-muted);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  color: var(--text);
  transform: translateX(-2px);
}

/* ── Stats ───────────────────────────────────────────────────── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 8px;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--accent-strong);
  line-height: 1;
}

.stat-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
}

/* ── Chart ───────────────────────────────────────────────────── */
.chart-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

/* ── Historial ───────────────────────────────────────────────── */
.historial-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  margin: 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.empty-msg {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
  text-align: center;
  padding: 32px 0;
}

.sesiones-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sesion-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
}

.sesion-item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.sesion-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sesion-item-rutina {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sesion-item-dia {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.sesion-item-fecha {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.sesion-item-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  font-size: 11px;
  color: var(--text-muted);
}

.chip-success {
  background: rgba(74, 222, 128, 0.08);
  border-color: rgba(74, 222, 128, 0.2);
  color: #4ade80;
}

.chip-warn {
  background: rgba(251, 191, 36, 0.08);
  border-color: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
}

.chip-low {
  background: rgba(255, 59, 92, 0.08);
  border-color: rgba(255, 59, 92, 0.2);
  color: #ff6b87;
}

/* ── Light mode ──────────────────────────────────────────────── */
[data-theme="light"] .back-btn {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .back-btn:hover {
  background: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .chip {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .chip-success {
  background: rgba(22, 163, 74, 0.1);
  border-color: rgba(22, 163, 74, 0.25);
  color: #166534;
}

[data-theme="light"] .chip-warn {
  background: rgba(180, 120, 0, 0.1);
  border-color: rgba(180, 120, 0, 0.25);
  color: #854d0e;
}

[data-theme="light"] .chip-low {
  background: rgba(200, 30, 60, 0.08);
  border-color: rgba(200, 30, 60, 0.2);
  color: #9f1239;
}
</style>
