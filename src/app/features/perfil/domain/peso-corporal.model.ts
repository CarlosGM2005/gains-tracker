/** Peso corporal de un día. Uno por día: registrar otra vez el mismo día lo sustituye. */
export interface RegistroPeso {
  /** `YYYY-MM-DD`. También es el id del documento en `usuarios/{uid}/pesos`. */
  dia: string;
  kg: number;
}

/** Evolución del peso corporal, de lo registrado. */
export interface ResumenPeso {
  actual: RegistroPeso;
  /** Diferencia con el primer registro (kg). `null` si solo hay uno. */
  variacion: number | null;
}

/** `pesos` ordenados del día más antiguo al más reciente. `null` si no hay ninguno. */
export function resumenPeso(pesos: readonly RegistroPeso[]): ResumenPeso | null {
  const primero = pesos[0];
  const actual = pesos.at(-1);
  if (!primero || !actual) {
    return null;
  }
  return { actual, variacion: pesos.length > 1 ? actual.kg - primero.kg : null };
}
