import { defineStore } from 'pinia';
import type { EjercicioCatalogo } from '@/types';
import { fetchEjercicios, createEjercicioCatalogo } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

interface EjerciciosState {
  ejercicios: EjercicioCatalogo[];
  loaded: boolean;
  loading: boolean;
}

export const useEjerciciosStore = defineStore('ejercicios', {
  state: (): EjerciciosState => ({
    ejercicios: [],
    loaded: false,
    loading: false,
  }),

  actions: {
    _getToken(): string {
      const authStore = useAuthStore();
      const token = authStore.session?.access_token;
      if (!token) throw new Error('No hay sesión activa.');
      return token;
    },

    async loadEjercicios() {
      if (this.loaded) return;
      this.loading = true;
      try {
        this.ejercicios = await fetchEjercicios(this._getToken());
        this.loaded = true;
      } catch {
        // Si falla la carga, se puede seguir escribiendo manualmente
      } finally {
        this.loading = false;
      }
    },

    async crearEjercicio(nombre: string): Promise<EjercicioCatalogo> {
      const nuevo = await createEjercicioCatalogo(nombre, this._getToken());
      this.ejercicios.push(nuevo);
      return nuevo;
    },
  },
});
