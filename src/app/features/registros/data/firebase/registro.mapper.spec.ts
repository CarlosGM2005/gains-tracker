import { type Serie } from '../../domain/registro.model';
import { registroDesdeFirestore, serieAFirestore, serieDesdeFirestore } from './registro.mapper';

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
        { id: 'legacy-0', dia: '2025-06-02', series: 4, repeticiones: 10, peso: 60, descansoMin: 2, creadaEn: null },
        { id: 'legacy-1', dia: '2025-06-09', series: 5, repeticiones: 8, peso: 62.5, descansoMin: 3, creadaEn: null },
      ],
    });
  });

  it('tolera un documento sin series', () => {
    expect(registroDesdeFirestore('ej-2', {}).series).toEqual([]);
  });

  it('escribe con los nombres de campo existentes (numero, descanso) y conserva id y fecha', () => {
    const creadaEn = new Date('2026-09-14T10:00:00Z');
    const serie: Serie = { id: 's1', dia: '2026-09-14', series: 3, repeticiones: 12, peso: 20, descansoMin: 1, creadaEn };

    const dto = serieAFirestore(serie);
    expect(dto).toEqual({ id: 's1', dia: '2026-09-14', numero: 3, repeticiones: 12, peso: 20, descanso: 1, creadaEn });
    expect(serieDesdeFirestore({ ...dto, creadaEn: { toDate: () => creadaEn } }, 0)).toEqual(serie);
  });
});
