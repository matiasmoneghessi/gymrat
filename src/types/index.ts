export interface EjercicioSemana {
  id: number;
  ejercicioId: number;
  semanaId: number;
  kg?: number | null;
  reps: number;
  series: number;
  tipo_reps: 'reps' | 'seg';
}

export interface Usuario {
  id_usuario: number;
  usuario: string;
  nombre: string;
  nivel: number;
  email: string;
  telefono?: string | null;
}

export interface Ejercicio {
  id: number;
  nombre: string;
  codigo?: string | null;
  diaId: number;
  ejercicioSemanas: EjercicioSemana[];
}

export interface Dia {
  id: number;
  numero: number;
  nombre: string;
  movilidad?: string | null;
  activacion?: string | null;
  semanaId: number;
  ejercicios: Ejercicio[];
}

export interface Semana {
  id: number;
  numero: number;
  tipo_esfuerzo: string;
  nombre: string;
  dias: Dia[];
  ejercicioSemanas: EjercicioSemana[];
}

export interface SemanaSummary {
  id: number;
  numero: number;
  tipo_esfuerzo: string;
  nombre: string;
}

export interface RutinaSummary {
  id: number;
  nombre: string;
}

export interface RutinaFull {
  id: number;
  nombre: string;
  semanas: Semana[];
}

// Tipos para creación de rutinas

export interface CreateEjercicioSemanaInput {
  semanaNumero: number;
  kg: number | null;
  reps: number;
  series: number;
  tipo_reps: 'reps' | 'seg';
}

export interface CreateEjercicioInput {
  nombre: string;
  codigo?: string | null;
  ejercicioSemanas: CreateEjercicioSemanaInput[];
}

export interface CreateDiaInput {
  nombre: string;
  movilidad?: string | null;
  activacion?: string | null;
  ejercicios: CreateEjercicioInput[];
}

export interface CreateSemanaInput {
  nombre: string;
  tipo_esfuerzo: string;
  dias: CreateDiaInput[];
}

export interface CreateRutinaInput {
  nombre: string;
  semanas: CreateSemanaInput[];
}

export interface ShareTokenResponse {
  token: string;
}

export interface EjercicioCatalogo {
  id: number;
  nombre: string;
}

