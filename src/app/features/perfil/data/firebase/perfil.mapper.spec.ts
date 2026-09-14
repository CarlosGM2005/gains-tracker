import { cambiosAFirestore, perfilAFirestore, perfilDesdeFirestore } from './perfil.mapper';

describe('mapper de perfil', () => {
  it('lee un perfil completo de la app antigua', () => {
    const createdAt = new Date('2025-05-01T10:00:00Z');
    const perfil = perfilDesdeFirestore('u1', {
      uid: 'u1',
      nombre: 'Ana',
      email: 'ana@gains.dev',
      telefono: '600111222',
      edad: 30,
      peso: 60,
      altura: 1.65,
      createdAt: { toDate: () => createdAt },
    });

    expect(perfil).toEqual({
      uid: 'u1',
      nombre: 'Ana',
      email: 'ana@gains.dev',
      telefono: '600111222',
      edad: 30,
      peso: 60,
      altura: 1.65,
      creadoEn: createdAt,
    });
  });

  it('convierte los vacíos antiguos de Google en null', () => {
    const perfil = perfilDesdeFirestore('g1', { nombre: 'G', email: 'g@x.es', telefono: '', edad: 0, peso: 0, altura: 0 });

    expect(perfil).toMatchObject({ telefono: null, edad: null, peso: null, altura: null });
  });

  it('escribe con los nombres de campo existentes', () => {
    const creadoEn = new Date();
    const dto = perfilAFirestore({
      uid: 'u1',
      nombre: 'Ana',
      email: 'a@b.es',
      telefono: null,
      edad: null,
      peso: 70,
      altura: 1.7,
      creadoEn,
    });

    expect(dto).toEqual({ uid: 'u1', nombre: 'Ana', email: 'a@b.es', telefono: null, edad: null, peso: 70, altura: 1.7, createdAt: creadoEn });
  });

  it('solo envía los cambios presentes', () => {
    expect(cambiosAFirestore({ edad: 25, telefono: null })).toEqual({ edad: 25, telefono: null });
  });
});
