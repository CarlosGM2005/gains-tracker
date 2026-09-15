import { actividadSemanal, progresoEjercicio, resumenGlobal, volumenSerie } from './estadisticas';
import { type RegistroEjercicio, type Serie } from './registro.model';

let contador = 0;
function serie(dia: string, series: number, repeticiones: number, peso: number): Serie {
  return { id: `s-${contador++}`, dia, series, repeticiones, peso, descansoMin: 2, creadaEn: null };
}

const BANCA: RegistroEjercicio = {
  ejercicioId: 'banca',
  nombre: 'Press de banca',
  imagen: '',
  series: [serie('2026-09-01', 4, 10, 60), serie('2026-09-08', 4, 8, 65), serie('2026-09-08', 2, 6, 70)],
};
const SENTADILLA: RegistroEjercicio = {
  ejercicioId: 'sentadilla',
  nombre: 'Sentadilla',
  imagen: '',
  series: [serie('2026-09-08', 5, 5, 90)],
};

describe('estadísticas de registros', () => {
  it('calcula el volumen de una serie', () => {
    expect(volumenSerie({ series: 4, repeticiones: 10, peso: 60 })).toBe(2400);
  });

  it('resume días, series, volumen y ejercicio más trabajado', () => {
    expect(resumenGlobal([BANCA, SENTADILLA])).toEqual({
      diasEntrenados: 2,
      seriesTotales: 15,
      volumenTotal: 2400 + 2080 + 840 + 2250,
      ejercicios: 2,
      favorito: { nombre: 'Press de banca', series: 10 },
    });
  });

  it('sin registros el resumen está a cero', () => {
    expect(resumenGlobal([])).toEqual({
      diasEntrenados: 0,
      seriesTotales: 0,
      volumenTotal: 0,
      ejercicios: 0,
      favorito: null,
    });
  });

  it('agrupa el progreso por día con el peso máximo y el volumen', () => {
    const progreso = progresoEjercicio({ ...BANCA, series: [...BANCA.series].reverse() });

    expect(progreso.puntos).toEqual([
      { dia: '2026-09-01', pesoMax: 60, volumen: 2400 },
      { dia: '2026-09-08', pesoMax: 70, volumen: 2080 + 840 },
    ]);
    expect(progreso.mejorPeso).toBe(70);
    expect(progreso.variacionPeso).toBe(10);
  });

  it('cuenta días distintos por semana de lunes a domingo', () => {
    // Lunes 14-09-2026. La semana anterior empieza el 07-09 y la otra el 31-08.
    const semanas = actividadSemanal([BANCA, SENTADILLA], new Date(2026, 8, 16), 3);

    expect(semanas).toEqual([
      { inicio: '2026-08-31', dias: 1 },
      { inicio: '2026-09-07', dias: 1 },
      { inicio: '2026-09-14', dias: 0 },
    ]);
  });

  it('ignora días fuera del rango de semanas', () => {
    const semanas = actividadSemanal([BANCA], new Date(2026, 11, 1), 2);

    expect(semanas.every((s) => s.dias === 0)).toBe(true);
  });
});
