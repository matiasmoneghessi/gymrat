<template>
  <button
    class="theme-toggle"
    @click="themeStore.toggle()"
    :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    :title="isDark ? 'Modo claro' : 'Modo oscuro'"
  >
    <span class="toggle-track" :class="{ 'is-light': !isDark }">
      <span class="toggle-thumb">
        <!-- Moon -->
        <svg v-if="isDark" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <!-- Sun -->
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      </span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/stores/theme';

const themeStore = useThemeStore();
const isDark = computed(() => themeStore.theme === 'dark');
</script>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle-track {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition:
    background var(--transition-med),
    border-color var(--transition-med);
  display: flex;
  align-items: center;
}

.toggle-track.is-light {
  background: rgba(255, 92, 43, 0.15);
  border-color: rgba(255, 92, 43, 0.35);
}

.toggle-thumb {
  position: absolute;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg);
  transition:
    left var(--transition-med),
    background var(--transition-med);
}

.toggle-track.is-light .toggle-thumb {
  left: calc(100% - 21px);
  background: var(--accent);
  color: #fff;
}

.theme-toggle:focus-visible .toggle-track {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
