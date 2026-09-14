// Conversiones tolerantes para leer documentos de Firestore escritos por la app antigua o a mano.
// Sin dependencias de Firebase: se prueban sin inicializar nada.

export function texto(valor: unknown, porDefecto = ''): string {
  return typeof valor === 'string' ? valor : porDefecto;
}

/** Texto no vacío o `null`. */
export function textoONull(valor: unknown): string | null {
  const t = typeof valor === 'string' ? valor.trim() : '';
  return t ? t : null;
}

/** Número finito (acepta números guardados como texto) o `porDefecto`. */
export function numero(valor: unknown, porDefecto = 0): number {
  const n = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : valor;
  return typeof n === 'number' && Number.isFinite(n) ? n : porDefecto;
}

/** Número mayor que 0 o `null` (la app antigua guardaba 0 como "sin dato"). */
export function positivoONull(valor: unknown): number | null {
  const n = numero(valor, 0);
  return n > 0 ? n : null;
}

/** Fecha desde `Timestamp` de Firestore, `Date`, milisegundos o ISO; `null` si no se puede. */
export function fecha(valor: unknown): Date | null {
  if (valor instanceof Date) {
    return Number.isNaN(valor.getTime()) ? null : valor;
  }
  if (typeof valor === 'object' && valor !== null && 'toDate' in valor && typeof valor.toDate === 'function') {
    const d: unknown = valor.toDate();
    return d instanceof Date ? d : null;
  }
  if (typeof valor === 'number' || typeof valor === 'string') {
    const d = new Date(valor);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}
