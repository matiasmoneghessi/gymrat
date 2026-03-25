import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

const STORAGE_KEY = 'gymrat-theme';

function getInitialTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'dark' | 'light'>('dark');

  function applyTheme(t: 'dark' | 'light') {
    document.documentElement.setAttribute('data-theme', t);
  }

  function init() {
    theme.value = getInitialTheme();
    applyTheme(theme.value);
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }

  watch(theme, (t) => {
    applyTheme(t);
    localStorage.setItem(STORAGE_KEY, t);
  });

  return { theme, init, toggle };
});
