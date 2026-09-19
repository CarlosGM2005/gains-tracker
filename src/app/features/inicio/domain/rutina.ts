import { type Musculo } from '@features/ejercicios/public-api';

export interface MusculoRutina {
  musculo: Musculo;
  opcional: boolean;
}

export interface DiaRutina {
  /** Posición en el plan, desde 1. */
  dia: number;
  /** Día de la semana en que toca: 1 = lunes … 7 = domingo. */
  diaSemana: number;
  /** Nombre corto del tipo de sesión (empuje, tirón...). */
  enfoque: string;
  musculos: readonly MusculoRutina[];
}

export const OPCIONES_DIAS = [4, 5, 6] as const;
export type DiasPorSemana = (typeof OPCIONES_DIAS)[number];
export const DIAS_POR_DEFECTO: DiasPorSemana = 6;

export const NOMBRE_DIA_SEMANA: Readonly<Record<number, string>> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};

const trabajo = (musculo: Musculo): MusculoRutina => ({ musculo, opcional: false });
const opcional = (musculo: Musculo): MusculoRutina => ({ musculo, opcional: true });

/**
 * Planes de entrenamiento por días a la semana.
 * - 4 días: torso / pierna alternos, con descanso el miércoles.
 * - 5 días: empuje, tirón, pierna, torso y brazos, de lunes a viernes.
 * - 6 días: empuje, pierna y tirón dos veces, de lunes a sábado (la rutina de la app antigua).
 */
export const RUTINAS: Readonly<Record<DiasPorSemana, readonly DiaRutina[]>> = {
  4: [
    { dia: 1, diaSemana: 1, enfoque: 'Torso', musculos: [trabajo('pecho'), trabajo('espalda'), trabajo('hombros'), opcional('antebrazos')] },
    { dia: 2, diaSemana: 2, enfoque: 'Pierna y core', musculos: [trabajo('piernas'), trabajo('abdominales'), opcional('lumbares')] },
    { dia: 3, diaSemana: 4, enfoque: 'Torso y brazos', musculos: [trabajo('espalda'), trabajo('pecho'), trabajo('biceps'), trabajo('triceps')] },
    { dia: 4, diaSemana: 5, enfoque: 'Pierna y core', musculos: [trabajo('piernas'), trabajo('lumbares'), opcional('abdominales')] },
  ],
  5: [
    { dia: 1, diaSemana: 1, enfoque: 'Empuje', musculos: [trabajo('pecho'), trabajo('hombros'), trabajo('triceps')] },
    { dia: 2, diaSemana: 2, enfoque: 'Tirón', musculos: [trabajo('espalda'), trabajo('biceps'), trabajo('antebrazos')] },
    { dia: 3, diaSemana: 3, enfoque: 'Pierna y core', musculos: [trabajo('piernas'), trabajo('abdominales'), opcional('lumbares')] },
    { dia: 4, diaSemana: 4, enfoque: 'Torso', musculos: [trabajo('pecho'), trabajo('espalda'), trabajo('hombros')] },
    { dia: 5, diaSemana: 5, enfoque: 'Brazos y core', musculos: [trabajo('biceps'), trabajo('triceps'), opcional('abdominales')] },
  ],
  6: [
    { dia: 1, diaSemana: 1, enfoque: 'Empuje', musculos: [trabajo('pecho'), trabajo('triceps'), trabajo('hombros')] },
    { dia: 2, diaSemana: 2, enfoque: 'Pierna y core', musculos: [trabajo('piernas'), trabajo('abdominales'), opcional('lumbares')] },
    { dia: 3, diaSemana: 3, enfoque: 'Tirón', musculos: [trabajo('espalda'), trabajo('biceps'), trabajo('antebrazos')] },
    { dia: 4, diaSemana: 4, enfoque: 'Empuje', musculos: [trabajo('pecho'), trabajo('triceps'), trabajo('hombros')] },
    { dia: 5, diaSemana: 5, enfoque: 'Pierna y core', musculos: [trabajo('piernas'), opcional('lumbares'), opcional('abdominales')] },
    { dia: 6, diaSemana: 6, enfoque: 'Tirón', musculos: [trabajo('espalda'), trabajo('biceps'), trabajo('antebrazos')] },
  ],
};

export function esDiasPorSemana(valor: unknown): valor is DiasPorSemana {
  return (OPCIONES_DIAS as readonly unknown[]).includes(valor);
}

/** Posición en la rutina del día que toca en `fecha`; -1 si ese día de la semana es de descanso. */
export function indiceRutinaDeHoy(rutina: readonly DiaRutina[], fecha: Date): number {
  const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();
  return rutina.findIndex((d) => d.diaSemana === diaSemana);
}
