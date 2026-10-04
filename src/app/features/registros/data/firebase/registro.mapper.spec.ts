import { type Serie, SerieNoEncontradaError } from '../../domain/registro.model';
import { modificarSeries, registroDesdeFirestore, serieAFirestore, serieDesdeFirestore } from './registro.mapper';

describe('mapper de registros', () => {
  it('lee un registro guardado por la app antigua (sin id de serie, con isOpen)', () => {
    const registro = registroDesdeFirestore('ej-1', {
      id: 'ej-1',
      nombre: 'Sentadilla',
      imagen: 'final.png',
      isOpen: true,
      series: [
        { dia: '2025-06-02', numero: 4, repeticiones: 10, peso: 60, descanso: 2 },
        { dia: '2025-06-09', numero: '5', repeticiones: 8, peso: 62.5, descanso: 3 },
      ],
    });

    expect(registro).toEqual({
      ejercicioId: 'ej-1',
      nombre: 'Sentadilla',
      imagen: 'final.png',
      series: [
        {
          id: 'legacy-0',
          dia: '2025-06-02',
          series: 4,
          repeticiones: 10,
          peso: 60,
          descansoMin: 2,
          rpe: null,
          nota: null,
          creadaEn: null,
        },
        {
          id: 'legacy-1',
          dia: '2025-06-09',
          series: 5,
          repeticiones: 8,
          peso: 62.5,
          descansoMin: 3,
          rpe: null,
          nota: null,
          creadaEn: null,
        },
      ],
    });
  });

  it('tolera un documento sin series', () => {
    expect(registroDesdeFirestore('ej-2', {}).series).toEqual([]);
  });

  it('escribe con los nombres de campo existentes (numero, descanso) y conserva id y fecha', () => {
    const creadaEn = new Date('2026-09-14T10:00:00Z');
    const serie: Serie = {
      id: 's1',
      dia: '2026-09-14',
      series: 3,
      repeticiones: 12,
      peso: 20,
      descansoMin: 1,
      rpe: 8,
      nota: 'Buena técnica',
      creadaEn,
    };

    const dto = serieAFirestore(serie);
    expect(dto).toEqual({
      id: 's1',
      dia: '2026-09-14',
      numero: 3,
      repeticiones: 12,
      peso: 20,
      descanso: 1,
      rpe: 8,
      nota: 'Buena técnica',
      creadaEn,
    });
    expect(serieDesdeFirestore({ ...dto, creadaEn: { toDate: () => creadaEn } }, 0)).toEqual(serie);
  });

  it('lee el RPE y la nota y descarta los valores no válidos', () => {
    const serie = serieDesdeFirestore({ rpe: '9', nota: '  Subir peso  ' }, 0);
    expect(serie).toMatchObject({ rpe: 9, nota: 'Subir peso' });
    for (const rpe of [0, 11, 7.5, 'mucho', null]) {
      expect(serieDesdeFirestore({ rpe }, 0).rpe).toBeNull();
    }
    for (const nota of ['   ', 42, null]) {
      expect(serieDesdeFirestore({ nota }, 0).nota).toBeNull();
    }
  });

  describe('modificarSeries', () => {
    const antiguas = [
      { dia: '2025-06-02', numero: 4, repeticiones: 10, peso: 60, descanso: 2 },
      { dia: '2025-06-09', numero: 5, repeticiones: 8, peso: 62.5, descanso: 3 },
      { id: 's-nueva', dia: '2026-09-14', numero: 3, repeticiones: 12, peso: 20, descanso: 1, creadaEn: 'ts' },
    ];

    it('edita una serie antigua por su id legacy y fija los ids de todas', () => {
      const cambios = {
        dia: '2025-06-03',
        series: 3,
        repeticiones: 6,
        peso: 70,
        descansoMin: 4,
        rpe: 7,
        nota: null,
      };
      const resultado = modificarSeries(antiguas, 'legacy-1', cambios);

      expect(resultado.map((s) => s.id)).toEqual(['legacy-0', 'legacy-1', 's-nueva']);
      expect(resultado[1]).toEqual({
        id: 'legacy-1',
        dia: '2025-06-03',
        numero: 3,
        repeticiones: 6,
        peso: 70,
        descanso: 4,
        rpe: 7,
        nota: null,
      });
      expect(resultado[2]?.creadaEn).toBe('ts');
    });

    it('borrar una serie antigua no cambia el id de las siguientes', () => {
      const resultado = modificarSeries(antiguas, 'legacy-0', null);

      expect(resultado.map((s) => s.id)).toEqual(['legacy-1', 's-nueva']);
      expect(registroDesdeFirestore('ej', { series: resultado }).series.map((s) => s.id)).toEqual(['legacy-1', 's-nueva']);
    });

    it('lanza SerieNoEncontradaError si la serie ya no está', () => {
      expect(() => modificarSeries(antiguas, 'otra', null)).toThrow(SerieNoEncontradaError);
      expect(() => modificarSeries(undefined, 'legacy-0', null)).toThrow(SerieNoEncontradaError);
    });
  });
});
