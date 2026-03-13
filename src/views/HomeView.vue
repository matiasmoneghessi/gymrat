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
        <header class="card-header">
          <h2>{{ rutina.nombre }}</h2>
        </header>
        <footer class="card-footer">
          <span class="cta">Ver detalle</span>
          <div class="card-actions">
            <button type="button" class="btn-share" @click.stop="handleShare(rutina.id)">
              Compartir
            </button>
            <button type="button" class="btn-edit" @click.stop="handleEdit(rutina.id)">
              Editar
            </button>
            <button type="button" class="btn-delete" @click.stop="handleDelete(rutina.id)">
              Eliminar
            </button>
          </div>
        </footer>
      </article>
    </section>

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

    <section v-if="!loading && !error && rutinas.length === 0" class="empty-state">
      <p class="empty-text">Todavía no tenés ninguna rutina.</p>
      <button type="button" class="btn-action btn-crear" @click="goToCrear">
        Creá tu primera rutina
      </button>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRutinaStore } from '@/stores/rutina';
import { useAuthStore } from '@/stores/auth';
import { shareRutina } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const router = useRouter();
const rutinaStore = useRutinaStore();
const authStore = useAuthStore();

const rutinas = computed(() => rutinaStore.rutinas);
const loading = computed(() => rutinaStore.loading);
const error = computed(() => rutinaStore.error);

const shareLink = ref('');
const copied = ref(false);

onMounted(() => {
  rutinaStore.loadRutinas();
});

function goToCrear() {
  router.push({ name: 'crear-rutina' });
}

function goToRutina(id: number) {
  router.push({ name: 'rutina', params: { id } });
}

function handleEdit(id: number) {
  router.push({ name: 'editar-rutina', params: { id } });
}

function handleDelete(id: number) {
  rutinaStore.eliminarRutina(id);
}

async function handleShare(id: number) {
  const token = authStore.session?.access_token;
  if (!token) return;
  try {
    const { token: shareToken } = await shareRutina(id, token);
    shareLink.value = `${window.location.origin}/compartir/${shareToken}`;
    copied.value = false;
  } catch {
    // silencioso, el usuario puede reintentar
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(shareLink.value);
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
}
</script>

<style scoped>
.dashboard-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(5, 6, 8, 0.9);
  color: var(--text);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
}

.btn-action:hover:not(:disabled) {
  background: rgba(12, 14, 20, 0.95);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-1px);
}

.btn-crear {
  background: linear-gradient(120deg, rgba(255, 92, 43, 0.15), rgba(5, 6, 8, 0.9));
  border-color: rgba(255, 92, 43, 0.3);
  color: var(--accent-strong);
}

.btn-importar {
  opacity: 0.5;
  cursor: not-allowed;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.badge-pronto {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
  letter-spacing: 0.1em;
}

.card-actions {
  display: flex;
  gap: 6px;
}

.btn-share {
  border: none;
  background: transparent;
  color: #60a5fa;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background var(--transition-fast);
}

.btn-share:hover {
  background: rgba(96, 165, 250, 0.1);
}

.share-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
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
  padding: 24px;
  width: 100%;
  max-width: 480px;
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
  padding: 8px 12px;
  color: var(--text);
  font-size: 13px;
  min-width: 0;
}

.btn-copy {
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(96, 165, 250, 0.3);
  background: rgba(96, 165, 250, 0.1);
  color: #60a5fa;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast);
}

.btn-copy:hover {
  background: rgba(96, 165, 250, 0.2);
}

.btn-close-modal {
  align-self: flex-end;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  padding: 4px 0;
}

.btn-close-modal:hover {
  color: var(--text);
}

.btn-edit {
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.btn-edit:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text);
}

.btn-delete {
  border: none;
  background: transparent;
  color: var(--danger);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background var(--transition-fast);
}

.btn-delete:hover {
  background: rgba(255, 59, 92, 0.14);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;
}

.empty-text {
  color: var(--text-muted);
  font-size: 15px;
  margin: 0;
}
</style>
