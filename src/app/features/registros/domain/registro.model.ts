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

/** Día más reciente registrado, para ordenar la lista de registros. */
export function ultimoDia(registro: RegistroEjercicio): string | null {
  return registro.series.reduce<string | null>((max, s) => (max === null || s.dia > max ? s.dia : max), null);
}
