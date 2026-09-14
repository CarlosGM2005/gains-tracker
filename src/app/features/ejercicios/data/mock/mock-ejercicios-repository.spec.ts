import { TestBed } from '@angular/core/testing';

import { MUSCULOS_FILTRO, NIVELES } from '../../domain/ejercicio.model';
import { EjerciciosRepository } from '../ejercicios-repository';
import { MockEjerciciosRepository } from './mock-ejercicios-repository';

describe('MockEjerciciosRepository', () => {
  let repo: EjerciciosRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: EjerciciosRepository, useClass: MockEjerciciosRepository }],
    });
    repo = TestBed.inject(EjerciciosRepository);
  });

  it('filtra por nivel y músculo', async () => {
    const resultado = await repo.porNivelYMusculo('intermedio', 'pecho');

    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((e) => e.nivel === 'intermedio' && e.musculo === 'pecho')).toBe(true);
  });

  it('tiene al menos una combinación vacía para probar el estado vacío', async () => {
    expect(await repo.porNivelYMusculo('intermedio', 'lumbares')).toEqual([]);
  });

  it('cubre todos los músculos de los filtros en algún nivel', async () => {
    for (const musculo of MUSCULOS_FILTRO) {
      const porNivel = await Promise.all(NIVELES.map((nivel) => repo.porNivelYMusculo(nivel, musculo)));
      expect(porNivel.flat().length).toBeGreaterThan(0);
    }
  });

  it('tiene más de 8 recomendados', async () => {
    const recomendados = await repo.recomendados();

    expect(recomendados.length).toBeGreaterThan(8);
    expect(recomendados.every((e) => e.recomendado)).toBe(true);
  });

  it('busca por id y por nombre exacto', async () => {
    expect((await repo.porId('ej-sentadilla'))?.nombre).toBe('Sentadilla');
    expect((await repo.porNombre('Sentadilla'))?.id).toBe('ej-sentadilla');
    expect(await repo.porNombre('sentadilla')).toBeNull();
    expect(await repo.porId('no-existe')).toBeNull();
  });

  it('devuelve copias: modificar el resultado no altera los datos', async () => {
    const [primero] = await repo.recomendados();
    primero!.nombre = 'cambiado';

    expect((await repo.porId(primero!.id))?.nombre).not.toBe('cambiado');
  });
});
