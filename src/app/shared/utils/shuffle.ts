/** Devuelve una copia barajada con Fisher-Yates (reparto uniforme, a diferencia de `sort(random)`). */
export function barajar<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copia = [...items];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copia[i], copia[j]] = [copia[j] as T, copia[i] as T];
  }
  return copia;
}

/** Hasta `cantidad` elementos distintos elegidos al azar. */
export function tomarAleatorios<T>(items: readonly T[], cantidad: number, random?: () => number): T[] {
  return barajar(items, random).slice(0, Math.max(0, cantidad));
}
