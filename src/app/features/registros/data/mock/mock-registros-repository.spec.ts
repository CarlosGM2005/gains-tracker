import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { type EjercicioRegistrable, type NuevaSerie, SerieNoEncontradaError } from '../../domain/registro.model';
import { RegistrosRepository } from '../registros-repository';
import { MockRegistrosRepository } from './mock-registros-repository';

const UID = 'usuario-test';
const EJERCICIO: EjercicioRegistrable = { id: 'ej-1', nombre: 'Ejercicio 1', imagenFinal: 'final.svg' };
const SERIE: NuevaSerie = { dia: '2026-09-13', series: 3, repeticiones: 10, peso: 40, descansoMin: 2 };

describe('MockRegistrosRepository', () => {
  let repo: RegistrosRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: RegistrosRepository, useClass: MockRegistrosRepository }],
    });
    repo = TestBed.inject(RegistrosRepository);
  });

  it('un usuario sin registros recibe una lista vacía', async () => {
    expect(await firstValueFrom(repo.observar(UID))).toEqual([]);
  });

  it('crea el registro con nombre e imagen final al guardar la primera serie', async () => {
    await repo.agregarSerie(UID, EJERCICIO, SERIE);
    const [registro] = await firstValueFrom(repo.observar(UID));

    expect(registro?.ejercicioId).toBe('ej-1');
    expect(registro?.imagen).toBe('final.svg');
    expect(registro?.series).toHaveLength(1);
    expect(registro?.series[0]?.creadaEn).toBeInstanceOf(Date);
  });

  it('guarda dos series con los mismos valores (la app antigua perdía la segunda)', async () => {
    await repo.agregarSerie(UID, EJERCICIO, SERIE);
    await repo.agregarSerie(UID, EJERCICIO, SERIE);
    const [registro] = await firstValueFrom(repo.observar(UID));

    expect(registro?.series).toHaveLength(2);
    expect(registro?.series[0]?.id).not.toBe(registro?.series[1]?.id);
  });

  it('no mezcla registros de usuarios distintos', async () => {
    await repo.agregarSerie(UID, EJERCICIO, SERIE);

    expect(await firstValueFrom(repo.observar('otro-usuario'))).toEqual([]);
  });

  it('edita una serie conservando su id y su fecha de creación', async () => {
    await repo.agregarSerie(UID, EJERCICIO, SERIE);
    const [antes] = await firstValueFrom(repo.observar(UID));
    const serie = antes!.series[0]!;

    await repo.actualizarSerie(UID, 'ej-1', serie.id, { ...SERIE, peso: 55 });
    const [despues] = await firstValueFrom(repo.observar(UID));

    expect(despues?.series[0]).toMatchObject({ id: serie.id, peso: 55, creadaEn: serie.creadaEn });
  });

  it('al borrar la última serie desaparece el registro', async () => {
    await repo.agregarSerie(UID, EJERCICIO, SERIE);
    await repo.agregarSerie(UID, EJERCICIO, SERIE);
    const [registro] = await firstValueFrom(repo.observar(UID));
    const [primera, segunda] = registro!.series;

    await repo.borrarSerie(UID, 'ej-1', primera!.id);
    expect((await firstValueFrom(repo.observar(UID)))[0]?.series.map((s) => s.id)).toEqual([segunda!.id]);

    await repo.borrarSerie(UID, 'ej-1', segunda!.id);
    expect(await firstValueFrom(repo.observar(UID))).toEqual([]);
  });

  it('avisa si la serie ya no existe', async () => {
    await expect(repo.borrarSerie(UID, 'ej-1', 'no-existe')).rejects.toBeInstanceOf(SerieNoEncontradaError);
  });

  it('borra todos los registros de un usuario', async () => {
    await repo.agregarSerie(UID, EJERCICIO, SERIE);
    await repo.borrarTodos(UID);

    expect(await firstValueFrom(repo.observar(UID))).toEqual([]);
  });
});
