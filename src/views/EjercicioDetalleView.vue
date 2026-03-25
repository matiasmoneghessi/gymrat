<template>
  <section class="page page-ejercicio">
    <header class="page-header">
      <button class="back-btn" @click="goBack" aria-label="Volver">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <h1 class="ej-title">{{ ejercicio?.nombre ?? 'Ejercicio' }}</h1>
      <span v-if="ejercicio?.codigo" class="pill pill-subtle">{{ ejercicio.codigo }}</span>
    </header>

    <LoadingSpinner v-if="loading" label="Cargando ejercicio..." />
    <p v-if="error" class="error-banner">{{ error }}</p>

    <template v-if="ejercicio && !loading">
      <!-- Catálogo: imagen y video -->
      <div v-if="ejercicio.catalogoEjercicio" class="catalogo-media">
        <div v-if="ejercicio.catalogoEjercicio.imagen_url" class="media-block">
          <img
            :src="ejercicio.catalogoEjercicio.imagen_url"
            :alt="ejercicio.catalogoEjercicio.nombre"
            class="ej-imagen"
          />
        </div>

        <div v-if="ejercicio.catalogoEjercicio.video_url" class="media-block">
          <!-- YouTube embed -->
          <iframe
            v-if="isYoutube(ejercicio.catalogoEjercicio.video_url)"
            :src="youtubeEmbed(ejercicio.catalogoEjercicio.video_url)"
            class="ej-video"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
          <!-- Video directo -->
          <video
            v-else
            :src="ejercicio.catalogoEjercicio.video_url"
            class="ej-video"
            controls
            playsinline
          />
        </div>
      </div>

      <!-- Gráfico historial de peso -->
      <section v-if="ejercicio.ejercicioSemanas.length > 1" class="chart-section card">
        <h2 class="section-title">Historial de peso</h2>
        <PesoHistorialChart :ejercicio="ejercicio" />
      </section>

      <!-- Serie detalles por semana -->
      <section v-for="es in ejercicio.ejercicioSemanas" :key="es.id" class="semana-section card">
        <div class="semana-header">
          <span class="pill">Semana {{ semanaNumero(es.semanaId) }}</span>
          <div class="semana-meta">
            <span class="metric-chip">
              <span class="metric-chip-label">{{ es.tipo_reps === 'seg' ? 'Seg' : 'Reps' }}</span>
              <span class="metric-chip-value">{{ es.reps }}</span>
            </span>
            <span class="metric-chip">
              <span class="metric-chip-label">Series</span>
              <span class="metric-chip-value">{{ es.series }}</span>
            </span>
          </div>
        </div>

        <!-- Series con kg editable -->
        <div class="series-grid">
          <div
            v-for="n in es.series"
            :key="n"
            class="serie-row"
          >
            <span class="serie-num">Serie {{ n }}</span>
            <div class="serie-kg-input">
              <input
                v-model.number="draft[es.id][n - 1]"
                type="number"
                step="0.5"
                class="form-input form-input-xs"
                placeholder="Kg"
              />
              <span class="kg-label">kg</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="btn-save"
          :disabled="saving[es.id]"
          @click="guardarSeries(es)"
        >
          {{ saving[es.id] ? 'Guardando...' : 'Guardar series' }}
        </button>
        <p v-if="saveError[es.id]" class="error-inline">{{ saveError[es.id] }}</p>
        <p v-if="saveOk[es.id]" class="success-inline">Guardado</p>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useRutinaStore } from '@/stores/rutina';
import { fetchEjercicioDetalle, updateSerieDetalles } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import PesoHistorialChart from '@/components/PesoHistorialChart.vue';
import type { EjercicioDetalle, EjercicioSemana, SerieDetalle } from '@/types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const rutinaStore = useRutinaStore();

const ejercicioId = Number(route.params.id);

const loading = ref(true);
const error = ref('');
const ejercicio = ref<EjercicioDetalle | null>(null);

// draft[ejercicioSemanaId][serieIndex] = kg
const draft = reactive<Record<number, (number | null)[]>>({});
const saving = reactive<Record<number, boolean>>({});
const saveError = reactive<Record<number, string>>({});
const saveOk = reactive<Record<number, boolean>>({});

function initDraft(es: EjercicioSemana & { serieDetalles: SerieDetalle[] }) {
  const kgs: (number | null)[] = [];
  for (let i = 0; i < es.series; i++) {
    const detalle = es.serieDetalles.find((d) => d.numero_serie === i + 1);
    kgs.push(detalle?.kg ?? es.kg ?? null);
  }
  draft[es.id] = kgs;
}

function semanaNumero(semanaId: number): number {
  const rutina = rutinaStore.rutinaActual;
  if (!rutina) return semanaId;
  const s = rutina.semanas.find((s) => s.id === semanaId);
  return s?.numero ?? semanaId;
}

function isYoutube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function youtubeEmbed(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  const videoId = match?.[1];
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

async function guardarSeries(es: EjercicioSemana & { serieDetalles: SerieDetalle[] }) {
  const token = authStore.session?.access_token;
  if (!token) return;

  saving[es.id] = true;
  saveError[es.id] = '';
  saveOk[es.id] = false;

  try {
    const detalles = draft[es.id].map((kg, i) => ({ numero_serie: i + 1, kg: kg ?? null }));
    const result = await updateSerieDetalles(es.id, detalles, token);
    es.serieDetalles = result;
    saveOk[es.id] = true;
    setTimeout(() => { saveOk[es.id] = false; }, 2500);
  } catch {
    saveError[es.id] = 'No se pudo guardar. Intenta de nuevo.';
  } finally {
    saving[es.id] = false;
  }
}

function goBack() {
  router.back();
}

onMounted(async () => {
  const token = authStore.session?.access_token;
  if (!token) {
    error.value = 'No hay sesión activa.';
    loading.value = false;
    return;
  }
  try {
    ejercicio.value = await fetchEjercicioDetalle(ejercicioId, token);
    for (const es of ejercicio.value.ejercicioSemanas) {
      initDraft(es);
    }
  } catch {
    error.value = 'No se pudo cargar el ejercicio.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-ejercicio {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
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

.ej-title {
  flex: 1;
  margin: 0;
  font-size: clamp(16px, 4vw, 22px);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Catálogo media */
.catalogo-media {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-block {
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.4);
}

.ej-imagen {
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  display: block;
}

.ej-video {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: block;
  border: none;
}

/* Historial chart */
.chart-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.section-title {
  margin: 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

/* Semanas */
.semana-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.semana-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.semana-meta {
  display: flex;
  gap: 6px;
  margin-left: auto;
}

/* Series */
.series-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.serie-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.serie-num {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  min-width: 60px;
}

.serie-kg-input {
  display: flex;
  align-items: center;
  gap: 6px;
}

.form-input {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(5, 6, 8, 0.8);
  color: var(--text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color var(--transition-fast);
}

.form-input:focus {
  border-color: var(--accent);
}

.form-input-xs {
  width: 80px;
  padding: 6px 8px;
  font-size: 14px;
}

.kg-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Metric chips */
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

/* Save button */
.btn-save {
  align-self: flex-end;
  padding: 8px 20px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 92, 43, 0.4);
  background: rgba(255, 92, 43, 0.1);
  color: var(--accent-strong);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition-fast);
}

.btn-save:hover:not(:disabled) {
  background: rgba(255, 92, 43, 0.18);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-inline {
  margin: 0;
  font-size: 12px;
  color: var(--danger);
}

.success-inline {
  margin: 0;
  font-size: 12px;
  color: #4ade80;
}

@media (max-width: 768px) {
  .form-input-xs {
    font-size: 16px;
  }

  .btn-save {
    width: 100%;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* ── Light mode ──────────────────────────────────────────────── */
[data-theme="light"] .form-input {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(0, 0, 0, 0.12);
}
</style>
