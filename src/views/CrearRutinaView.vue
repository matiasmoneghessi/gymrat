<template>
  <section class="page page-crear">
    <header class="page-header rutina-header">
      <button class="back-btn" @click="goBack" aria-label="Volver">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <h1>Crear rutina</h1>
      <p>Definí el nombre, las semanas, los días y los ejercicios de tu nueva rutina.</p>
    </header>

    <!-- Importar desde Google Drive -->
    <div class="drive-import-bar card">
      <div class="drive-import-info">
        <svg width="18" height="18" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
          <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0a15.92 15.92 0 001.88 7.6L6.6 66.85z" fill="#0066DA"/>
          <path d="M43.65 25L29.9 1.2a15.92 15.92 0 00-3.3 3.3L1.88 47.5A15.92 15.92 0 000 55.1h27.5L43.65 25z" fill="#00AC47"/>
          <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25A15.92 15.92 0 0087.3 50h-27.5l5.85 11.2 7.9 15.6z" fill="#EA4335"/>
          <path d="M43.65 25L57.4 1.2A15.79 15.79 0 0050 0H37.3a15.79 15.79 0 00-7.4 1.2L43.65 25z" fill="#00832D"/>
          <path d="M59.8 55H27.5L13.75 78.8c1.35.8 2.9 1.2 4.5 1.2h51.1c1.6 0 3.15-.45 4.5-1.2L59.8 55z" fill="#2684FC"/>
          <path d="M73.4 27.5L59.65 4.5a15.92 15.92 0 00-3.3-3.3L43.65 25l16.15 30H87.3a15.92 15.92 0 00-1.88-7.6L73.4 27.5z" fill="#FFBA00"/>
        </svg>
        <span class="drive-import-label">Importar rutina desde Google Drive</span>
      </div>
      <button
        type="button"
        class="btn-drive"
        disabled
      >
        Abrir Drive
      </button>
    </div>
    <p v-if="driveError" class="error-banner">{{ driveError }}</p>
    <div v-if="driveParseOk" class="success-banner">✓ Rutina importada correctamente. Revisá los datos antes de guardar.</div>

    <!-- Nombre de rutina -->
    <div class="form-group">
      <label class="form-label">Nombre de la rutina</label>
      <input
        v-model="form.nombre"
        type="text"
        class="form-input"
        placeholder="Ej: Hipertrofia Fase 1"
      />
    </div>

    <!-- Semanas -->
    <section class="form-section">
      <div class="section-header">
        <h2 class="section-title">Semanas</h2>
        <button type="button" class="btn-add" @click="addSemana">+ Semana</button>
      </div>

      <div v-for="(semana, sIdx) in form.semanas" :key="sIdx" class="card semana-block">
        <div class="block-header">
          <span class="pill">Semana {{ sIdx + 1 }}</span>
          <button
            v-if="form.semanas.length > 1"
            type="button"
            class="btn-remove"
            @click="removeSemana(sIdx)"
          >
            Eliminar
          </button>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label">Nombre</label>
            <input
              v-model="semana.nombre"
              type="text"
              class="form-input"
              placeholder="Ej: Adaptación"
            />
          </div>
          <div class="form-group flex-1">
            <label class="form-label">Tipo de esfuerzo</label>
            <input
              v-model="semana.tipo_esfuerzo"
              type="text"
              class="form-input"
              placeholder="Ej: Moderado"
            />
          </div>
        </div>

        <!-- Días -->
        <div class="dias-section">
          <div class="section-header sub">
            <h3 class="section-subtitle">Días</h3>
            <button type="button" class="btn-add btn-add-sm" @click="addDia(sIdx)">+ Día</button>
          </div>

          <div v-for="(dia, dIdx) in semana.dias" :key="dIdx" class="dia-block">
            <div class="block-header">
              <span class="pill pill-subtle">Día {{ dIdx + 1 }}</span>
              <button
                v-if="semana.dias.length > 1"
                type="button"
                class="btn-remove btn-remove-sm"
                @click="removeDia(sIdx, dIdx)"
              >
                Eliminar
              </button>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Nombre</label>
                <input
                  v-model="dia.nombre"
                  type="text"
                  class="form-input"
                  placeholder="Ej: Tren superior"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Movilidad (opcional)</label>
                <input v-model="dia.movilidad" type="text" class="form-input" />
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Activación (opcional)</label>
                <input v-model="dia.activacion" type="text" class="form-input" />
              </div>
            </div>

            <!-- Ejercicios -->
            <div class="ejercicios-section">
              <div class="section-header sub">
                <h4 class="section-subtitle">Ejercicios</h4>
                <button
                  type="button"
                  class="btn-add btn-add-sm"
                  @click="addEjercicio(sIdx, dIdx)"
                >
                  + Ejercicio
                </button>
              </div>

              <div
                v-for="(ej, eIdx) in dia.ejercicios"
                :key="eIdx"
                class="ejercicio-block"
              >
                <div class="block-header">
                  <span class="pill pill-subtle">Ej {{ eIdx + 1 }}</span>
                  <button
                    v-if="dia.ejercicios.length > 1"
                    type="button"
                    class="btn-remove btn-remove-sm"
                    @click="removeEjercicio(sIdx, dIdx, eIdx)"
                  >
                    Eliminar
                  </button>
                </div>

                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label">Nombre</label>
                    <EjercicioSelect v-model="ej.nombre" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Código (opcional)</label>
                    <input
                      v-model="ej.codigo"
                      type="text"
                      class="form-input form-input-sm"
                      placeholder="Ej: A1"
                    />
                  </div>
                </div>

                <!-- Datos de esta semana -->
                <div class="semana-data-fields">
                  <div class="mini-field">
                    <label>Kg</label>
                    <input v-model.number="ej.kg" type="number" step="0.5" class="form-input form-input-xs" />
                  </div>
                  <div class="mini-field">
                    <label>
                      <button type="button" class="tipo-reps-toggle" @click="ej.tipo_reps = ej.tipo_reps === 'reps' ? 'seg' : 'reps'">
                        {{ ej.tipo_reps === 'seg' ? 'Seg' : 'Reps' }} ↕
                      </button>
                    </label>
                    <input v-model.number="ej.reps" type="number" class="form-input form-input-xs" />
                  </div>
                  <div class="mini-field">
                    <label>Series</label>
                    <input v-model.number="ej.series" type="number" class="form-input form-input-xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Submit -->
    <p v-if="error" class="error-banner">{{ error }}</p>

    <div class="form-actions">
      <button
        type="button"
        class="btn-action btn-submit"
        :disabled="saving"
        @click="handleSubmit"
      >
        {{ saving ? 'Guardando...' : 'Guardar rutina' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRutinaStore } from '@/stores/rutina';
import { useAuthStore } from '@/stores/auth';
import { useGoogleDrivePicker } from '@/composables/useGoogleDrivePicker';
import { importarRutinaDesdeTexto } from '@/services/api';
import EjercicioSelect from '@/components/EjercicioSelect.vue';

interface FormEjercicio {
  nombre: string;
  codigo: string;
  kg: number | null;
  reps: number;
  series: number;
  tipo_reps: 'reps' | 'seg';
}

interface FormDia {
  nombre: string;
  movilidad: string;
  activacion: string;
  ejercicios: FormEjercicio[];
}

interface FormSemana {
  nombre: string;
  tipo_esfuerzo: string;
  dias: FormDia[];
}

const router = useRouter();
const rutinaStore = useRutinaStore();
const authStore = useAuthStore();
const { pickAndDownload, loading: drivePickerLoading, error: drivePickerError } = useGoogleDrivePicker();

const saving = ref(false);
const driveLoading = ref(false);
const validationError = ref('');
const driveError = ref('');
const driveParseOk = ref(false);
const error = computed(() => validationError.value || rutinaStore.error);

// ─── Importar desde Google Drive con IA ──────────────────────────────────────

async function importarDesdeDrive() {
  driveError.value = '';
  driveParseOk.value = false;

  const token = authStore.session?.access_token;
  if (!token) {
    driveError.value = 'No hay sesión activa.';
    return;
  }

  // 1. Abrir el picker y descargar el archivo
  const result = await pickAndDownload();
  if (!result) {
    if (drivePickerError.value) driveError.value = drivePickerError.value;
    return;
  }

  // 2. Enviar el contenido al backend para que la IA lo procese
  driveLoading.value = true;
  try {
    const rutina = await importarRutinaDesdeTexto(result.content, result.fileName, token);

    // 3. Aplicar el resultado al formulario
    form.nombre = rutina.nombre;
    form.semanas.splice(
      0,
      form.semanas.length,
      ...rutina.semanas.map((s) => ({
        nombre: s.nombre,
        tipo_esfuerzo: s.tipo_esfuerzo,
        dias: s.dias.length > 0
          ? s.dias.map((d) => ({
              nombre: d.nombre,
              movilidad: d.movilidad ?? '',
              activacion: d.activacion ?? '',
              ejercicios: d.ejercicios.length > 0
                ? d.ejercicios.map((ej) => ({
                    nombre: ej.nombre,
                    codigo: ej.codigo ?? '',
                    kg: ej.kg,
                    reps: ej.reps,
                    series: ej.series,
                    tipo_reps: ej.tipo_reps,
                  }))
                : [makeEjercicio()],
            }))
          : [makeDia()],
      })),
    );

    driveParseOk.value = true;
    setTimeout(() => { driveParseOk.value = false; }, 6000);
  } catch (err: any) {
    driveError.value = err?.response?.data?.error?.message ?? err?.message ?? 'Error al procesar el archivo con IA.';
  } finally {
    driveLoading.value = false;
  }
}

function validateForm(): string | null {
  if (!form.nombre.trim()) return 'El nombre de la rutina es obligatorio.';
  if (form.nombre.trim().length > 200) return 'El nombre es demasiado largo (máx 200 caracteres).';
  for (const [sIdx, semana] of form.semanas.entries()) {
    for (const [dIdx, dia] of semana.dias.entries()) {
      for (const [eIdx, ej] of dia.ejercicios.entries()) {
        if (!ej.nombre.trim()) return `Falta el nombre del ejercicio ${eIdx + 1} en día ${dIdx + 1}, semana ${sIdx + 1}.`;
      }
    }
  }
  return null;
}

function makeEjercicio(): FormEjercicio {
  return { nombre: '', codigo: '', kg: null, reps: 0, series: 0, tipo_reps: 'reps' };
}

function makeDia(): FormDia {
  return { nombre: '', movilidad: '', activacion: '', ejercicios: [makeEjercicio()] };
}

function makeSemana(): FormSemana {
  return { nombre: '', tipo_esfuerzo: '', dias: [makeDia()] };
}

function copySemana(semana: FormSemana): FormSemana {
  return {
    nombre: '',
    tipo_esfuerzo: '',
    dias: semana.dias.map((dia) => ({
      nombre: dia.nombre,
      movilidad: dia.movilidad,
      activacion: dia.activacion,
      ejercicios: dia.ejercicios.map((ej) => ({ ...ej })),
    })),
  };
}

const form = reactive({
  nombre: '',
  semanas: [makeSemana()] as FormSemana[],
});

function addSemana() {
  const last = form.semanas[form.semanas.length - 1];
  form.semanas.push(copySemana(last));
}

function removeSemana(idx: number) {
  form.semanas.splice(idx, 1);
}

function addDia(sIdx: number) {
  form.semanas[sIdx].dias.push(makeDia());
}

function removeDia(sIdx: number, dIdx: number) {
  form.semanas[sIdx].dias.splice(dIdx, 1);
}

function addEjercicio(sIdx: number, dIdx: number) {
  form.semanas[sIdx].dias[dIdx].ejercicios.push(makeEjercicio());
}

function removeEjercicio(sIdx: number, dIdx: number, eIdx: number) {
  form.semanas[sIdx].dias[dIdx].ejercicios.splice(eIdx, 1);
}

function goBack() {
  router.push({ name: 'home' });
}

async function handleSubmit() {
  validationError.value = '';
  const vError = validateForm();
  if (vError) {
    validationError.value = vError;
    return;
  }

  saving.value = true;

  try {
    await rutinaStore.crearRutina({
      nombre: form.nombre.trim(),
      semanas: form.semanas.map((s, sIdx) => ({
        nombre: s.nombre.trim() || `Semana`,
        tipo_esfuerzo: s.tipo_esfuerzo.trim() || 'Normal',
        dias: s.dias.map((d) => ({
          nombre: d.nombre.trim() || `Día`,
          movilidad: d.movilidad.trim() || null,
          activacion: d.activacion.trim() || null,
          ejercicios: d.ejercicios.map((ej) => ({
            nombre: ej.nombre.trim() || 'Ejercicio',
            codigo: ej.codigo.trim() || null,
            ejercicioSemanas: [{ semanaNumero: sIdx + 1, kg: ej.kg, reps: ej.reps || 0, series: ej.series || 0, tipo_reps: ej.tipo_reps }],
          })),
        })),
      })),
    });
    router.push({ name: 'home' });
  } catch {
    // Error ya manejado por el store
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
/* ── Google Drive import ─────────────────────────────────────── */
.drive-import-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  flex-wrap: wrap;
}

.drive-import-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drive-import-label {
  font-size: 13px;
  font-weight: 600;
}

.drive-import-hint {
  font-size: 11px;
  color: var(--text-muted);
}

.btn-drive {
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(66, 133, 244, 0.4);
  background: rgba(66, 133, 244, 0.08);
  color: #4285f4;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  font-family: inherit;
  transition: background var(--transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-drive:hover:not(:disabled) {
  background: rgba(66, 133, 244, 0.16);
}

.btn-drive:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  filter: grayscale(1);
}

.success-banner {
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(74, 222, 128, 0.08);
  border: 1px solid rgba(74, 222, 128, 0.2);
  color: #4ade80;
  font-size: 13px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-header.sub {
  margin-top: 10px;
  margin-bottom: 4px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section-subtitle {
  margin: 0;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

.semana-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dia-block {
  padding: 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ejercicio-block {
  padding: 10px;
  border-radius: 10px;
  background: rgba(5, 6, 8, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
}

.form-input {
  padding: 10px 14px;
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: 15px;
  font-family: inherit;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input::placeholder {
  color: var(--text-muted);
  opacity: 0.55;
}

.form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.form-input-sm {
  max-width: 100px;
}

.form-input-xs {
  padding: 8px 6px;
  min-height: 44px;
  font-size: 14px;
  width: 100%;
  text-align: center;
}

.form-row {
  display: flex;
  gap: 10px;
}

.flex-1 {
  flex: 1;
}

.btn-add {
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  border: 1px dashed rgba(255, 92, 43, 0.4);
  background: transparent;
  color: var(--accent-strong);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-add:hover {
  background: rgba(255, 92, 43, 0.08);
}

.btn-add-sm {
  padding: 4px 10px;
  font-size: 11px;
}

.btn-remove {
  border: none;
  background: transparent;
  color: var(--danger);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background var(--transition-fast);
}

.btn-remove:hover {
  background: rgba(255, 59, 92, 0.14);
}

.btn-remove-sm {
  font-size: 10px;
}

.semana-data-grid {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
}

.semana-data-item {
  min-width: 130px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.semana-data-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--accent-strong);
  font-weight: 600;
}

.semana-data-fields {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  align-items: end;
}

.mini-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-field label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.tipo-reps-toggle {
  background: none;
  border: none;
  padding: 0;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--accent-strong);
  cursor: pointer;
  font-family: inherit;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.btn-submit {
  padding: 12px 28px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 92, 43, 0.4);
  background: linear-gradient(120deg, rgba(255, 92, 43, 0.2), rgba(5, 6, 8, 0.9));
  color: var(--accent-strong);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(255, 92, 43, 0.2);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dias-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ejercicios-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  /* Prevent iOS zoom on focus — must be 16px minimum */
  .form-input {
    font-size: 16px;
  }

  .form-input-xs {
    font-size: 16px;
    min-height: 48px;
    padding: 10px 6px;
  }

  /* Larger touch targets for add/remove buttons */
  .btn-add {
    min-height: 40px;
    padding: 10px 16px;
    font-size: 13px;
  }

  .btn-remove {
    min-height: 36px;
    padding: 8px 12px;
    font-size: 12px;
  }

  /* Tipo-reps toggle bigger hit area */
  .tipo-reps-toggle {
    font-size: 11px;
    min-height: 28px;
    display: inline-flex;
    align-items: center;
  }

  /* Full-width submit button */
  .form-actions {
    justify-content: stretch;
  }

  .btn-submit {
    width: 100%;
    min-height: 52px;
    font-size: 15px;
    justify-content: center;
  }
}

/* ── Light mode ──────────────────────────────────────────────── */
[data-theme="light"] .dia-block {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .ejercicio-block {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(0, 0, 0, 0.06);
}

[data-theme="light"] .form-input {
  background: #ffffff;
  border-color: var(--border-subtle);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

[data-theme="light"] .form-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
</style>
