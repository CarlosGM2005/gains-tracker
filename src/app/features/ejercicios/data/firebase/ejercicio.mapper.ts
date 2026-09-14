import { texto, textoONull } from '@core/firebase/conversiones';

import { type Ejercicio, esMusculo, esNivel } from '../../domain/ejercicio.model';

/** Forma del documento `ejercicios/{id}` (cargado a mano en la consola). */
export interface EjercicioDto {
  nombre?: unknown;
  musculo?: unknown;
  nivel?: unknown;
  musculosImplicados?: unknown;
  descripcion?: unknown;
  imgInicio?: unknown;
  /** Nombre real del campo de la imagen final (la interfaz antigua decía `imgFin`). */
  imgFinal?: unknown;
  recomendado?: unknown;
}

/**
 * Documento de Firestore a modelo. Devuelve `null` si el músculo o el nivel no son válidos,
 * para que un documento mal cargado no rompa el listado.
 */
export function ejercicioDesdeFirestore(id: string, dto: EjercicioDto): Ejercicio | null {
  const musculo = texto(dto.musculo).trim().toLowerCase();
  const nivel = texto(dto.nivel).trim().toLowerCase();
  if (!esMusculo(musculo) || !esNivel(nivel)) {
    return null;
  }
  return {
    id,
    nombre: texto(dto.nombre).trim(),
    musculo,
    nivel,
    musculosImplicados: textoONull(dto.musculosImplicados),
    descripcion: texto(dto.descripcion),
    imagenInicio: texto(dto.imgInicio),
    imagenFinal: texto(dto.imgFinal),
    recomendado: dto.recomendado === true,
  };
}
