<template>
  <section class="page page-home">
    <header class="page-header">
      <h1>Tus rutinas</h1>
      <p>
        Acá podés ver tus rutinas de entrenamiento, crear una nueva o importar desde Google Drive.
      </p>
    </header>

    <div class="dashboard-actions">
      <button type="button" class="btn-action btn-crear" @click="goToCrear">
        + Crear rutina
      </button>
      <button type="button" class="btn-action btn-importar" disabled>
        Importar desde Drive
        <span class="badge-pronto">Próximamente</span>
      </button>
    </div>

    <LoadingSpinner v-if="loading" label="Cargando rutinas..." />

    <p v-if="error" class="error-banner">
      {{ error }}
    </p>

    <section v-if="!loading && !error && rutinas.length > 0" class="rutinas-grid">
      <article
        v-for="rutina in rutinas"
        :key="rutina.id"
        class="card rutina-card"
        @click="goToRutina(rutina.id)"
      >
        <h2 class="rutina-name">{{ rutina.nombre }}</h2>
        <div class="rutina-cta">
          <span>Ver rutina</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </div>
      </article>
    </section>

<section v-if="!loading && !error && rutinas.length === 0" class="empty-state">
      <p class="empty-text">Todavía no tenés ninguna rutina.</p>
      <button type="button" class="btn-action btn-crear" @click="goToCrear">
        Creá tu primera rutina
      </button>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRutinaStore } from '@/stores/rutina';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const router = useRouter();
const rutinaStore = useRutinaStore();

const rutinas = computed(() => rutinaStore.rutinas);
const loading = computed(() => rutinaStore.loading);
const error = computed(() => rutinaStore.error);

onMounted(() => {
  rutinaStore.loadRutinas();
});

function goToCrear() {
  router.push({ name: 'crear-rutina' });
}

function goToRutina(id: number) {
  router.push({ name: 'rutina', params: { id } });
}
</script>

<style scoped>
/* ── Dashboard Actions ───────────────────────────────────────── */
.dashboard-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(5, 6, 8, 0.85);
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  transition:
    background var(--transition-med),
    border-color var(--transition-med),
    box-shadow var(--transition-med),
    transform var(--transition-med);
}

.btn-action:hover:not(:disabled) {
  background: rgba(14, 16, 24, 0.95);
  border-color: rgba(255, 255, 255, 0.16);
  transform: translateY(-1px);
  box-shadow: var(--shadow-soft);
}

.btn-crear {
  background: linear-gradient(120deg, rgba(255, 92, 43, 0.14), rgba(5, 6, 8, 0.9));
  border-color: rgba(255, 92, 43, 0.28);
  color: var(--accent-strong);
}

.btn-crear:hover:not(:disabled) {
  box-shadow: var(--shadow-accent);
}

.btn-importar {
  opacity: 0.45;
  cursor: not-allowed;
}

.badge-pronto {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  letter-spacing: 0.1em;
}

/* ── Rutina Card Content ─────────────────────────────────────── */
.rutina-name {
  margin: 0 0 14px;
  font-size: 17px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1.3;
}

/* ── Card CTA row ────────────────────────────────────────────── */
.rutina-cta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--accent-strong);
  padding-top: 2px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  transition: gap var(--transition-fast);
}

.rutina-card:hover .rutina-cta {
  gap: 10px;
}

/* ── Empty State ─────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 20px;
  text-align: center;
}

.empty-text {
  color: var(--text-muted);
  font-size: 15px;
  margin: 0;
}

/* ── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .dashboard-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
    min-height: 50px;
    font-size: 14px;
    padding: 14px 20px;
  }

}

@media (prefers-reduced-motion: reduce) {
  .btn-action {
    transition: none;
  }
}
</style>
