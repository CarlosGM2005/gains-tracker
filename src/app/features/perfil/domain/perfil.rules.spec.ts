import { FormControl, type ValidatorFn } from '@angular/forms';

import { VALIDADORES_PASSWORD, validadoresPerfil } from './perfil.rules';

function valido(validadores: ValidatorFn[], valor: unknown): boolean {
  return new FormControl(valor, validadores).valid;
}

describe('validadoresPerfil', () => {
  const registro = validadoresPerfil(true);
  const edicion = validadoresPerfil(false);

  it('edad: de 14 a 99', () => {
    expect(valido(registro.edad, 13)).toBe(false);
    expect(valido(registro.edad, 14)).toBe(true);
    expect(valido(registro.edad, 99)).toBe(true);
    expect(valido(registro.edad, 100)).toBe(false);
  });

  it('teléfono: exactamente 9 dígitos', () => {
    expect(valido(registro.telefono, '600123456')).toBe(true);
    expect(valido(registro.telefono, '60012345')).toBe(false);
    expect(valido(registro.telefono, '60012345a')).toBe(false);
  });

  it('altura: de 1.00 a 2.50 metros', () => {
    expect(valido(registro.altura, 0.99)).toBe(false);
    expect(valido(registro.altura, 1.78)).toBe(true);
    expect(valido(registro.altura, 2.51)).toBe(false);
  });

  it('en el registro los datos físicos son obligatorios; al editar no', () => {
    expect(valido(registro.peso, null)).toBe(false);
    expect(valido(edicion.peso, null)).toBe(true);
    expect(valido(edicion.peso, 20)).toBe(false);
  });

  it('el nombre es obligatorio siempre', () => {
    expect(valido(edicion.nombre, '')).toBe(false);
  });
});

describe('VALIDADORES_PASSWORD', () => {
  it('mínimo 8 caracteres de cualquier tipo', () => {
    expect(valido(VALIDADORES_PASSWORD, 'abc12345')).toBe(true);
    expect(valido(VALIDADORES_PASSWORD, 'Añ$ 1!.é')).toBe(true);
    expect(valido(VALIDADORES_PASSWORD, 'abc1234')).toBe(false);
    expect(valido(VALIDADORES_PASSWORD, '')).toBe(false);
  });
});
