import { defineStore } from 'pinia';
import type { RutinaSummary, RutinaFull, CreateRutinaInput } from '@/types';
import { fetchRutinas, fetchRutinaById, createRutina, updateRutina, deleteRutina } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

interface RutinaState {
  rutinas: RutinaSummary[];
  rutinaActual: RutinaFull | null;
  loading: boolean;
  error: string | null;
}

export const useRutinaStore = defineStore('rutina', {
  state: (): RutinaState => ({
    rutinas: [],
    rutinaActual: null,
    loading: false,
    error: null,
  }),

  actions: {
    _getToken(): string {
      const authStore = useAuthStore();
      const token = authStore.session?.access_token;
      if (!token) throw new Error('No hay sesión activa.');
      return token;
    },

    async loadRutinas() {
      this.loading = true;
      this.error = null;
      try {
        this.rutinas = await fetchRutinas(this._getToken());
      } catch (err) {
        this.error = 'No se pudieron cargar las rutinas.';
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async loadRutinaById(id: number) {
      this.loading = true;
      this.error = null;
      try {
        this.rutinaActual = await fetchRutinaById(id, this._getToken());
      } catch (err) {
        this.error = 'No se pudo cargar la rutina.';
        this.rutinaActual = null;
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async crearRutina(data: CreateRutinaInput) {
      this.loading = true;
      this.error = null;
      try {
        await createRutina(data, this._getToken());
      } catch (err) {
        this.error = 'No se pudo crear la rutina.';
        // eslint-disable-next-line no-console
        console.error(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async editarRutina(id: number, data: CreateRutinaInput) {
      this.loading = true;
      this.error = null;
      try {
        await updateRutina(id, data, this._getToken());
      } catch (err) {
        this.error = 'No se pudo actualizar la rutina.';
        // eslint-disable-next-line no-console
        console.error(err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async eliminarRutina(id: number) {
      this.loading = true;
      this.error = null;
      try {
        await deleteRutina(id, this._getToken());
        this.rutinas = this.rutinas.filter((r) => r.id !== id);
      } catch (err) {
        this.error = 'No se pudo eliminar la rutina.';
        // eslint-disable-next-line no-console
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
});
