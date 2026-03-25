<template>
  <section class="page page-sesion">
    <!-- Header fijo -->
    <header class="sesion-header">
      <button class="btn-cancelar" @click="confirmarCancelar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        Cancelar
      </button>
      <div class="sesion-timer">{{ timerDisplay }}</div>
      <button class="btn-finalizar" :disabled="saving" @click="finalizar">
        {{ saving ? 'Guardando...' : 'Finalizar' }}
      </button>
    </header>

    <!-- Info del día -->
    <div class="sesion-meta">
      <span class="sesion-meta-title">{{ rutinaName }}</span>
      <span class="sesion-meta-sub">S{{ semanaNumero }} · {{ diaNombre }}</span>
    </div>

    <!-- Progreso general -->
    <div class="progreso-bar-wrap">
      <div class="progreso-bar" :style="{ width: progresoPorc + '%' }" />
    </div>
    <p class="progreso-label">{{ seriesCompletadas }} / {{ seriesTotales }} series completadas</p>

    <LoadingSpinner v-if="loading" label="Cargando sesión..." />
    <p v-if="error && !loading" class="error-banner">{{ error }}</p>

    <!-- Ejercicios -->
    <div v-if="!loading" class="ejercicios-list">
      <div
        v-for="(ej, eIdx) in ejercicios"
        :key="ej.ejercicioId"
        class="ej-card card"
        :class="{ 'ej-done': ejCompletado(ej) }"
      >
        <!-- Cabecera ejercicio -->
        <div class="ej-header">
          <div class="ej-check-circle" :class="{ done: ejCompletado(ej) }" @click="toggleEjercicio(eIdx)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
              stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div class="ej-title-wrap">
            <h3 class="ej-nombre">{{ ej.nombre }}</h3>
            <span v-if="ej.codigo" class="pill pill-subtle">{{ ej.codigo }}</span>
          </div>
        </div>

        <!-- Tabla de series -->
        <div class="series-tabla">
          <div class="serie-header-row">
            <span class="col-num">Serie</span>
            <span class="col-kg">Kg</span>
            <span class="col-reps">Reps</span>
            <span class="col-check"></span>
          </div>
          <div
            v-for="(s, sIdx) in ej.series"
            :key="sIdx"
            class="serie-row"
            :class="{ completada: s.completada }"
          >
            <span class="col-num serie-num">{{ s.numero }}</span>
            <div class="col-kg">
              <input
                v-model.number="s.kg"
                type="number"
                step="0.5"
                min="0"
                class="serie-input"
                :disabled="s.completada"
                placeholder="—"
              />
            </div>
            <div class="col-reps">
              <input
                v-model.number="s.reps"
                type="number"
                min="0"
                class="serie-input"
                :disabled="s.completada"
              />
            </div>
            <div class="col-check">
              <button
                type="button"
                class="check-btn"
                :class="{ done: s.completada }"
                @click="toggleSerie(eIdx, sIdx)"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                  stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Agregar serie extra -->
        <button type="button" class="btn-add-serie" @click="addSerie(eIdx)">+ Serie</button>
      </div>
    </div>

    <!-- Botón finalizar bottom (mobile) -->
    <div v-if="!loading" class="bottom-actions">
      <button class="btn-finalizar-bottom" :disabled="saving" @click="finalizar">
        {{ saving ? 'Guardando...' : 'Finalizar sesión' }}
      </button>
    </div>

    <!-- Modal cancelar -->
    <div v-if="showCancelar" class="overlay" @click.self="showCancelar = false">
      <div class="modal-card">
        <p class="modal-title">¿Cancelar sesión?</p>
        <p class="modal-sub">Se perderá el progreso no guardado.</p>
        <div class="modal-actions">
          <button class="btn-modal-secondary" @click="showCancelar = false">Seguir entrenando</button>
          <button class="btn-modal-danger" @click="goBack">Cancelar sesión</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useRutinaStore } from '@/stores/rutina';
import { createSesion } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

interface SerieForm {
  numero: number;
  kg: number | null;
  reps: number;
  completada: boolean;
}

interface EjercicioSesionForm {
  ejercicioId: number;
  nombre: string;
  codigo: string | null;
  series: SerieForm[];
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const rutinaStore = useRutinaStore();

const rutinaId = Number(route.query.rutinaId);
const semanaId = Number(route.query.semanaId);
const diaId = Number(route.query.diaId);

const loading = ref(true);
const error = ref('');
const saving = ref(false);
const showCancelar = ref(false);
const ejercicios = ref<EjercicioSesionForm[]>([]);
const rutinaName = ref('');
const diaNombre = ref('');
const semanaNumero = ref(0);

// Timer
const startTime = ref(Date.now());
const elapsed = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;

const timerDisplay = computed(() => {
  const mins = Math.floor(elapsed.value / 60);
  const secs = elapsed.value % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
});

// Progreso
const seriesTotales = computed(() => ejercicios.value.reduce((sum, e) => sum + e.series.length, 0));
const seriesCompletadas = computed(() => ejercicios.value.reduce((sum, e) => sum + e.series.filter((s) => s.completada).length, 0));
const progresoPorc = computed(() => seriesTotales.value === 0 ? 0 : Math.round((seriesCompletadas.value / seriesTotales.value) * 100));

function ejCompletado(ej: EjercicioSesionForm) {
  return ej.series.length > 0 && ej.series.every((s) => s.completada);
}

function toggleEjercicio(eIdx: number) {
  const ej = ejercicios.value[eIdx];
  const toMark = !ejCompletado(ej);
  ej.series.forEach((s) => { s.completada = toMark; });
}

function toggleSerie(eIdx: number, sIdx: number) {
  const s = ejercicios.value[eIdx].series[sIdx];
  s.completada = !s.completada;
}

function addSerie(eIdx: number) {
  const ej = ejercicios.value[eIdx];
  const last = ej.series[ej.series.length - 1];
  ej.series.push({
    numero: ej.series.length + 1,
    kg: last?.kg ?? null,
    reps: last?.reps ?? 0,
    completada: false,
  });
}

function confirmarCancelar() {
  showCancelar.value = true;
}

function goBack() {
  router.back();
}

async function finalizar() {
  const token = authStore.session?.access_token;
  if (!token) return;

  saving.value = true;
  if (timerInterval) clearInterval(timerInterval);

  const duracion = Math.round(elapsed.value / 60);

  try {
    await createSesion(
      {
        rutinaId,
        semanaId,
        diaId,
        fecha: new Date().toISOString().split('T')[0],
        duracion_minutos: duracion,
        ejercicios: ejercicios.value.map((ej) => ({
          ejercicioId: ej.ejercicioId,
          completado: ejCompletado(ej),
          series: ej.series.map((s) => ({
            numero_serie: s.numero,
            kg: s.kg,
            reps: s.reps,
            completada: s.completada,
          })),
        })),
      },
      token,
    );
    router.push({ name: 'dashboard' });
  } catch {
    error.value = 'No se pudo guardar la sesión. Intentá de nuevo.';
    saving.value = false;
    timerInterval = setInterval(() => { elapsed.value++; }, 1000);
  }
}

onMounted(async () => {
  // Asegurar que la rutina esté cargada
  if (!rutinaStore.rutinaActual || rutinaStore.rutinaActual.id !== rutinaId) {
    await rutinaStore.loadRutinaById(rutinaId);
  }

  const rutina = rutinaStore.rutinaActual;
  if (!rutina) {
    error.value = 'No se pudo cargar la rutina.';
    loading.value = false;
    return;
  }

  rutinaName.value = rutina.nombre;

  const semana = rutina.semanas.find((s) => s.id === semanaId);
  if (!semana) {
    error.value = 'Semana no encontrada.';
    loading.value = false;
    return;
  }
  semanaNumero.value = semana.numero;

  const dia = semana.dias.find((d) => d.id === diaId);
  if (!dia) {
    error.value = 'Día no encontrado.';
    loading.value = false;
    return;
  }
  diaNombre.value = dia.nombre;

  // Construir ejercicios con sus series pre-cargadas
  ejercicios.value = dia.ejercicios.map((ej) => {
    const ejSemana = ej.ejercicioSemanas.find((es) => es.semanaId === semanaId)
      ?? ej.ejercicioSemanas[0];
    const cantSeries = ejSemana?.series ?? 3;

    const series: SerieForm[] = [];
    for (let i = 0; i < cantSeries; i++) {
      // Buscar kg desde serieDetalles si existen
      const detalle = ejSemana?.serieDetalles?.find((d) => d.numero_serie === i + 1);
      series.push({
        numero: i + 1,
        kg: detalle?.kg ?? ejSemana?.kg ?? null,
        reps: ejSemana?.reps ?? 0,
        completada: false,
      });
    }

    return {
      ejercicioId: ej.id,
      nombre: ej.nombre,
      codigo: ej.codigo ?? null,
      series,
    };
  });

  loading.value = false;

  // Iniciar timer
  startTime.value = Date.now();
  timerInterval = setInterval(() => { elapsed.value++; }, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});
</script>

<style scoped>
.page-sesion {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 100px; /* espacio para bottom actions */
}

/* ── Header ──────────────────────────────────────────────────── */
.sesion-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  background: rgba(5, 6, 8, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin: 0 -14px;
  padding: 10px 14px;
}

.sesion-timer {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.btn-cancelar {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  transition: color var(--transition-fast), background var(--transition-fast);
}

.btn-cancelar:hover {
  color: var(--danger);
  background: rgba(255, 59, 92, 0.08);
}

.btn-finalizar {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 92, 43, 0.5);
  background: rgba(255, 92, 43, 0.15);
  color: var(--accent-strong);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-finalizar:hover:not(:disabled) {
  background: rgba(255, 92, 43, 0.26);
}

.btn-finalizar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Meta ────────────────────────────────────────────────────── */
.sesion-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sesion-meta-title {
  font-size: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sesion-meta-sub {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ── Progress bar ────────────────────────────────────────────── */
.progreso-bar-wrap {
  height: 3px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
  overflow: hidden;
}

.progreso-bar {
  height: 100%;
  background: var(--accent);
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progreso-label {
  margin: 0;
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ── Ejercicio card ──────────────────────────────────────────── */
.ejercicios-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ej-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: opacity var(--transition-med);
}

.ej-card.ej-done {
  opacity: 0.55;
}

.ej-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ej-check-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  color: transparent;
  transition: border-color var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
}

.ej-check-circle.done {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.ej-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ej-nombre {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

/* ── Series tabla ────────────────────────────────────────────── */
.series-tabla {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.serie-header-row,
.serie-row {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 44px;
  align-items: center;
  gap: 6px;
}

.serie-header-row {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
  padding: 0 4px;
}

.serie-row {
  padding: 4px;
  border-radius: 8px;
  transition: background var(--transition-fast), opacity var(--transition-fast);
}

.serie-row.completada {
  background: rgba(255, 92, 43, 0.06);
  opacity: 0.65;
}

.serie-num {
  font-size: 13px;
  color: var(--text-muted);
  text-align: center;
}

.serie-input {
  width: 100%;
  padding: 9px 8px;
  min-height: 44px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: 15px;
  font-family: inherit;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.serie-input::placeholder {
  color: var(--text-muted);
  opacity: 0.5;
}

.serie-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.serie-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Check button per set */
.check-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
}

.check-btn.done {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

/* Add serie */
.btn-add-serie {
  align-self: flex-start;
  background: none;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.btn-add-serie:hover {
  border-color: rgba(255, 255, 255, 0.25);
  color: var(--text);
}

/* ── Bottom finalizar ────────────────────────────────────────── */
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: rgba(5, 6, 8, 0.92);
  backdrop-filter: blur(14px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  z-index: 40;
}

.btn-finalizar-bottom {
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 92, 43, 0.5);
  background: linear-gradient(120deg, rgba(255, 92, 43, 0.22), rgba(5, 6, 8, 0.9));
  color: var(--accent-strong);
  font-size: 14px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}

.btn-finalizar-bottom:hover:not(:disabled) {
  box-shadow: var(--shadow-accent);
}

.btn-finalizar-bottom:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Modal cancelar ──────────────────────────────────────────── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal-card {
  background: var(--bg-elevated);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.modal-sub {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn-modal-secondary {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-modal-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn-modal-danger {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 59, 92, 0.3);
  background: rgba(255, 59, 92, 0.1);
  color: #ff6b87;
  font-size: 12px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-modal-danger:hover {
  background: rgba(255, 59, 92, 0.18);
}

/* ── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .serie-input {
    font-size: 16px;
    min-height: 48px;
  }
}

/* ── Light mode ──────────────────────────────────────────────── */
[data-theme="light"] .sesion-header {
  background: rgba(240, 242, 248, 0.92);
  border-bottom-color: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .progreso-bar-wrap {
  background: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .ej-check-circle {
  border-color: rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .serie-input {
  background: #ffffff;
  border-color: var(--border-subtle);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

[data-theme="light"] .serie-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

[data-theme="light"] .check-btn {
  border-color: rgba(0, 0, 0, 0.18);
}

[data-theme="light"] .btn-add-serie {
  border-color: rgba(0, 0, 0, 0.18);
}

[data-theme="light"] .btn-add-serie:hover {
  border-color: var(--accent);
}

[data-theme="light"] .bottom-actions {
  background: rgba(255, 255, 255, 0.96);
  border-top-color: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .btn-finalizar-bottom {
  background: linear-gradient(120deg, rgba(255, 92, 43, 0.18), rgba(255, 255, 255, 0.9));
}

[data-theme="light"] .modal-card {
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .btn-modal-secondary {
  border-color: rgba(0, 0, 0, 0.12);
}

[data-theme="light"] .btn-modal-secondary:hover {
  background: rgba(0, 0, 0, 0.05);
}
</style>
