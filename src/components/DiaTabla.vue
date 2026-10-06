<template>
  <section class="card dia-card">
    <header class="card-header">
      <span class="pill">Día {{ dia.numero }}</span>
      <h2>{{ dia.nombre }}</h2>
    </header>

    <div class="dia-meta" v-if="dia.movilidad || dia.activacion">
      <div v-if="dia.movilidad" class="meta-block">
        <span class="meta-label">Movilidad</span>
        <p class="meta-text">{{ dia.movilidad }}</p>
      </div>
      <div v-if="dia.activacion" class="meta-block">
        <span class="meta-label">Activación</span>
        <p class="meta-text">{{ dia.activacion }}</p>
      </div>
    </div>

    <div class="tabla-scroll">
      <table class="tabla">
        <thead>
          <tr>
            <th class="col-ejercicio" rowspan="2">Ejercicio</th>
            <th
              v-for="s in semanas"
              :key="s.id"
              colspan="3"
              class="col-semana"
              :class="{ activa: s.id === semanaActiva }"
              @click="$emit('seleccionar-semana', s.id)"
            >
              S{{ s.numero }}
            </th>
          </tr>
          <tr>
            <template v-for="s in semanas" :key="s.id">
              <th class="sub" :class="{ activa: s.id === semanaActiva }">Ser</th>
              <th class="sub" :class="{ activa: s.id === semanaActiva }">Rep</th>
              <th class="sub" :class="{ activa: s.id === semanaActiva }">Kg</th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fila in filas" :key="fila.ejercicio.id" @click="goDetalle(fila.ejercicio.id)">
            <td class="col-ejercicio">
              <span class="ej-nombre">{{ fila.ejercicio.catalogoEjercicio?.nombre ?? 'Ejercicio' }}</span>
              <span v-if="fila.ejercicio.codigo" class="pill pill-subtle">{{ fila.ejercicio.codigo }}</span>
            </td>
            <template v-for="(c, i) in fila.celdas" :key="semanas[i].id">
              <td class="num" :class="{ activa: semanas[i].id === semanaActiva }">{{ c.series }}</td>
              <td class="num" :class="{ activa: semanas[i].id === semanaActiva }">{{ c.reps }}</td>
              <td class="num kg" :class="{ activa: semanas[i].id === semanaActiva }">{{ c.kg }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <button v-if="mostrarEntrenar" type="button" class="btn-entrenar" @click="$emit('entrenar', diaIdActivo)">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      Entrenar este día (S{{ numeroActivo }})
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Dia, Ejercicio, EjercicioSemana, Semana } from '@/types';

const props = defineProps<{
  dia: Dia; // día de referencia (primera semana)
  semanas: Semana[];
  semanaActiva: number | null;
  mostrarEntrenar?: boolean;
}>();

defineEmits<{
  (e: 'entrenar', diaId: number): void;
  (e: 'seleccionar-semana', semanaId: number): void;
}>();

const router = useRouter();

interface Celda { series: string; reps: string; kg: string }

function diaDeSemana(s: Semana): Dia | undefined {
  return s.dias.find((d) => d.numero === props.dia.numero);
}

// Kg: lista por serie si varían, único si no
function formatKg(es: EjercicioSemana): string {
  const det = es.serieDetalles;
  if (det && det.length > 0) {
    const kgs = det.map((d) => d.kg ?? '—');
    if (!kgs.every((k) => k === kgs[0])) return kgs.join('/');
    return String(kgs[0]);
  }
  return es.kg != null ? String(es.kg) : '—';
}

function celdaDe(s: Semana, ej: Ejercicio): Celda {
  const candidatos = diaDeSemana(s)?.ejercicios.filter((e) => e.catalogoEjercicioId === ej.catalogoEjercicioId) ?? [];
  // El detalle de la semana puede vivir en el ejercicio propio de esa semana o en el de referencia
  const es =
    [...candidatos, ej]
      .flatMap((e) => e.ejercicioSemanas)
      .find((x) => x.semanaId === s.id) ?? candidatos[0]?.ejercicioSemanas[0];
  if (!es) return { series: '—', reps: '—', kg: '—' };
  const unidad = es.tipo_reps === 'seg' ? 's' : '';
  return { series: String(es.series), reps: `${es.reps}${unidad}`, kg: formatKg(es) };
}

const filas = computed(() =>
  props.dia.ejercicios.map((ejercicio) => ({
    ejercicio,
    celdas: props.semanas.map((s) => celdaDe(s, ejercicio)),
  })),
);

const semanaObj = computed(() => props.semanas.find((s) => s.id === props.semanaActiva) ?? props.semanas[0]);
const numeroActivo = computed(() => semanaObj.value?.numero ?? '');
const diaIdActivo = computed(() => (semanaObj.value ? diaDeSemana(semanaObj.value)?.id : undefined) ?? props.dia.id);

function goDetalle(id: number) {
  router.push({ name: 'ejercicio-detalle', params: { id } });
}
</script>

<style scoped>
.tabla-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -4px;
}

.tabla {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
  font-size: 13px;
}

.tabla th,
.tabla td {
  padding: 8px 6px;
  text-align: center;
  white-space: nowrap;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tabla thead th {
  color: var(--text-muted);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 500;
}

.col-semana {
  cursor: pointer;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.sub { font-size: 10px; opacity: 0.8; }

.tabla tbody td.num:nth-of-type(3n + 2) {
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.tabla .activa { background: var(--accent-soft); }
.col-semana.activa { color: var(--accent-strong); }

.col-ejercicio {
  position: sticky;
  left: 0;
  z-index: 1;
  text-align: left !important;
  min-width: 130px;
  max-width: 170px;
  white-space: normal !important;
  background: var(--bg-elevated);
}

.ej-nombre { display: block; font-weight: 500; line-height: 1.25; }

tbody tr { cursor: pointer; }
tbody tr:hover td { background: rgba(255, 255, 255, 0.03); }
tbody tr:hover td.col-ejercicio { background: var(--bg-elevated); }

.num { font-variant-numeric: tabular-nums; }
.kg { font-weight: 600; }

.btn-entrenar {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 10px 14px;
  margin-top: 8px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 92, 43, 0.35);
  background: rgba(255, 92, 43, 0.08);
  color: var(--accent-strong);
  font-size: 12px;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  justify-content: center;
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}

.btn-entrenar:hover {
  background: rgba(255, 92, 43, 0.16);
  box-shadow: var(--shadow-accent);
}
</style>
