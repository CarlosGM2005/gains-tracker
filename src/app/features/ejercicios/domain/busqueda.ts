import { ETIQUETA_MUSCULO, type Ejercicio, type Musculo } from './ejercicio.model';

/** Filtro de músculo del buscador: uno concreto o todos. */
export type FiltroMusculo = Musculo | 'todos';

/** Minúsculas, sin tildes ni espacios sobrantes: "Tríceps  " y "triceps" son iguales. */
export function normalizarBusqueda(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Filtra por nombre, músculo o músculos implicados. Cada palabra del término debe aparecer
 * (en cualquier orden). El resultado sale ordenado por nombre.
 */
export function buscarEjercicios(
  ejercicios: readonly Ejercicio[],
  termino: string,
  musculo: FiltroMusculo = 'todos',
): Ejercicio[] {
  const palabras = normalizarBusqueda(termino).split(' ').filter(Boolean);
  return ejercicios
    .filter((e) => musculo === 'todos' || e.musculo === musculo)
    .filter((e) => {
      if (palabras.length === 0) {
        return true;
      }
      const texto = normalizarBusqueda(`${e.nombre} ${ETIQUETA_MUSCULO[e.musculo]} ${e.musculosImplicados ?? ''}`);
      return palabras.every((p) => texto.includes(p));
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}
