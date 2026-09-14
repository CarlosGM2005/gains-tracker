import { barajar, tomarAleatorios } from './shuffle';

describe('barajar', () => {
  it('conserva todos los elementos y no modifica el original', () => {
    const original = [1, 2, 3, 4, 5];
    const resultado = barajar(original);

    expect(resultado).toHaveLength(5);
    expect([...resultado].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(original).toEqual([1, 2, 3, 4, 5]);
  });

  it('es determinista con un generador fijo', () => {
    const siempreCero = () => 0;
    expect(barajar(['a', 'b', 'c'], siempreCero)).toEqual(['b', 'c', 'a']);
  });
});

describe('tomarAleatorios', () => {
  it('devuelve como máximo la cantidad pedida', () => {
    expect(tomarAleatorios([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 8)).toHaveLength(8);
  });

  it('devuelve todos si hay menos de los pedidos', () => {
    expect(tomarAleatorios([1, 2, 3], 8)).toHaveLength(3);
  });

  it('devuelve una lista vacía con cantidad negativa', () => {
    expect(tomarAleatorios([1, 2, 3], -1)).toEqual([]);
  });
});
