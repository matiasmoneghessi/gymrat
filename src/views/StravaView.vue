<template>
  <section class="page page-strava">
    <div class="strava-header">
      <h2 class="strava-title">Strava</h2>
      <p class="strava-sub">Sincronizá tus sesiones de entrenamiento con Strava automáticamente.</p>
    </div>

    <!-- Notificaciones de callback OAuth -->
    <div v-if="callbackSuccess" class="banner banner-success">
      Strava conectado correctamente.
    </div>
    <div v-if="callbackError" class="banner banner-error">
      {{ callbackErrorMessage }}
    </div>

    <LoadingSpinner v-if="loading" label="Cargando estado de Strava..." />

    <div v-if="!loading" class="strava-card card">
      <!-- Estado: conectado -->
      <template v-if="status?.connected">
        <div class="status-row">
          <span class="status-dot connected" />
          <span class="status-label">Conectado</span>
          <span v-if="status.athleteId" class="status-athlete">Atleta #{{ status.athleteId }}</span>
        </div>
        <p class="strava-desc">
          Cuando finalizás una sesión podés sincronizarla a Strava como actividad de tipo
          <strong>WeightTraining</strong>.
        </p>
        <button class="btn-disconnect" :disabled="disconnecting" @click="handleDisconnect">
          {{ disconnecting ? 'Desconectando...' : 'Desconectar Strava' }}
        </button>
      </template>

      <!-- Estado: no conectado -->
      <template v-else>
        <div class="status-row">
          <span class="status-dot disconnected" />
          <span class="status-label">No conectado</span>
        </div>
        <p class="strava-desc">
          Conectá tu cuenta de Strava para registrar tus entrenamientos directamente desde GymRat.
        </p>
        <button class="btn-connect" :disabled="connecting" @click="handleConnect">
          {{ connecting ? 'Redirigiendo...' : 'Conectar con Strava' }}
        </button>
      </template>

      <p v-if="actionError" class="error-banner">{{ actionError }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { fetchStravaStatus, fetchStravaConnectUrl, disconnectStrava } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import type { StravaStatus } from '@/types';

const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const connecting = ref(false);
const disconnecting = ref(false);
const actionError = ref('');
const status = ref<StravaStatus | null>(null);

// Params del callback OAuth de Strava
const callbackSuccess = ref(route.query.connected === 'true');
const callbackError = ref(!!route.query.error);
const callbackErrorMessage = computed(() => {
  const err = route.query.error as string | undefined;
  if (err === 'access_denied') return 'Rechazaste la autorización en Strava.';
  if (err === 'invalid_callback') return 'Callback inválido. Intentá de nuevo.';
  return 'Ocurrió un error al conectar con Strava.';
});

async function loadStatus() {
  const token = authStore.session?.access_token;
  if (!token) return;
  try {
    status.value = await fetchStravaStatus(token);
  } catch {
    // silencio — no bloquea la vista
  } finally {
    loading.value = false;
  }
}

async function handleConnect() {
  const token = authStore.session?.access_token;
  if (!token) return;
  connecting.value = true;
  actionError.value = '';
  try {
    const url = await fetchStravaConnectUrl(token);
    window.location.href = url;
  } catch {
    actionError.value = 'No se pudo obtener la URL de Strava. Intentá de nuevo.';
    connecting.value = false;
  }
}

async function handleDisconnect() {
  const token = authStore.session?.access_token;
  if (!token) return;
  disconnecting.value = true;
  actionError.value = '';
  try {
    await disconnectStrava(token);
    status.value = { connected: false };
  } catch {
    actionError.value = 'No se pudo desconectar Strava. Intentá de nuevo.';
  } finally {
    disconnecting.value = false;
  }
}

onMounted(loadStatus);
</script>

<style scoped>
.page-strava {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
}

.strava-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.strava-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.strava-sub {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

/* ── Banners ──────────────────────────────────────────────────── */
.banner {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
}

.banner-success {
  background: rgba(52, 199, 89, 0.12);
  border: 1px solid rgba(52, 199, 89, 0.3);
  color: #34c759;
}

.banner-error {
  background: rgba(255, 59, 92, 0.1);
  border: 1px solid rgba(255, 59, 92, 0.25);
  color: #ff6b87;
}

/* ── Card ─────────────────────────────────────────────────────── */
.strava-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.connected {
  background: #34c759;
  box-shadow: 0 0 6px rgba(52, 199, 89, 0.6);
}

.status-dot.disconnected {
  background: var(--text-muted);
}

.status-label {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.status-athlete {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: auto;
}

.strava-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* ── Buttons ──────────────────────────────────────────────────── */
.btn-connect {
  padding: 12px 20px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(252, 76, 2, 0.5);
  background: rgba(252, 76, 2, 0.15);
  color: #fc4c02;
  font-size: 13px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}

.btn-connect:hover:not(:disabled) {
  background: rgba(252, 76, 2, 0.26);
  box-shadow: 0 0 14px rgba(252, 76, 2, 0.2);
}

.btn-connect:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-disconnect {
  align-self: flex-start;
  padding: 8px 14px;
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

.btn-disconnect:hover:not(:disabled) {
  background: rgba(255, 59, 92, 0.08);
  color: #ff6b87;
  border-color: rgba(255, 59, 92, 0.25);
}

.btn-disconnect:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Light mode ───────────────────────────────────────────────── */
[data-theme="light"] .btn-disconnect:hover:not(:disabled) {
  background: rgba(255, 59, 92, 0.06);
}
</style>
