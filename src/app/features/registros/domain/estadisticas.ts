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
  const lunesActual = lunesDe(aDiaLocal(hoy));
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

function aDiaLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Aritmética en UTC sobre la fecha `YYYY-MM-DD` para no depender del horario de verano. */
function sumarDias(dia: string, dias: number): string {
  const fecha = new Date(`${dia}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function lunesDe(dia: string): string {
  const diaSemana = new Date(`${dia}T00:00:00Z`).getUTCDay(); // 0 = domingo
  return sumarDias(dia, -((diaSemana + 6) % 7));
}
