<template>
  <section class="page page-rutina">
    <header class="page-header rutina-header">
      <div class="header-row">
        <button class="back-btn" @click="goBack" aria-label="Volver">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 v-if="rutina" class="rutina-title">{{ rutina.nombre }}</h1>
        <div v-if="rutina" class="rutina-actions">
          <button type="button" class="btn-share" @click="handleShare">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Compartir
          </button>
          <button type="button" class="btn-edit" @click="handleEdit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </button>
          <button type="button" class="btn-delete" @click="handleDelete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Eliminar
          </button>
        </div>
      </div>
    </header>

    <!-- Modal de link compartido -->
    <div v-if="shareLink" class="share-overlay" @click.self="shareLink = ''">
      <div class="share-modal">
        <p class="share-title">Link listo para compartir</p>
        <p class="share-expires">Expira en 30 minutos</p>
        <div class="share-link-row">
          <input readonly :value="shareLink" class="share-input" />
          <button type="button" class="btn-copy" @click="copyLink">
            {{ copied ? '¡Copiado!' : 'Copiar' }}
          </button>
        </div>
        <button type="button" class="btn-close-modal" @click="shareLink = ''">Cerrar</button>
      </div>
    </div>

    <LoadingSpinner v-if="loading" label="Cargando rutina..." />

    <p v-if="error" class="error-banner">
      {{ error }}
    </p>

    <!-- Selector de semanas -->
    <div v-if="rutina && rutina.semanas.length > 1 && !loading" class="semana-tabs">
      <button
        v-for="semana in rutina.semanas"
        :key="semana.id"
        type="button"
        class="semana-tab"
        :class="{ active: semanaActiva === semana.id }"
        @click="semanaActiva = semana.id"
      >
        S{{ semana.numero }} — {{ semana.nombre }}
      </button>
    </div>

    <!-- Contenido de la semana activa -->
    <div v-if="semanaSeleccionada && !loading">
      <div class="semana-info">
        <span class="pill">Semana {{ semanaSeleccionada.numero }}</span>
        <p class="rutina-subtitle">
          Tipo de esfuerzo: <span class="highlight">{{ semanaSeleccionada.tipo_esfuerzo }}</span>
        </p>
      </div>

      <section class="dias-grid">
        <DiaCard v-for="dia in semanaSeleccionada.dias" :key="dia.id" :dia="dia" />
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRutinaStore } from '@/stores/rutina';
import { useAuthStore } from '@/stores/auth';
import { shareRutina } from '@/services/api';
import DiaCard from '@/components/DiaCard.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';


const route = useRoute();
const router = useRouter();
const rutinaStore = useRutinaStore();
const authStore = useAuthStore();

const rutina = computed(() => rutinaStore.rutinaActual);
const loading = computed(() => rutinaStore.loading);
const error = computed(() => rutinaStore.error);

const semanaActiva = ref<number | null>(null);
const shareLink = ref('');
const copied = ref(false);

const semanaSeleccionada = computed(() => {
  if (!rutina.value) return null;
  return rutina.value.semanas.find((s) => s.id === semanaActiva.value) || rutina.value.semanas[0] || null;
});

// Seleccionar primera semana cuando carga la rutina
watch(rutina, (r) => {
  if (r && r.semanas.length > 0 && !semanaActiva.value) {
    semanaActiva.value = r.semanas[0].id;
  }
});

const load = () => {
  const idParam = route.params.id;
  const id = Number(idParam);
  if (Number.isNaN(id)) return;
  semanaActiva.value = null;
  rutinaStore.loadRutinaById(id);
};

onMounted(load);
watch(
  () => route.params.id,
  () => load(),
);

function goBack() {
  router.push({ name: 'home' });
}

function handleEdit() {
  const id = Number(route.params.id);
  router.push({ name: 'editar-rutina', params: { id } });
}

async function handleDelete() {
  const id = Number(route.params.id);
  await rutinaStore.eliminarRutina(id);
  router.push({ name: 'home' });
}

async function handleShare() {
  const id = Number(route.params.id);
  const token = authStore.session?.access_token;
  if (!token) return;
  try {
    const { token: shareToken } = await shareRutina(id, token);
    shareLink.value = `${window.location.origin}/compartir/${shareToken}`;
    copied.value = false;
  } catch {
    // silencioso
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(shareLink.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<style scoped>
/* ── Header layout ───────────────────────────────────────────── */
.header-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.rutina-title {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: clamp(17px, 4vw, 22px);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.2);
  color: var(--text);
  transform: translateX(-2px);
}

/* ── Header actions ──────────────────────────────────────────── */
.rutina-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.btn-share,
.btn-edit,
.btn-delete {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  font-size: 11px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition:
    background var(--transition-med),
    border-color var(--transition-med),
    color var(--transition-med);
}

.btn-share {
  background: rgba(96, 165, 250, 0.07);
  border-color: rgba(96, 165, 250, 0.2);
  color: #7ab8fc;
}

.btn-share:hover {
  background: rgba(96, 165, 250, 0.14);
  border-color: rgba(96, 165, 250, 0.35);
  color: #93c5fd;
}

.btn-edit {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text-muted);
}

.btn-edit:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.18);
  color: var(--text);
}

.btn-delete {
  background: rgba(255, 59, 92, 0.07);
  border-color: rgba(255, 59, 92, 0.2);
  color: #ff6b87;
}

.btn-delete:hover {
  background: rgba(255, 59, 92, 0.14);
  border-color: rgba(255, 59, 92, 0.35);
}

/* ── Share Modal ─────────────────────────────────────────────── */
.share-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.share-modal {
  background: var(--bg-elevated);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-strong);
  padding: 24px;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.share-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.share-expires {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.share-link-row {
  display: flex;
  gap: 8px;
}

.share-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 9px 12px;
  color: var(--text);
  font-size: 13px;
  min-width: 0;
  outline: none;
  transition: border-color var(--transition-fast);
}

.share-input:focus {
  border-color: rgba(96, 165, 250, 0.4);
}

.btn-copy {
  padding: 9px 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(96, 165, 250, 0.3);
  background: rgba(96, 165, 250, 0.1);
  color: #7ab8fc;
  font-size: 12px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-med), border-color var(--transition-med);
}

.btn-copy:hover {
  background: rgba(96, 165, 250, 0.18);
  border-color: rgba(96, 165, 250, 0.45);
}

.btn-close-modal {
  align-self: flex-end;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  padding: 4px 0;
  transition: color var(--transition-fast);
}

.btn-close-modal:hover {
  color: var(--text);
}

/* ── Semana Tabs ─────────────────────────────────────────────── */
.semana-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.semana-tab {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(5, 6, 8, 0.9);
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.semana-tab:hover {
  border-color: rgba(255, 255, 255, 0.16);
}

.semana-tab.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.semana-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.semana-info .rutina-subtitle {
  margin: 0;
}

@media (max-width: 768px) {
  .header-row {
    flex-wrap: wrap;
  }

  .rutina-title {
    /* back-btn + title fill first row, actions wrap below */
    flex: 1 1 0;
  }

  .rutina-actions {
    width: 100%;
  }

  .back-btn {
    width: 38px;
    height: 38px;
  }

  .btn-share,
  .btn-edit,
  .btn-delete {
    flex: 1;
    min-height: 38px;
    justify-content: center;
    font-size: 11px;
    padding: 8px 10px;
  }

  .share-modal {
    padding: 20px;
  }

  .share-link-row {
    flex-direction: column;
  }

  .share-input {
    width: 100%;
  }

  .btn-copy {
    width: 100%;
    min-height: 44px;
    justify-content: center;
    display: flex;
    align-items: center;
  }

  .semana-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    padding-bottom: 4px;
    /* Extend flush to screen edges and pull back with padding */
    margin-inline: -14px;
    padding-inline: 14px;
  }

  .semana-tabs::-webkit-scrollbar {
    display: none;
  }

  .semana-tab {
    flex-shrink: 0;
    scroll-snap-align: start;
    min-height: 44px;
    padding: 10px 18px;
    font-size: 13px;
  }

  .semana-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>
