import type { SesionResumen } from '@/types';

export interface PuntoProgresion {
  fecha: string;
  maxKg: number;
  e1rm: number;
  volumen: number;
}

export interface EstadisticaEjercicio {
  id: number;
  nombre: string;
  series: number;
  sesiones: number;
  volumen: number;
  record: { kg: number; reps: number; fecha: string };
  mejorE1rm: { valor: number; fecha: string };
  progresion: PuntoProgresion[];
}

export interface VolumenSemana {
  key: string;
  label: string;
  volumen: number;
}

/** 1RM estimado (Epley). */
export function e1rm(kg: number, reps: number): number {
  return reps <= 1 ? kg : kg * (1 + reps / 30);
}

/** Hay detalle de series en alguna sesión. */
export function hayDetalle(sesiones: SesionResumen[]): boolean {
  return sesiones.some((s) => s.ejercicios?.some((e) => e.series.length > 0));
}

export function calcularPorEjercicio(sesiones: SesionResumen[]): EstadisticaEjercicio[] {
  const mapa = new Map<number, EstadisticaEjercicio>();
  const ordenadas = [...sesiones].sort((a, b) => a.fecha.localeCompare(b.fecha));

  for (const s of ordenadas) {
    for (const ej of s.ejercicios ?? []) {
      const hechas = ej.series.filter((x) => x.completada && x.kg && x.kg > 0 && x.reps > 0);
      if (hechas.length === 0) continue;

      let est = mapa.get(ej.catalogoEjercicioId);
      if (!est) {
        est = {
          id: ej.catalogoEjercicioId,
          nombre: ej.nombre,
          series: 0,
          sesiones: 0,
          volumen: 0,
          record: { kg: 0, reps: 0, fecha: s.fecha },
          mejorE1rm: { valor: 0, fecha: s.fecha },
          progresion: [],
        };
        mapa.set(ej.catalogoEjercicioId, est);
      }

      let maxKg = 0;
      let mejor1rm = 0;
      let volumen = 0;
      for (const serie of hechas) {
        const kg = serie.kg as number;
        const v = kg * serie.reps;
        const r = e1rm(kg, serie.reps);
        volumen += v;
        maxKg = Math.max(maxKg, kg);
        mejor1rm = Math.max(mejor1rm, r);
        if (kg > est.record.kg || (kg === est.record.kg && serie.reps > est.record.reps)) {
          est.record = { kg, reps: serie.reps, fecha: s.fecha };
        }
        if (r > est.mejorE1rm.valor) est.mejorE1rm = { valor: r, fecha: s.fecha };
      }

      est.series += hechas.length;
      est.sesiones += 1;
      est.volumen += volumen;
      est.progresion.push({ fecha: s.fecha, maxKg, e1rm: Math.round(mejor1rm * 10) / 10, volumen });
    }
  }
  return [...mapa.values()];
}

/** Lunes de la semana de una fecha YYYY-MM-DD, como YYYY-MM-DD. */
function lunesDe(fecha: string): Date {
  const d = new Date(fecha + 'T12:00:00');
  const dia = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dia);
  return d;
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Volumen (kg × reps de series completadas) de las últimas `n` semanas, incluida la actual. */
export function volumenSemanal(sesiones: SesionResumen[], n = 8): VolumenSemana[] {
  const semanas: VolumenSemana[] = [];
  const base = lunesDe(iso(new Date()));
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i * 7);
    semanas.push({
      key: iso(d),
      label: d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
      volumen: 0,
    });
  }
  const idx = new Map(semanas.map((s) => [s.key, s]));
  for (const s of sesiones) {
    const semana = idx.get(iso(lunesDe(s.fecha)));
    if (!semana) continue;
    for (const ej of s.ejercicios ?? []) {
      for (const serie of ej.series) {
        if (serie.completada && serie.kg && serie.reps > 0) semana.volumen += serie.kg * serie.reps;
      }
    }
  }
  return semanas.map((s) => ({ ...s, volumen: Math.round(s.volumen) }));
}

export function formatKg(n: number): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(n);
}
