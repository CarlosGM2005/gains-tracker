/**
 * Días como texto `YYYY-MM-DD`, que es como se guardan en Firestore. Se trabaja con el día local
 * del usuario y la aritmética se hace en UTC para no depender del horario de verano.
 */

/** Día local de `fecha` como `YYYY-MM-DD`. */
export function diaLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function sumarDias(dia: string, dias: number): string {
  const fecha = new Date(`${dia}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

/** Lunes de la semana de `dia`. */
export function lunesDe(dia: string): string {
  const diaSemana = new Date(`${dia}T00:00:00Z`).getUTCDay(); // 0 = domingo
  return sumarDias(dia, -((diaSemana + 6) % 7));
}
