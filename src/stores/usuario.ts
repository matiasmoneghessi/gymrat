import { defineStore } from 'pinia';
import type { Usuario } from '@/types';
import { fetchUsuarioActual } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

interface UsuarioState {
  usuario: Usuario | null;
  loading: boolean;
  error: string | null;
}

export const useUsuarioStore = defineStore('usuario', {
  state: (): UsuarioState => ({
    usuario: null,
    loading: false,
    error: null,
  }),

  getters: {
    nombreCompleto(state): string {
      return state.usuario?.nombre ?? '';
    },
    iniciales(state): string {
      if (!state.usuario?.nombre?.trim()) return '';
      const partes = state.usuario.nombre.trim().split(/\s+/);
      if (partes.length >= 2) {
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
      }
      const n = state.usuario.nombre;
      return (n[0] + (n[1] ?? '')).toUpperCase();
    },
  },

  actions: {
    async loadUsuarioActual() {
      this.loading = true;
      this.error = null;

      try {
        const authStore = useAuthStore();
        const accessToken = authStore.session?.access_token;

        if (!accessToken) {
          throw new Error('No hay sesión activa de Supabase.');
        }

        this.usuario = await fetchUsuarioActual(accessToken);
      } catch (err) {
        this.error = 'No se pudo cargar el usuario actual.';
        this.usuario = null;
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
});
