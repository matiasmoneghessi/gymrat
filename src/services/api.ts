import axios from 'axios';
import type {
  Semana,
  SemanaSummary,
  Usuario,
  RutinaSummary,
  RutinaFull,
  CreateRutinaInput,
  ShareTokenResponse,
  EjercicioCatalogo,
  EjercicioDetalle,
  SerieDetalle,
  CreateSesionInput,
  SesionResumen,
} from '@/types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 35000,
});

function authHeaders(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export async function fetchUsuarioActual(accessToken: string): Promise<Usuario> {
  const { data } = await api.get<{ success: boolean; data: Usuario }>(
    '/usuarios/me',
    authHeaders(accessToken),
  );
  return data.data;
}

export async function fetchSemanas(): Promise<SemanaSummary[]> {
  const { data } = await api.get<{ success: boolean; data: SemanaSummary[] }>('/semanas');
  return data.data;
}

export async function fetchSemanaById(id: number): Promise<Semana> {
  const { data } = await api.get<{ success: boolean; data: Semana }>(`/semanas/${id}`);
  return data.data;
}

// Rutinas

export async function fetchRutinas(token: string): Promise<RutinaSummary[]> {
  const { data } = await api.get<{ success: boolean; data: RutinaSummary[] }>(
    '/rutinas',
    authHeaders(token),
  );
  return data.data;
}

export async function fetchRutinaById(id: number, token: string): Promise<RutinaFull> {
  const { data } = await api.get<{ success: boolean; data: RutinaFull }>(
    `/rutinas/${id}`,
    authHeaders(token),
  );
  return data.data;
}

export async function createRutina(
  input: CreateRutinaInput,
  token: string,
): Promise<RutinaFull> {
  const { data } = await api.post<{ success: boolean; data: RutinaFull }>(
    '/rutinas',
    input,
    authHeaders(token),
  );
  return data.data;
}

export async function updateRutina(
  id: number,
  input: CreateRutinaInput,
  token: string,
): Promise<RutinaFull> {
  const { data } = await api.put<{ success: boolean; data: RutinaFull }>(
    `/rutinas/${id}`,
    input,
    authHeaders(token),
  );
  return data.data;
}

export async function deleteRutina(id: number, token: string): Promise<void> {
  await api.delete(`/rutinas/${id}`, authHeaders(token));
}

export async function shareRutina(id: number, token: string): Promise<ShareTokenResponse> {
  const { data } = await api.post<{ success: boolean; data: ShareTokenResponse }>(
    `/rutinas/${id}/share`,
    {},
    authHeaders(token),
  );
  return data.data;
}

export async function fetchRutinaByToken(shareToken: string): Promise<RutinaFull> {
  const { data } = await api.get<{ success: boolean; data: RutinaFull }>(
    `/rutinas/compartir/${shareToken}`,
  );
  return data.data;
}

export async function cloneRutinaFromToken(shareToken: string, token: string): Promise<RutinaFull> {
  const { data } = await api.post<{ success: boolean; data: RutinaFull }>(
    `/rutinas/compartir/${shareToken}/clonar`,
    {},
    authHeaders(token),
  );
  return data.data;
}

// Ejercicios catálogo

export async function fetchEjercicios(token: string): Promise<EjercicioCatalogo[]> {
  const { data } = await api.get<{ success: boolean; data: EjercicioCatalogo[] }>(
    '/ejercicios',
    authHeaders(token),
  );
  return data.data;
}

export async function createEjercicioCatalogo(nombre: string, token: string): Promise<EjercicioCatalogo> {
  const { data } = await api.post<{ success: boolean; data: EjercicioCatalogo }>(
    '/ejercicios',
    { nombre },
    authHeaders(token),
  );
  return data.data;
}

// Ejercicio detalle (con catálogo y serie_detalles)

export async function fetchEjercicioDetalle(ejercicioId: number, token: string): Promise<EjercicioDetalle> {
  const { data } = await api.get<{ success: boolean; data: EjercicioDetalle }>(
    `/ejercicios-rutina/${ejercicioId}`,
    authHeaders(token),
  );
  return data.data;
}

export async function updateSerieDetalles(
  ejercicioSemanaId: number,
  detalles: { numero_serie: number; kg: number | null }[],
  token: string,
): Promise<SerieDetalle[]> {
  const { data } = await api.put<{ success: boolean; data: SerieDetalle[] }>(
    `/ejercicio-semanas/${ejercicioSemanaId}/serie-detalles`,
    { detalles },
    authHeaders(token),
  );
  return data.data;
}

// ─── Sesiones de entrenamiento ────────────────────────────────────────────────

export async function createSesion(
  input: CreateSesionInput,
  token: string,
): Promise<{ id: number }> {
  const { data } = await api.post<{ success: boolean; data: { id: number } }>(
    '/sesiones',
    input,
    authHeaders(token),
  );
  return data.data;
}

export async function fetchSesiones(token: string): Promise<SesionResumen[]> {
  const { data } = await api.get<{ success: boolean; data: SesionResumen[] }>(
    '/sesiones',
    authHeaders(token),
  );
  return data.data;
}
