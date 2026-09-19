import { esDiasPorSemana, indiceRutinaDeHoy, OPCIONES_DIAS, RUTINAS } from './rutina';

// 14-09-2026 es lunes.
const LUNES = new Date(2026, 8, 14);
const MIERCOLES = new Date(2026, 8, 16);
const VIERNES = new Date(2026, 8, 18);
const SABADO = new Date(2026, 8, 19);
const DOMINGO = new Date(2026, 8, 20);

describe('rutinas', () => {
  it('cada plan tiene tantos días como indica, numerados desde 1', () => {
    for (const dias of OPCIONES_DIAS) {
      expect(RUTINAS[dias].map((d) => d.dia)).toEqual(Array.from({ length: dias }, (_, i) => i + 1));
    }
  });

  it('el plan de 6 días va de lunes a sábado', () => {
    expect(indiceRutinaDeHoy(RUTINAS[6], LUNES)).toBe(0);
    expect(indiceRutinaDeHoy(RUTINAS[6], SABADO)).toBe(5);
    expect(indiceRutinaDeHoy(RUTINAS[6], DOMINGO)).toBe(-1);
  });

  it('el plan de 5 días descansa el fin de semana', () => {
    expect(indiceRutinaDeHoy(RUTINAS[5], VIERNES)).toBe(4);
    expect(indiceRutinaDeHoy(RUTINAS[5], SABADO)).toBe(-1);
  });

  it('el plan de 4 días descansa el miércoles', () => {
    expect(indiceRutinaDeHoy(RUTINAS[4], MIERCOLES)).toBe(-1);
    expect(indiceRutinaDeHoy(RUTINAS[4], VIERNES)).toBe(3);
  });

  it('solo acepta 4, 5 o 6 días', () => {
    expect(esDiasPorSemana(5)).toBe(true);
    expect(esDiasPorSemana(3)).toBe(false);
    expect(esDiasPorSemana('6')).toBe(false);
  });
});
