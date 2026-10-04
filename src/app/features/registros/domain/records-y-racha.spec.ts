import {
  esNuevoRecord,
  mejorSerie,
  nivelRacha,
  rachaDias,
  recordsPersonales,
  unaRmEstimada,
} from './estadisticas';
import { ejerciciosDelDia, type RegistroEjercicio, type Serie, ultimaSerie } from './registro.model';

let contador = 0;
function serie(dia: string, repeticiones: number, peso: number, creadaEn: Date | null = null): Serie {
  return {
    id: `s-${contador++}`,
    dia,
    series: 3,
    repeticiones,
    peso,
    descansoMin: 2,
    rpe: null,
    nota: null,
    creadaEn,
  };
}

function registro(ejercicioId: string, series: Serie[]): RegistroEjercicio {
  return { ejercicioId, nombre: ejercicioId, imagen: '', series };
}

describe('récords personales', () => {
  it('estima la repetición máxima con Epley', () => {
    expect(unaRmEstimada(90, 1)).toBe(90);
    expect(unaRmEstimada(60, 10)).toBeCloseTo(80);
  });

  it('la mejor serie es la de más peso y, a igual peso, la de más repeticiones', () => {
    const mejor = mejorSerie([
      serie('2026-09-01', 8, 70),
      serie('2026-09-08', 10, 70),
      serie('2026-09-15', 12, 65),
    ]);
    expect(mejor).toMatchObject({ dia: '2026-09-08', peso: 70, repeticiones: 10 });
  });

  it('a igualdad, el récord es del día en que se consiguió por primera vez', () => {
    expect(mejorSerie([serie('2026-09-08', 5, 80), serie('2026-09-01', 5, 80)])?.dia).toBe('2026-09-01');
  });

  it('lista un récord por ejercicio, del más reciente al más antiguo', () => {
    const records = recordsPersonales([
      registro('banca', [serie('2026-09-01', 5, 80)]),
      registro('dominadas', [serie('2026-09-10', 12, 0)]),
      registro('vacio', []),
    ]);

    expect(records.map((r) => r.ejercicioId)).toEqual(['dominadas', 'banca']);
    expect(records[1]).toMatchObject({ peso: 80, repeticiones: 5 });
    expect(records[0]?.unaRm).toBeNull();
  });

  it('detecta un récord nuevo, pero no en la primera serie de un ejercicio', () => {
    const anteriores = [serie('2026-09-01', 5, 80)];
    expect(esNuevoRecord(anteriores, { peso: 82.5, repeticiones: 3 })).toBe(true);
    expect(esNuevoRecord(anteriores, { peso: 80, repeticiones: 6 })).toBe(true);
    expect(esNuevoRecord(anteriores, { peso: 80, repeticiones: 5 })).toBe(false);
    expect(esNuevoRecord([], { peso: 100, repeticiones: 1 })).toBe(false);
  });
});

describe('racha de días seguidos', () => {
  const HOY = new Date(2026, 9, 4); // 4 de octubre de 2026, hora local

  it('cuenta los días seguidos hasta hoy y guarda la mejor', () => {
    const registros = [
      registro('a', [serie('2026-09-20', 5, 50), serie('2026-09-21', 5, 50), serie('2026-09-22', 5, 50)]),
      registro('b', [serie('2026-10-03', 5, 50), serie('2026-10-04', 5, 50)]),
    ];
    expect(rachaDias(registros, HOY)).toEqual({ actual: 2, mejor: 3, entrenadoHoy: true });
  });

  it('sigue viva si hoy aún no se ha entrenado pero ayer sí', () => {
    const registros = [registro('a', [serie('2026-10-02', 5, 50), serie('2026-10-03', 5, 50)])];
    expect(rachaDias(registros, HOY)).toEqual({ actual: 2, mejor: 2, entrenadoHoy: false });
  });

  it('se rompe con un día sin entrenar', () => {
    const registros = [registro('a', [serie('2026-10-01', 5, 50), serie('2026-10-02', 5, 50)])];
    expect(rachaDias(registros, HOY).actual).toBe(0);
  });

  it('cruza el cambio de mes', () => {
    const registros = [registro('a', [serie('2026-09-30', 5, 50), serie('2026-10-01', 5, 50)])];
    expect(rachaDias(registros, new Date(2026, 9, 1)).actual).toBe(2);
  });
});

describe('última serie y ejercicios del día', () => {
  it('la última serie es la del día más reciente y, dentro del día, la última creada', () => {
    const ultima = ultimaSerie([
      serie('2026-09-08', 8, 60, new Date('2026-09-08T18:00:00Z')),
      serie('2026-09-08', 6, 65, new Date('2026-09-08T18:10:00Z')),
      serie('2026-09-01', 10, 55),
    ]);
    expect(ultima).toMatchObject({ repeticiones: 6, peso: 65 });
  });

  it('sin series no hay última', () => {
    expect(ultimaSerie([])).toBeNull();
  });

  it('lista los ejercicios con alguna serie ese día', () => {
    const registros = [
      registro('banca', [serie('2026-10-04', 5, 80)]),
      registro('remo', [serie('2026-10-03', 10, 50)]),
    ];
    expect(ejerciciosDelDia(registros, '2026-10-04')).toEqual(['banca']);
  });
});

describe('nivelRacha', () => {
  it('sin racha no hay nivel y la Chispa está a un día', () => {
    expect(nivelRacha(0)).toEqual({
      nivel: 0,
      nombre: null,
      siguiente: { nombre: 'Chispa', faltan: 1, progreso: 0 },
    });
  });

  it('sube en los días 1, 3, 7, 14 y 30', () => {
    const niveles = [1, 2, 3, 6, 7, 13, 14, 29, 30, 365].map((dias) => nivelRacha(dias).nivel);
    expect(niveles).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });

  it('cuenta lo que falta para el siguiente nivel y el avance dentro del actual', () => {
    expect(nivelRacha(9)).toEqual({
      nivel: 3,
      nombre: 'Hoguera',
      siguiente: { nombre: 'Fragua', faltan: 5, progreso: 2 / 7 },
    });
  });

  it('en el nivel máximo no hay siguiente', () => {
    expect(nivelRacha(30)).toEqual({ nivel: 5, nombre: 'Llama azul', siguiente: null });
  });
});
