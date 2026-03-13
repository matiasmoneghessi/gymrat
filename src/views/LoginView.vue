<template>
  <section class="page page-login">
    <header class="page-header">
      <h1>Entrá con tu cuenta</h1>
      <p>
        Si sos un
        <span class="highlight">gymrat</span>
        de verdad, ya sabés qué hacer.
      </p>
    </header>

    <section class="login-card">
      <p class="login-subtitle">
        Entrá con tu cuenta de Google y empezá a registrar tus entrenamientos.
      </p>

      <div class="login-actions">
        <div ref="googleBtnRef" class="google-btn-wrapper"></div>
      </div>

      <p v-if="error" class="error-banner">
        {{ error }}
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

declare const google: { accounts: { id: { initialize: (cfg: object) => void; renderButton: (el: HTMLElement, cfg: object) => void } } };

const authStore = useAuthStore();
const error = computed(() => authStore.error);
const googleBtnRef = ref<HTMLElement | null>(null);

onMounted(() => {
  const init = () => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID as string,
      callback: (response: { credential: string }) => {
        authStore.signInWithGoogleToken(response.credential);
      },
    });

    if (googleBtnRef.value) {
      google.accounts.id.renderButton(googleBtnRef.value, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        logo_alignment: 'left',
        width: googleBtnRef.value.offsetWidth || 300,
      });
    }
  };

  if (typeof google !== 'undefined') {
    init();
  } else {
    window.addEventListener('load', init, { once: true });
  }
});
</script>

<style scoped>
.page-login {
  max-width: 520px;
}

.login-card {
  margin-top: 10px;
  padding: 18px 18px 20px;
  border-radius: var(--radius-lg);
  background: radial-gradient(circle at 0 0, rgba(255, 255, 255, 0.06), transparent 50%), var(--bg-elevated);
  border: 1px solid rgba(255, 255, 255, 0.04);
  box-shadow: var(--shadow-strong);
}

.login-subtitle {
  margin: 0 0 18px;
  font-size: 14px;
  color: var(--text-muted);
}

.login-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.google-btn-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>

