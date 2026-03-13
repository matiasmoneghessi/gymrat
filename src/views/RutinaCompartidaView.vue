<template>
  <section class="page page-compartida">
    <LoadingSpinner v-if="loading" label="Cargando rutina..." />

    <div v-if="error" class="expired-state">
      <p class="expired-icon">⏱</p>
      <h2>Link inválido o expirado</h2>
      <p class="expired-text">Este link de compartir duró 30 minutos y ya no es válido.</p>
      <RouterLink v-if="isAuthenticated" to="/" class="btn-action">Ir a mis rutinas</RouterLink>
      <RouterLink v-else to="/login" class="btn-action">Iniciar sesión</RouterLink>
    </div>

    <template v-if="rutina && !loading">
      <header class="page-header">
        <p class="pill">Rutina compartida</p>
        <h1>{{ rutina.nombre }}</h1>
        <p class="shared-subtitle">
          {{ rutina.semanas.length }} semana{{ rutina.semanas.length !== 1 ? 's' : '' }}
        </p>
      </header>

      <div class="clone-banner">
        <p>¿Querés guardar esta rutina en tu cuenta?</p>
        <button
          v-if="isAuthenticated"
          type="button"
          class="btn-clone"
          :disabled="cloning"
          @click="handleClone"
        >
          {{ cloning ? 'Guardando...' : 'Guardar en mi cuenta' }}
        </button>
        <RouterLink v-else to="/login" class="btn-clone">
          Iniciar sesión para guardarla
        </RouterLink>
      </div>

      <p v-if="cloneError" class="error-banner">{{ cloneError }}</p>
      <p v-if="cloneSuccess" class="success-banner">¡Rutina guardada en tu cuenta!</p>

      <section class="semanas-list">
        <div v-for="semana in rutina.semanas" :key="semana.id" class="card semana-card">
          <header class="card-header">
            <span class="pill">Semana {{ semana.numero }}</span>
            <h2>{{ semana.nombre }}</h2>
            <p class="semana-meta">{{ semana.tipo_esfuerzo }}</p>
          </header>
          <div class="dias-list">
            <div v-for="dia in semana.dias" :key="dia.id" class="dia-item">
              <p class="dia-nombre">Día {{ dia.numero }} — {{ dia.nombre }}</p>
              <ul class="ejercicios-list">
                <li v-for="ej in dia.ejercicios" :key="ej.id" class="ejercicio-item">
                  {{ ej.nombre }}
                  <span v-if="ej.codigo" class="pill pill-subtle">{{ ej.codigo }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { fetchRutinaByToken, cloneRutinaFromToken } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useRutinaStore } from '@/stores/rutina';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import type { RutinaFull } from '@/types';

const props = defineProps<{ token: string }>();

const router = useRouter();
const authStore = useAuthStore();
const rutinaStore = useRutinaStore();

const rutina = ref<RutinaFull | null>(null);
const loading = ref(true);
const error = ref(false);
const cloning = ref(false);
const cloneError = ref('');
const cloneSuccess = ref(false);

const isAuthenticated = computed(() => authStore.isAuthenticated);

onMounted(async () => {
  try {
    rutina.value = await fetchRutinaByToken(props.token);
  } catch {
    error.value = true;
  } finally {
    loading.value = false;
  }
});

async function handleClone() {
  const accessToken = authStore.session?.access_token;
  if (!accessToken) return;

  cloning.value = true;
  cloneError.value = '';
  try {
    await cloneRutinaFromToken(props.token, accessToken);
    rutinaStore.loadRutinas();
    cloneSuccess.value = true;
    setTimeout(() => router.push({ name: 'home' }), 1500);
  } catch {
    cloneError.value = 'No se pudo guardar la rutina. Probá de nuevo.';
  } finally {
    cloning.value = false;
  }
}
</script>

<style scoped>
.expired-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
}

.expired-icon {
  font-size: 48px;
  margin: 0;
}

.expired-text {
  color: var(--text-muted);
  margin: 0;
}

.shared-subtitle {
  color: var(--text-muted);
  margin: 4px 0 0;
}

.clone-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-radius: var(--radius-lg);
  background: rgba(255, 92, 43, 0.08);
  border: 1px solid rgba(255, 92, 43, 0.2);
  margin-bottom: 24px;
}

.clone-banner p {
  margin: 0;
  font-size: 14px;
  color: var(--text-muted);
}

.btn-clone {
  padding: 8px 18px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 92, 43, 0.4);
  background: rgba(255, 92, 43, 0.12);
  color: var(--accent-strong);
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  text-decoration: none;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.btn-clone:hover:not(:disabled) {
  background: rgba(255, 92, 43, 0.2);
  border-color: rgba(255, 92, 43, 0.6);
}

.btn-clone:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  text-decoration: none;
}

.semanas-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.semana-meta {
  font-size: 13px;
  color: var(--text-muted);
  margin: 4px 0 12px;
}

.dias-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dia-item {
  padding: 10px 14px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.dia-nombre {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--text);
}

.ejercicios-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ejercicio-item {
  font-size: 13px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.success-banner {
  color: #4ade80;
  font-size: 14px;
  text-align: center;
  padding: 10px;
}
</style>
