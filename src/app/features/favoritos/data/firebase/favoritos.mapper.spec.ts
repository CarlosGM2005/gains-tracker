import { idsFavoritos } from './favoritos.mapper';

describe('mapper de favoritos', () => {
  it('sin campo (perfiles antiguos) no hay favoritos', () => {
    expect(idsFavoritos(undefined)).toEqual([]);
    expect(idsFavoritos('ej-1')).toEqual([]);
  });

  it('descarta valores que no son ids y repetidos', () => {
    expect(idsFavoritos(['ej-1', 3, '', null, 'ej-2', 'ej-1'])).toEqual(['ej-1', 'ej-2']);
  });
});
