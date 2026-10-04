import { diaLocal, lunesDe, sumarDias } from '@shared/utils/fechas';

import { type RegistroEjercicio, type Serie } from './registro.model';

/** Kilos movidos en una serie: series × repeticiones × peso. */
export function volumenSerie(serie: Pick<Serie, 'series' | 'repeticiones' | 'peso'>): number {
  return serie.series * serie.repeticiones * serie.peso;
}

export interface ResumenGlobal {
  /** Días distintos con al menos una serie. */
  diasEntrenados: number;
  /** Suma del campo `series` de todos los registros. */
  seriesTotales: number;
  /** Kilos. */
  volumenTotal: number;
  ejercicios: number;
  /** El ejercicio con más series registradas, o `null` si no hay registros. */
  favorito: { nombre: string; series: number } | null;
}

export function resumenGlobal(registros: readonly RegistroEjercicio[]): ResumenGlobal {
  const dias = new Set<string>();
  let seriesTotales = 0;
  let volumenTotal = 0;
  let favorito: ResumenGlobal['favorito'] = null;

  for (const registro of registros) {
    let seriesEjercicio = 0;
    for (const serie of registro.series) {
      dias.add(serie.dia);
      seriesEjercicio += serie.series;
      volumenTotal += volumenSerie(serie);
    }
    seriesTotales += seriesEjercicio;
    if (seriesEjercicio > 0 && (!favorito || seriesEjercicio > favorito.series)) {
      favorito = { nombre: registro.nombre, series: seriesEjercicio };
    }
  }

  return {
    diasEntrenados: dias.size,
    seriesTotales,
    volumenTotal,
    ejercicios: registros.filter((r) => r.series.length > 0).length,
    favorito,
  };
}

/** Un día en la evolución de un ejercicio. */
export interface PuntoProgreso {
  dia: string;
  /** Peso más alto usado ese día (kg). */
  pesoMax: number;
  /** Volumen de todas las series del día (kg). */
  volumen: number;
}

export interface ProgresoEjercicio {
  /** Ordenados del día más antiguo al más reciente. */
  puntos: PuntoProgreso[];
  /** Mejor peso de todos los días (récord personal). */
  mejorPeso: number;
  /** Diferencia de peso máximo entre el último día y el primero (kg). */
  variacionPeso: number;
}

export function progresoEjercicio(registro: RegistroEjercicio): ProgresoEjercicio {
  const porDia = new Map<string, PuntoProgreso>();
  for (const serie of registro.series) {
    const punto = porDia.get(serie.dia) ?? { dia: serie.dia, pesoMax: 0, volumen: 0 };
    punto.pesoMax = Math.max(punto.pesoMax, serie.peso);
    punto.volumen += volumenSerie(serie);
    porDia.set(serie.dia, punto);
  }
  const puntos = [...porDia.values()].sort((a, b) => a.dia.localeCompare(b.dia));
  const primero = puntos[0];
  const ultimo = puntos.at(-1);
  return {
    puntos,
    mejorPeso: puntos.reduce((max, p) => Math.max(max, p.pesoMax), 0),
    variacionPeso: primero && ultimo ? ultimo.pesoMax - primero.pesoMax : 0,
  };
}

export interface SemanaActividad {
  /** Lunes de la semana, `YYYY-MM-DD`. */
  inicio: string;
  /** Días distintos entrenados esa semana (0–7). */
  dias: number;
}

/**
 * Días entrenados en cada una de las últimas `semanas` semanas (de lunes a domingo), de la más
 * antigua a la actual. Trabaja con fechas locales `YYYY-MM-DD`, sin zonas horarias.
 */
export function actividadSemanal(
  registros: readonly RegistroEjercicio[],
  hoy: Date,
  semanas = 8,
): SemanaActividad[] {
  const lunesActual = lunesDe(diaLocal(hoy));
  const resultado: SemanaActividad[] = Array.from({ length: semanas }, (_, i) => ({
    inicio: sumarDias(lunesActual, (i - semanas + 1) * 7),
    dias: 0,
  }));
  const primerLunes = resultado[0]?.inicio ?? lunesActual;
  const diasPorSemana = new Map<string, Set<string>>();

  for (const registro of registros) {
    for (const { dia } of registro.series) {
      const lunes = lunesDe(dia);
      if (lunes >= primerLunes && lunes <= lunesActual) {
        const conjunto = diasPorSemana.get(lunes) ?? new Set<string>();
        conjunto.add(dia);
        diasPorSemana.set(lunes, conjunto);
      }
    }
  }
  return resultado.map((s) => ({ ...s, dias: diasPorSemana.get(s.inicio)?.size ?? 0 }));
}

/** Repetición máxima estimada con la fórmula de Epley. Con una sola repetición, el propio peso. */
export function unaRmEstimada(peso: number, repeticiones: number): number {
  return repeticiones <= 1 ? peso : peso * (1 + repeticiones / 30);
}

/** La mejor marca de un ejercicio: su mejor serie. */
export interface RecordPersonal {
  ejercicioId: string;
  nombre: string;
  imagen: string;
  /** Kilos. 0 en ejercicios sin carga: entonces la marca son las repeticiones. */
  peso: number;
  repeticiones: number;
  /** Primer día en que se consiguió. */
  dia: string;
  /** Repetición máxima estimada (kg). `null` en ejercicios sin carga. */
  unaRm: number | null;
}

/**
 * Mejor serie: la de más peso; a igual peso, la de más repeticiones; y a igualdad, la más antigua,
 * que es cuando se consiguió la marca.
 */
export function mejorSerie(series: readonly Serie[]): Serie | null {
  let mejor: Serie | null = null;
  for (const serie of series) {
    if (!mejor || superaA(serie, mejor) || (!superaA(mejor, serie) && serie.dia < mejor.dia)) {
      mejor = serie;
    }
  }
  return mejor;
}

/** Récord de cada ejercicio, del conseguido más recientemente al más antiguo. */
export function recordsPersonales(registros: readonly RegistroEjercicio[]): RecordPersonal[] {
  return registros
    .flatMap((registro): RecordPersonal[] => {
      const mejor = mejorSerie(registro.series);
      if (!mejor) {
        return [];
      }
      return [
        {
          ejercicioId: registro.ejercicioId,
          nombre: registro.nombre,
          imagen: registro.imagen,
          peso: mejor.peso,
          repeticiones: mejor.repeticiones,
          dia: mejor.dia,
          unaRm: mejor.peso > 0 ? unaRmEstimada(mejor.peso, mejor.repeticiones) : null,
        },
      ];
    })
    .sort((a, b) => b.dia.localeCompare(a.dia));
}

/**
 * Si `nueva` bate la mejor serie anterior del ejercicio (más peso, o el mismo peso con más
 * repeticiones). La primera serie de un ejercicio no cuenta: no hay marca con la que compararla.
 */
export function esNuevoRecord(
  anteriores: readonly Serie[],
  nueva: Pick<Serie, 'peso' | 'repeticiones'>,
): boolean {
  const mejor = mejorSerie(anteriores);
  return mejor !== null && superaA(nueva, mejor);
}

function superaA(a: Pick<Serie, 'peso' | 'repeticiones'>, b: Pick<Serie, 'peso' | 'repeticiones'>): boolean {
  return a.peso > b.peso || (a.peso === b.peso && a.repeticiones > b.repeticiones);
}

export interface Racha {
  /** Días seguidos hasta hoy (o hasta ayer, si hoy aún no se ha entrenado). */
  actual: number;
  /** La racha más larga de todo el historial. */
  mejor: number;
  /** Si hoy ya hay alguna serie. Si no y `actual` > 0, la racha se pierde al acabar el día. */
  entrenadoHoy: boolean;
}

/**
 * Días seguidos entrenando. La racha actual sigue viva si hoy todavía no se ha entrenado pero ayer
 * sí: no se rompe hasta que acaba el día.
 */
export function rachaDias(registros: readonly RegistroEjercicio[], hoy: Date): Racha {
  const dias = new Set(registros.flatMap((r) => r.series.map((s) => s.dia)));

  let mejor = 0;
  let tramo = 0;
  let anterior: string | null = null;
  for (const dia of [...dias].sort()) {
    tramo = anterior !== null && sumarDias(anterior, 1) === dia ? tramo + 1 : 1;
    mejor = Math.max(mejor, tramo);
    anterior = dia;
  }

  const hoyTexto = diaLocal(hoy);
  const entrenadoHoy = dias.has(hoyTexto);
  let cursor = entrenadoHoy ? hoyTexto : sumarDias(hoyTexto, -1);
  let actual = 0;
  while (dias.has(cursor)) {
    actual++;
    cursor = sumarDias(cursor, -1);
  }
  return { actual, mejor, entrenadoHoy };
}
