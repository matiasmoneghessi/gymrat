<template>
  <div class="app-shell">
    <header v-if="!isLoginRoute" class="app-header">
      <div class="brand">
        <span class="brand-mark">{{ iniciales || '—' }}</span>
        <div class="brand-text">
          <h1>GymRat</h1>
          <p>Rutinas de gimnasio afinadas al milímetro</p>
        </div>
      </div>
      <nav class="app-nav">
        <RouterLink to="/" class="nav-link">Rutinas</RouterLink>
        <button class="btn-signout" @click="authStore.signOut()">Salir</button>
      </nav>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <footer v-if="!isLoginRoute" class="app-footer">
      <span>Hecho para entrenar en serio, no para scrollear.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { useUsuarioStore } from '@/stores/usuario';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const usuarioStore = useUsuarioStore();
const authStore = useAuthStore();

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

