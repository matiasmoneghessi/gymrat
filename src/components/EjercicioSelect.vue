<template>
  <div class="ej-select" ref="containerRef">
    <input
      ref="inputRef"
      v-model="search"
      type="text"
      class="form-input"
      placeholder="Ej: Press banca"
      autocomplete="off"
      @focus="open = true"
      @input="open = true; cursor = canCreate ? 0 : 0"
      @keydown.escape.prevent="close"
      @keydown.enter.prevent="handleEnter"
      @keydown.down.prevent="moveCursor(1)"
      @keydown.up.prevent="moveCursor(-1)"
    />

    <ul v-if="open && (filtered.length > 0 || canCreate)" class="ej-dropdown">
      <li
        v-if="canCreate"
        class="ej-option ej-crear"
        :class="{ active: cursor === 0 }"
        @mousedown.prevent="crear"
      >
        <span v-if="!creando">+ Crear "{{ search.trim() }}"</span>
        <span v-else class="creando-text">Creando...</span>
      </li>
      <li
        v-for="(ej, i) in filtered"
        :key="ej.id"
        class="ej-option"
        :class="{ active: cursor === (canCreate ? i + 1 : i) }"
        @mousedown.prevent="select(ej.nombre)"
      >
        {{ ej.nombre }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useEjerciciosStore } from '@/stores/ejercicios';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const store = useEjerciciosStore();
const containerRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const open = ref(false);
const cursor = ref(0);
const creando = ref(false);
const search = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  if (val !== search.value) search.value = val;
});

watch(search, (val) => {
  emit('update:modelValue', val);
  cursor.value = 0;
});

onMounted(() => {
  store.loadEjercicios();
  document.addEventListener('mousedown', onClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside);
});

function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false;
  }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return store.ejercicios;
  return store.ejercicios.filter((e) => e.nombre.toLowerCase().includes(q));
});

const canCreate = computed(() => {
  const q = search.value.trim();
  if (!q) return false;
  return !store.ejercicios.some((e) => e.nombre.toLowerCase() === q.toLowerCase());
});

const totalOptions = computed(() => filtered.value.length + (canCreate.value ? 1 : 0));

function close() {
  open.value = false;
}

function select(nombre: string) {
  search.value = nombre;
  emit('update:modelValue', nombre);
  open.value = false;
}

async function crear() {
  const nombre = search.value.trim();
  if (!nombre || creando.value) return;
  creando.value = true;
  try {
    const nuevo = await store.crearEjercicio(nombre);
    select(nuevo.nombre);
  } catch {
    // Si falla la creación, al menos queda el texto escrito
    open.value = false;
  } finally {
    creando.value = false;
  }
}

function moveCursor(dir: 1 | -1) {
  if (totalOptions.value === 0) return;
  cursor.value = (cursor.value + dir + totalOptions.value) % totalOptions.value;
}

function handleEnter() {
  if (!open.value || totalOptions.value === 0) {
    open.value = false;
    return;
  }
  if (canCreate.value && cursor.value === 0) {
    crear();
  } else {
    const idx = canCreate.value ? cursor.value - 1 : cursor.value;
    if (filtered.value[idx]) {
      select(filtered.value[idx].nombre);
    }
  }
}
</script>

<style scoped>
.ej-select {
  position: relative;
  flex: 1;
}

.ej-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 100;
  background: #0d0f12;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 4px;
  margin: 0;
  list-style: none;
  max-height: 220px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.ej-option {
  padding: 8px 12px;
  border-radius: 7px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text);
  transition: background var(--transition-fast);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ej-option:hover,
.ej-option.active {
  background: rgba(255, 255, 255, 0.06);
}

.ej-crear {
  color: var(--accent-strong);
  font-weight: 600;
}

.ej-crear:hover,
.ej-crear.active {
  background: rgba(255, 92, 43, 0.12);
}

.creando-text {
  opacity: 0.6;
}
</style>
