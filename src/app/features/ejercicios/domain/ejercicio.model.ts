export const NIVELES = ['principiante', 'intermedio', 'avanzado'] as const;
export type Nivel = (typeof NIVELES)[number];

export const MUSCULOS = [
  'espalda',
  'pecho',
  'hombros',
  'triceps',
  'biceps',
  'antebrazos',
  'lumbares',
  'abdominales',
  'piernas',
] as const;
export type Musculo = (typeof MUSCULOS)[number];

/** Músculos que ofrecen los filtros de catálogo y recomendados (la app no muestra `lumbares`). */
export const MUSCULOS_FILTRO: readonly Musculo[] = MUSCULOS.filter((m) => m !== 'lumbares');

export const NIVEL_POR_DEFECTO: Nivel = 'avanzado';
export const MUSCULO_POR_DEFECTO: Musculo = 'espalda';

/** Cuántos recomendados al azar muestra el inicio. */
export const RECOMENDADOS_EN_INICIO = 8;

export const ETIQUETA_NIVEL: Readonly<Record<Nivel, string>> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
};

export const ETIQUETA_MUSCULO: Readonly<Record<Musculo, string>> = {
  espalda: 'Espalda',
  pecho: 'Pecho',
  hombros: 'Hombros',
  triceps: 'Tríceps',
  biceps: 'Bíceps',
  antebrazos: 'Antebrazos',
  lumbares: 'Lumbares',
  abdominales: 'Abdominales',
  piernas: 'Piernas',
};

export interface Ejercicio {
  id: string;
  nombre: string;
  musculo: Musculo;
  nivel: Nivel;
  /** Texto libre; `null` si no está informado. */
  musculosImplicados: string | null;
  descripcion: string;
  imagenInicio: string;
  /** En Firestore el campo se llama `imgFinal`. */
  imagenFinal: string;
  recomendado: boolean;
}

export function esNivel(valor: unknown): valor is Nivel {
  return typeof valor === 'string' && (NIVELES as readonly string[]).includes(valor);
}

export function esMusculo(valor: unknown): valor is Musculo {
  return typeof valor === 'string' && (MUSCULOS as readonly string[]).includes(valor);
}
