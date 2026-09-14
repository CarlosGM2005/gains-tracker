import { ejercicioDesdeFirestore } from './ejercicio.mapper';

describe('ejercicioDesdeFirestore', () => {
  it('lee un documento de la app actual (imgFinal, minúsculas)', () => {
    const ejercicio = ejercicioDesdeFirestore('abc', {
      nombre: 'Press de banca',
      musculo: 'pecho',
      nivel: 'intermedio',
      musculosImplicados: 'Pectoral, tríceps',
      descripcion: 'Empuja la barra.',
      imgInicio: 'https://img/inicio.png',
      imgFinal: 'https://img/final.png',
      recomendado: true,
    });

    expect(ejercicio).toEqual({
      id: 'abc',
      nombre: 'Press de banca',
      musculo: 'pecho',
      nivel: 'intermedio',
      musculosImplicados: 'Pectoral, tríceps',
      descripcion: 'Empuja la barra.',
      imagenInicio: 'https://img/inicio.png',
      imagenFinal: 'https://img/final.png',
      recomendado: true,
    });
  });

  it('normaliza mayúsculas y rellena campos ausentes', () => {
    const ejercicio = ejercicioDesdeFirestore('x', { musculo: 'Piernas', nivel: 'AVANZADO' });

    expect(ejercicio).toMatchObject({ musculo: 'piernas', nivel: 'avanzado', musculosImplicados: null, recomendado: false });
  });

  it('descarta documentos con músculo o nivel desconocido', () => {
    expect(ejercicioDesdeFirestore('x', { musculo: 'cuello', nivel: 'intermedio' })).toBeNull();
    expect(ejercicioDesdeFirestore('x', { musculo: 'pecho', nivel: 'experto' })).toBeNull();
  });
});
