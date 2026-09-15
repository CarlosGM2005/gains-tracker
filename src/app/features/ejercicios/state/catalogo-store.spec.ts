import { TestBed } from '@angular/core/testing';

import { EjerciciosRepository } from '../data/ejercicios-repository';
import { MockEjerciciosRepository } from '../data/mock/mock-ejercicios-repository';
import { CatalogoStore } from './catalogo-store';

describe('CatalogoStore', () => {
  let store: CatalogoStore;
  let repo: EjerciciosRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: EjerciciosRepository, useClass: MockEjerciciosRepository }],
    });
    store = TestBed.inject(CatalogoStore);
    repo = TestBed.inject(EjerciciosRepository);
  });

  it('consulta el repositorio una sola vez por combinación', async () => {
    const espia = vi.spyOn(repo, 'porNivelYMusculo');

    await store.porNivelYMusculo('intermedio', 'pecho');
    await store.porNivelYMusculo('intermedio', 'pecho');

    expect(espia).toHaveBeenCalledTimes(1);
  });

  it('filtra recomendados por músculo desde la lista cacheada', async () => {
    await store.recomendados();
    const espia = vi.spyOn(repo, 'recomendadosPorMusculo');

    const piernas = await store.recomendadosPorMusculo('piernas');

    expect(espia).not.toHaveBeenCalled();
    expect(piernas.length).toBeGreaterThan(0);
    expect(piernas.every((e) => e.musculo === 'piernas' && e.recomendado)).toBe(true);
  });

  it('encuentra un ejercicio por id en la caché sin volver a consultar', async () => {
    await store.porNivelYMusculo('intermedio', 'piernas');
    const espia = vi.spyOn(repo, 'porId');

    expect((await store.porId('ej-sentadilla'))?.nombre).toBe('Sentadilla');
    expect(espia).not.toHaveBeenCalled();
  });

  it('carga el catálogo completo una vez y lo usa para buscar por id', async () => {
    const todos = vi.spyOn(repo, 'todos');
    const porId = vi.spyOn(repo, 'porId');

    const [primera, segunda] = await Promise.all([store.todos(), store.todos()]);
    expect(todos).toHaveBeenCalledTimes(1);
    expect(primera?.length).toBe(segunda?.length);
    expect(await store.porId('ej-press-de-banca')).not.toBeNull();
    expect(porId).not.toHaveBeenCalled();
  });

  it('olvida una consulta fallida para poder reintentar', async () => {
    const espia = vi.spyOn(repo, 'recomendados').mockRejectedValueOnce(new Error('sin red'));

    await expect(store.recomendados()).rejects.toThrow('sin red');
    await expect(store.recomendados()).resolves.toBeInstanceOf(Array);
    expect(espia).toHaveBeenCalledTimes(2);
  });

  it('devuelve copias', async () => {
    const [primero] = await store.recomendados();
    primero!.nombre = 'cambiado';

    const [otraVez] = await store.recomendados();
    expect(otraVez!.nombre).not.toBe('cambiado');
  });
});
