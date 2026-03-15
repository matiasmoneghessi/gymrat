import { defineStore } from 'pinia';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  _initialized: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    session: null,
    user: null,
    loading: false,
    error: null,
    _initialized: false,
  }),

  getters: {
    isAuthenticated(state): boolean {
      return !!state.session && !!state.user;
    },
  },

  actions: {
    async init() {
      if (this._initialized) return;
      this._initialized = true;

      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        this.session = data.session ?? null;
        this.user = data.session?.user ?? null;
      } catch (err) {
        if (import.meta.env.DEV) console.error('[Auth] Error al inicializar sesión', err);
        this.error = 'No se pudo comprobar la sesión actual.';
      } finally {
        this.loading = false;
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        this.session = session ?? null;
        this.user = session?.user ?? null;
      });
    },

    async signInWithGoogle() {
      this.error = null;
      this.loading = true;

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) throw error;
      } catch (err) {
        if (import.meta.env.DEV) console.error('[Auth] Error al iniciar sesión con Google', err);
        this.error = 'No se pudo iniciar sesión con Google. Probá de nuevo.';
      } finally {
        this.loading = false;
      }
    },

    async signInWithGoogleToken(token: string) {
      this.error = null;
      this.loading = true;

      try {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token,
        });

        if (error) throw error;
      } catch (err) {
        if (import.meta.env.DEV) console.error('[Auth] Error al iniciar sesión con token de Google', err);
        this.error = 'No se pudo iniciar sesión con Google. Probá de nuevo.';
      } finally {
        this.loading = false;
      }
    },

    async signOut() {
      this.loading = true;
      this.error = null;

      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        this.session = null;
        this.user = null;
      } catch (err) {
        if (import.meta.env.DEV) console.error('[Auth] Error al cerrar sesión', err);
        this.error = 'No se pudo cerrar sesión. Probá de nuevo.';
      } finally {
        this.loading = false;
      }
    },
  },
});

