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
      <label v-if="stravaConnected" class="strava-sync-toggle" :class="{ active: syncStrava }">
        <input type="checkbox" v-model="syncStrava" class="strava-sync-input" />
        <div class="strava-sync-left">
          <!-- Strava logo -->
          <svg class="strava-logo-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
          </svg>
          <div class="strava-sync-text">
            <span class="strava-sync-label">Sincronizar con Strava</span>
            <span class="strava-sync-sub">{{ syncStrava ? 'Se enviará al finalizar' : 'No se sincronizará' }}</span>
          </div>
        </div>
        <div class="strava-toggle-track">
          <div class="strava-toggle-thumb" />
        </div>
      </label>
      <button class="btn-finalizar-bottom" :disabled="saving" @click="finalizar">
        {{ saving ? 'Guardando...' : 'Finalizar sesión' }}
      </button>
    </div>

    <!-- Modal límite de tiempo -->
    <div v-if="showLimite" class="overlay">
      <div class="modal-card">
        <div class="modal-warn-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/>
          </svg>
        </div>
        <p class="modal-title">Sesión muy larga</p>
        <p class="modal-sub">Llevás más de {{ LIMITE_MINUTOS }} minutos entrenando. ¿Querés finalizar?</p>
        <div class="modal-actions">
          <button class="btn-modal-secondary" @click="showLimite = false">Seguir entrenando</button>
          <button class="btn-finalizar-bottom" :disabled="saving" @click="finalizar">
            {{ saving ? 'Guardando...' : 'Finalizar sesión' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal cancelar -->
    <div v-if="showCancelar" class="overlay" @click.self="showCancelar = false">
      <div class="modal-card">
        <div class="modal-danger-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <p class="modal-title">¿Cancelar sesión?</p>
        <p class="modal-sub">Se perderá todo el progreso de esta sesión. Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button class="btn-modal-secondary" @click="showCancelar = false">Seguir entrenando</button>
          <button class="btn-modal-danger" @click="goBack">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            Borrar sesión
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useRutinaStore } from '@/stores/rutina';
import { createSesion, fetchStravaStatus } from '@/services/api';
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

const LIMITE_MINUTOS = 180; // 3 horas
const LIMITE_SEGUNDOS = LIMITE_MINUTOS * 60;

const loading = ref(true);
const error = ref('');
const saving = ref(false);
const showCancelar = ref(false);
const showLimite = ref(false);
const stravaConnected = ref(false);
const syncStrava = ref(false);
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

// Ejercicio actual (primero sin completar, para el lock screen)
const ejercicioActual = computed(() =>
  ejercicios.value.find((ej) => !ejCompletado(ej))?.nombre
  ?? ejercicios.value[ejercicios.value.length - 1]?.nombre
  ?? 'GymRat'
);

// Recalcula el tiempo basándose en el timestamp real (funciona con celular bloqueado)
function recalcularElapsed() {
  elapsed.value = Math.floor((Date.now() - startTime.value) / 1000);
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    recalcularElapsed();
    updateMediaSession();
  }
}

// ── Lock screen (Media Session API) ──────────────────────────────
let audioCtx: AudioContext | null = null;
let silentSource: AudioBufferSourceNode | null = null;

function startSilentAudio() {
  try {
    audioCtx = new AudioContext();
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
    const gain = audioCtx.createGain();
    gain.gain.value = 0.001;
    silentSource = audioCtx.createBufferSource();
    silentSource.buffer = buffer;
    silentSource.loop = true;
    silentSource.connect(gain);
    gain.connect(audioCtx.destination);
    silentSource.start();
  } catch {
    // Browser may block AudioContext without user gesture; silently ignore
  }
}

function stopSilentAudio() {
  try { silentSource?.stop(); } catch { /* already stopped */ }
  try { audioCtx?.close(); } catch { /* already closed */ }
  audioCtx = null;
  silentSource = null;
}

function updateMediaSession() {
  if (!('mediaSession' in navigator)) return;
  const mins = Math.floor(elapsed.value / 60);
  const secs = elapsed.value % 60;
  const timer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: ejercicioActual.value,
    artist: `${timer}  ·  ${seriesCompletadas.value}/${seriesTotales.value} series`,
    album: `${rutinaName.value} · ${diaNombre.value}`,
    artwork: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  });
  navigator.mediaSession.playbackState = 'playing';
}

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
  stopSilentAudio();
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';

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
        sync_strava: syncStrava.value,
      },
      token,
    );
    router.push({ name: 'dashboard' });
  } catch {
    error.value = 'No se pudo guardar la sesión. Intentá de nuevo.';
    saving.value = false;
    startSilentAudio();
    timerInterval = setInterval(() => {
      recalcularElapsed();
      if (!showLimite.value && elapsed.value >= LIMITE_SEGUNDOS) {
        showLimite.value = true;
      }
      updateMediaSession();
    }, 1000);
  }
}

onMounted(async () => {
  // Verificar conexión con Strava (no bloquea la carga)
  const token = authStore.session?.access_token;
  if (token) {
    fetchStravaStatus(token)
      .then((s) => { stravaConnected.value = s.connected; })
      .catch(() => {});
  }

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
  startSilentAudio();
  updateMediaSession();
  timerInterval = setInterval(() => {
    recalcularElapsed();
    if (!showLimite.value && elapsed.value >= LIMITE_SEGUNDOS) {
      showLimite.value = true;
    }
    updateMediaSession();
  }, 1000);

  document.addEventListener('visibilitychange', onVisibilityChange);
  watch(ejercicioActual, () => updateMediaSession());
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  stopSilentAudio();
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
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

/* ── Strava sync toggle ──────────────────────────────────────── */
.strava-sync-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 8px;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.strava-sync-toggle.active {
  border-color: rgba(252, 76, 2, 0.3);
  background: rgba(252, 76, 2, 0.06);
}

.strava-sync-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.strava-sync-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strava-logo-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.3);
  transition: color var(--transition-fast);
}

.strava-sync-toggle.active .strava-logo-icon {
  color: #fc4c02;
}

.strava-sync-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.strava-sync-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  transition: color var(--transition-fast);
}

.strava-sync-toggle.active .strava-sync-label {
  color: var(--text);
}

.strava-sync-sub {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  opacity: 0.7;
}

.strava-toggle-track {
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  flex-shrink: 0;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.strava-sync-toggle.active .strava-toggle-track {
  background: #fc4c02;
  border-color: #fc4c02;
}

.strava-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform var(--transition-fast), background var(--transition-fast);
}

.strava-sync-toggle.active .strava-toggle-thumb {
  transform: translateX(18px);
  background: #fff;
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
  gap: 12px;
}

.modal-danger-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 59, 92, 0.12);
  border: 1px solid rgba(255, 59, 92, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff4d6d;
  margin-bottom: 2px;
}

.modal-warn-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 170, 0, 0.12);
  border: 1px solid rgba(255, 170, 0, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffaa00;
  margin-bottom: 2px;
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
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.btn-modal-secondary {
  width: 100%;
  min-height: 44px;
  padding: 11px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.btn-modal-secondary:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
}

.btn-modal-danger {
  width: 100%;
  min-height: 48px;
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 59, 92, 0.4);
  background: rgba(255, 59, 92, 0.14);
  color: #ff4d6d;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: background var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.btn-modal-danger:hover {
  background: rgba(255, 59, 92, 0.26);
  border-color: rgba(255, 59, 92, 0.6);
  box-shadow: 0 0 16px rgba(255, 59, 92, 0.18);
}

.btn-modal-danger:active {
  background: rgba(255, 59, 92, 0.35);
  transform: scale(0.98);
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

[data-theme="light"] .strava-sync-toggle {
  border-color: rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.02);
}

[data-theme="light"] .strava-sync-toggle.active {
  border-color: rgba(252, 76, 2, 0.25);
  background: rgba(252, 76, 2, 0.05);
}

[data-theme="light"] .strava-logo-icon {
  color: rgba(0, 0, 0, 0.25);
}

[data-theme="light"] .strava-toggle-track {
  background: rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .strava-toggle-thumb {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .btn-finalizar-bottom {
  background: linear-gradient(120deg, rgba(255, 92, 43, 0.18), rgba(255, 255, 255, 0.9));
}

[data-theme="light"] .modal-card {
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .modal-danger-icon {
  background: rgba(220, 38, 60, 0.08);
  border-color: rgba(220, 38, 60, 0.15);
  color: #dc2626;
}

[data-theme="light"] .btn-modal-secondary {
  border-color: rgba(0, 0, 0, 0.12);
}

[data-theme="light"] .btn-modal-secondary:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text);
}

[data-theme="light"] .btn-modal-danger {
  background: rgba(220, 38, 60, 0.08);
  border-color: rgba(220, 38, 60, 0.3);
  color: #dc2626;
}

[data-theme="light"] .btn-modal-danger:hover {
  background: rgba(220, 38, 60, 0.15);
  border-color: rgba(220, 38, 60, 0.5);
  box-shadow: 0 0 16px rgba(220, 38, 60, 0.12);
}
</style>
