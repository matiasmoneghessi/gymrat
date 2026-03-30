<template>
  <div class="app-shell">
    <header v-if="!isLoginRoute" class="app-header">
      <div class="brand">
        <span class="brand-mark">{{ iniciales || '—' }}</span>
        <div class="brand-text">
          <h1>THE GymRat</h1>
          <p>Rutinas de gimnasio afinadas al milímetro</p>
        </div>
      </div>
      <nav class="app-nav">
        <RouterLink to="/" class="nav-link">Rutinas</RouterLink>
        <RouterLink to="/strava" class="nav-link">Strava</RouterLink>
        <ThemeToggle />
        <button class="btn-signout" @click="authStore.signOut()">Salir</button>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <!-- Theme toggle on login page (top-right corner) -->
    <div v-if="isLoginRoute" class="login-theme-toggle">
      <ThemeToggle />
    </div>

    <footer v-if="!isLoginRoute" class="app-footer">
      <span>Hecho para entrenar en serio, no para scrollear.</span>
    </footer>

    <!-- Mobile bottom navigation -->
    <nav v-if="!isLoginRoute" class="mobile-nav" aria-label="Navegación principal">
      <RouterLink to="/" class="mobile-nav-item" aria-label="Mis rutinas">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Rutinas</span>
      </RouterLink>
      <RouterLink to="/strava" class="mobile-nav-item" aria-label="Strava">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span>Strava</span>
      </RouterLink>
      <ThemeToggle class="mobile-nav-item mobile-theme-toggle" />
      <button class="mobile-nav-item" @click="authStore.signOut()" aria-label="Cerrar sesión">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Salir</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { useUsuarioStore } from '@/stores/usuario';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';
import ThemeToggle from '@/components/ThemeToggle.vue';

const route = useRoute();
const router = useRouter();
const usuarioStore = useUsuarioStore();
const authStore = useAuthStore();
const themeStore = useThemeStore();
themeStore.init();

const iniciales = computed(() => usuarioStore.iniciales);
const isLoginRoute = computed(() => route.name === 'login');

// Reaccionar a cambios de autenticación (incluye OAuth callback)
watch(
  () => authStore.isAuthenticated,
  (authenticated) => {
    if (authenticated) {
      usuarioStore.loadUsuarioActual();
      // Si estamos en login después de un OAuth callback, ir a home
      if (route.name === 'login') {
        router.push({ name: 'home' });
      }
    } else {
      usuarioStore.$reset();
      router.push({ name: 'login' });
    }
  },
);

onMounted(() => {
  if (authStore.isAuthenticated) {
    usuarioStore.loadUsuarioActual();
  }
});
</script>

<style scoped>
.login-theme-toggle {
  position: fixed;
  top: 18px;
  right: 20px;
  z-index: 100;
}

@media (max-width: 768px) {
  .mobile-theme-toggle {
    flex-direction: column;
    gap: 3px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }
}
</style>

