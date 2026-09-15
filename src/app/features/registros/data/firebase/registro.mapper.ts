import { fecha, numero, texto } from '@core/firebase/conversiones';

import { type NuevaSerie, type RegistroEjercicio, type Serie, SerieNoEncontradaError } from '../../domain/registro.model';

/** Serie tal como se guarda en `usuarios/{uid}/registros/{idEjercicio}.series[]`. */
export interface SerieDto {
  /** Solo en series guardadas por la app nueva. */
  id?: unknown;
  dia?: unknown;
  /** Número de series (la app antigua lo llamó `numero`). */
  numero?: unknown;
  repeticiones?: unknown;
  peso?: unknown;
  /** Minutos. */
  descanso?: unknown;
  /** Solo en series guardadas por la app nueva. */
  creadaEn?: unknown;
}

export interface RegistroDto {
  id?: unknown;
  nombre?: unknown;
  imagen?: unknown;
  series?: unknown;
  /** Estado visual que guardaba la app antigua. Se ignora y no se vuelve a escribir. */
  isOpen?: unknown;
}

export function serieDesdeFirestore(dto: SerieDto, indice: number): Serie {
  return {
    // Las series antiguas no tienen id: se genera uno estable por posición para `track`.
    id: texto(dto.id) || `legacy-${indice}`,
    dia: texto(dto.dia),
    series: numero(dto.numero),
    repeticiones: numero(dto.repeticiones),
    peso: numero(dto.peso),
    descansoMin: numero(dto.descanso),
    creadaEn: fecha(dto.creadaEn),
  };
}

export function registroDesdeFirestore(docId: string, dto: RegistroDto): RegistroEjercicio {
  const series = Array.isArray(dto.series) ? (dto.series as SerieDto[]) : [];
  return {
    ejercicioId: texto(dto.id) || docId,
    nombre: texto(dto.nombre),
    imagen: texto(dto.imagen),
    series: series.map(serieDesdeFirestore),
  };
}

/** Modelo a documento, con los nombres de campo que ya existen en Firestore. */
export function serieAFirestore(serie: Serie): SerieDto {
  return {
    id: serie.id,
    dia: serie.dia,
    numero: serie.series,
    repeticiones: serie.repeticiones,
    peso: serie.peso,
    descanso: serie.descansoMin,
    creadaEn: serie.creadaEn ?? new Date(),
  };
}

/**
 * Edita (`cambios`) o borra (`null`) una serie del array `series` tal como está en Firestore.
 * Fija el id de las series antiguas (`legacy-N`, el mismo que genera la lectura): así borrar una no
 * cambia el id de las siguientes. El resto de campos de cada serie se conserva tal cual.
 */
export function modificarSeries(series: unknown, serieId: string, cambios: NuevaSerie | null): SerieDto[] {
  const actuales = (Array.isArray(series) ? (series as SerieDto[]) : []).map(
    (dto, i): SerieDto => ({ ...dto, id: texto(dto.id) || `legacy-${i}` }),
  );
  const indice = actuales.findIndex((dto) => dto.id === serieId);
  if (indice === -1) {
    throw new SerieNoEncontradaError(serieId);
  }
  if (cambios === null) {
    return actuales.filter((_, i) => i !== indice);
  }
  return actuales.map((dto, i) =>
    i === indice
      ? {
          ...dto,
          dia: cambios.dia,
          numero: cambios.series,
          repeticiones: cambios.repeticiones,
          peso: cambios.peso,
          descanso: cambios.descansoMin,
        }
      : dto,
  );
}
