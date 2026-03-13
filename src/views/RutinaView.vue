<template>
  <section class="page page-rutina">
    <header class="page-header rutina-header">
      <button class="back-btn" @click="goBack">← Volver</button>
      <div v-if="rutina" class="rutina-title">
        <h1>{{ rutina.nombre }}</h1>
      </div>
    </header>

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
import DiaCard from '@/components/DiaCard.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const route = useRoute();
const router = useRouter();
const rutinaStore = useRutinaStore();

const rutina = computed(() => rutinaStore.rutinaActual);
const loading = computed(() => rutinaStore.loading);
const error = computed(() => rutinaStore.error);

const semanaActiva = ref<number | null>(null);

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
</script>

<style scoped>
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
</style>
