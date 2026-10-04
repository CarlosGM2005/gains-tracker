import { type Ejercicio } from '@features/ejercicios/domain/ejercicio.model';

export interface Serie {
  /** Id propio: evita que `arrayUnion` descarte dos series con los mismos valores. */
  id: string;
  /** Fecha ISO `YYYY-MM-DD`. */
  dia: string;
  series: number;
  repeticiones: number;
  /** Kilogramos. */
  peso: number;
  /** Minutos. En Firestore el campo se llama `descanso`. */
  descansoMin: number;
  /** `null` en series guardadas por la app antigua. */
  creadaEn: Date | null;
}

export type NuevaSerie = Omit<Serie, 'id' | 'creadaEn'>;

/** Agrupa todas las series de un ejercicio de un usuario. */
export interface RegistroEjercicio {
  ejercicioId: string;
  nombre: string;
  imagen: string;
  series: readonly Serie[];
}

/** Datos del ejercicio que se copian al registro al guardar la primera serie. */
export type EjercicioRegistrable = Pick<Ejercicio, 'id' | 'nombre' | 'imagenFinal'>;

export const LIMITES_SERIE = {
  series: { min: 1 },
  repeticiones: { min: 1 },
  peso: { min: 0 },
  descansoMin: { min: 0 },
} as const;

/** La serie o el registro ya no existe (p. ej. se borró desde otro dispositivo). */
export class SerieNoEncontradaError extends Error {
  constructor(serieId: string) {
    super(`No existe la serie ${serieId}`);
    this.name = 'SerieNoEncontradaError';
  }
}

/** Día más reciente registrado, para ordenar la lista de registros. */
export function ultimoDia(registro: RegistroEjercicio): string | null {
  return registro.series.reduce<string | null>((max, s) => (max === null || s.dia > max ? s.dia : max), null);
}

/** Serie más reciente: la del último día y, dentro de ese día, la última que se creó. */
export function ultimaSerie(series: readonly Serie[]): Serie | null {
  let ultima: Serie | null = null;
  for (const serie of series) {
    const masNueva =
      !ultima ||
      serie.dia > ultima.dia ||
      (serie.dia === ultima.dia && (serie.creadaEn?.getTime() ?? 0) >= (ultima.creadaEn?.getTime() ?? 0));
    if (masNueva) {
      ultima = serie;
    }
  }
  return ultima;
}

/** Ids de los ejercicios con alguna serie en `dia` (`YYYY-MM-DD`). */
export function ejerciciosDelDia(registros: readonly RegistroEjercicio[], dia: string): string[] {
  return registros.filter((r) => r.series.some((s) => s.dia === dia)).map((r) => r.ejercicioId);
}
