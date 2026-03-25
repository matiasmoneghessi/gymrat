<template>
  <div class="login-root">
    <!-- Decorative background orbs -->
    <div class="orb orb-1" aria-hidden="true"></div>
    <div class="orb orb-2" aria-hidden="true"></div>
    <div class="orb orb-3" aria-hidden="true"></div>

    <div class="login-wrap">
      <!-- Brand lockup -->
      <div class="login-brand">
        <img src="/logo.png" alt="GymRat logo" class="login-logo" />
      </div>

      <!-- Hero copy -->
      <div class="login-hero">
        <h1 class="login-headline">
          Entrená en<br />
          <span class="login-headline-accent">serio.</span>
        </h1>
        <p class="login-tagline">
          Registrá cada rep, cada serie y cada PR. Todo en un solo lugar.
        </p>
      </div>

      <!-- Feature highlights -->
      <ul class="login-features" aria-label="Características">
        <li class="feature-item">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3" stroke-linecap="round"/>
          </svg>
          <span>Rutinas personalizadas</span>
        </li>
        <li class="feature-item">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M3 3v18h18" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M7 16l4-5 4 3 4-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Seguí tu progreso</span>
        </li>
        <li class="feature-item">
          <svg class="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Batí tus PRs</span>
        </li>
      </ul>

      <!-- Login card -->
      <div class="login-card">
        <p class="login-card-label">Accedé con tu cuenta de Google</p>

        <div class="login-card-divider" aria-hidden="true">
          <span></span>
        </div>

        <div class="login-actions">
          <div ref="googleBtnRef" class="google-btn-wrapper" aria-label="Botón de inicio de sesión con Google"></div>
        </div>

        <p v-if="error" class="error-banner" role="alert">
          {{ error }}
        </p>

        <p class="login-card-note">
          Al continuar aceptás los
          <a href="#" class="login-link" tabindex="0">términos de uso</a>
          y la
          <a href="#" class="login-link" tabindex="0">política de privacidad</a>.
        </p>
      </div>

      <!-- Footer -->
      <p class="login-footer">Sólo para gymrats de verdad.</p>
    </div>
  </div>
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
/* ── Root: full-viewport centered layout ───────────────────── */
.login-root {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  overflow-y: auto;
  z-index: 0;
}

/* ── Decorative orbs ─────────────────────────────────────────── */
.orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
  filter: blur(80px);
}

.orb-1 {
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(255, 92, 43, 0.18) 0%, transparent 70%);
  top: -60px;
  right: -80px;
  animation: orb-drift 12s ease-in-out infinite alternate;
}

.orb-2 {
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, rgba(255, 59, 92, 0.12) 0%, transparent 70%);
  bottom: 10%;
  left: -60px;
  animation: orb-drift 16s ease-in-out infinite alternate-reverse;
}

.orb-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 123, 76, 0.1) 0%, transparent 70%);
  top: 40%;
  left: 50%;
  transform: translateX(-50%);
  animation: orb-drift 9s ease-in-out infinite alternate;
}

@keyframes orb-drift {
  from { transform: translate(0, 0); }
  to   { transform: translate(18px, 22px); }
}

@media (prefers-reduced-motion: reduce) {
  .orb { animation: none; }
}

/* ── Wrapper ─────────────────────────────────────────────────── */
.login-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  width: 100%;
  max-width: 420px;
  animation: fade-up 380ms ease-out both;
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .login-wrap { animation: none; }
}

/* ── Brand ───────────────────────────────────────────────────── */
.login-brand {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-logo {
  width: 96px;
  height: 96px;
  object-fit: contain;
  filter: drop-shadow(0 8px 28px rgba(255, 92, 43, 0.45)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
  transition: filter 300ms ease, transform 300ms ease;
}

.login-logo:hover {
  filter: drop-shadow(0 10px 36px rgba(255, 92, 43, 0.6)) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.5));
  transform: scale(1.04);
}

/* ── Hero copy ───────────────────────────────────────────────── */
.login-hero {
  text-align: center;
}

.login-headline {
  margin: 0 0 10px;
  font-family: 'Bebas Neue', system-ui;
  font-size: clamp(52px, 11vw, 72px);
  letter-spacing: 0.06em;
  line-height: 0.92;
  text-transform: uppercase;
  color: var(--text);
}

.login-headline-accent {
  color: var(--accent-strong);
  display: block;
}

.login-tagline {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 320px;
  margin-inline: auto;
}

/* ── Feature highlights ──────────────────────────────────────── */
.login-features {
  display: flex;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
  justify-content: center;
}

.feature-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: rgba(255, 255, 255, 0.03);
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.04em;
  transition: border-color var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
  cursor: default;
}

.feature-item:hover {
  border-color: rgba(255, 92, 43, 0.3);
  background: rgba(255, 92, 43, 0.06);
  color: var(--accent-strong);
}

.feature-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--accent);
}

/* ── Login card ──────────────────────────────────────────────── */
.login-card {
  width: 100%;
  padding: 24px 24px 20px;
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 0% 0%, rgba(255, 92, 43, 0.07), transparent 55%),
    var(--bg-elevated);
  border: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow:
    var(--shadow-strong),
    0 0 0 1px rgba(255, 92, 43, 0.04) inset;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.login-card-label {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  text-align: center;
}

.login-card-divider {
  display: flex;
  align-items: center;
  gap: 10px;
}

.login-card-divider span {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
}

.login-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.google-btn-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

.login-card-note {
  margin: 0;
  font-size: 11px;
  color: rgba(162, 165, 179, 0.6);
  text-align: center;
  line-height: 1.6;
}

.login-link {
  color: var(--text-muted);
  text-decoration: underline;
  text-decoration-color: rgba(162, 165, 179, 0.3);
  text-underline-offset: 2px;
  transition: color var(--transition-fast);
}

.login-link:hover {
  color: var(--accent-strong);
  text-decoration-color: var(--accent-strong);
}

.login-link:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}

/* ── Error ───────────────────────────────────────────────────── */
.error-banner {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 59, 92, 0.12);
  border: 1px solid rgba(255, 59, 92, 0.3);
  color: #ffd5de;
  font-size: 13px;
  margin: 0;
  text-align: center;
}

/* ── Footer ──────────────────────────────────────────────────── */
.login-footer {
  margin: 0;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: rgba(162, 165, 179, 0.4);
  text-align: center;
}

/* ── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .login-root {
    align-items: flex-start;
    padding-top: 40px;
    padding-bottom: 40px;
  }

  .login-wrap {
    gap: 24px;
  }

  .login-card {
    padding: 22px 18px 18px;
  }

  .login-headline {
    font-size: clamp(48px, 14vw, 64px);
  }
}

/* ── Light mode ──────────────────────────────────────────────── */
[data-theme="light"] .feature-item {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
}

[data-theme="light"] .feature-item:hover {
  background: rgba(255, 92, 43, 0.08);
  border-color: rgba(255, 92, 43, 0.25);
}

[data-theme="light"] .login-card {
  border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .login-card-divider span {
  background: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .error-banner {
  color: #8b0020;
}

[data-theme="light"] .login-footer {
  color: rgba(90, 98, 120, 0.6);
}

[data-theme="light"] .login-card-note {
  color: rgba(90, 98, 120, 0.8);
}
</style>
