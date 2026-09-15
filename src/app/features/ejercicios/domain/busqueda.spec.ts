import { buscarEjercicios, normalizarBusqueda } from './busqueda';
import { type Ejercicio } from './ejercicio.model';

function ejercicio(id: string, nombre: string, extra: Partial<Ejercicio> = {}): Ejercicio {
  return {
    id,
    nombre,
    musculo: 'pecho',
    nivel: 'intermedio',
    musculosImplicados: null,
    descripcion: '',
    imagenInicio: 'inicio.svg',
    imagenFinal: 'final.svg',
    recomendado: false,
    ...extra,
  };
}

const CATALOGO: Ejercicio[] = [
  ejercicio('1', 'Press de banca', { musculosImplicados: 'Pectoral mayor, tríceps' }),
  ejercicio('2', 'Sentadilla', { musculo: 'piernas', musculosImplicados: 'Cuádriceps, glúteos' }),
  ejercicio('3', 'Extensión de tríceps', { musculo: 'triceps' }),
  ejercicio('4', 'Aperturas', { musculosImplicados: 'Pectoral' }),
];

describe('búsqueda de ejercicios', () => {
  it('normaliza tildes, mayúsculas y espacios', () => {
    expect(normalizarBusqueda('  TRÍCEPS   Polea ')).toBe('triceps polea');
  });

  it('sin término devuelve todo ordenado por nombre', () => {
    expect(buscarEjercicios(CATALOGO, '').map((e) => e.id)).toEqual(['4', '3', '1', '2']);
  });

  it('busca sin tildes en nombre, músculo y músculos implicados', () => {
    expect(buscarEjercicios(CATALOGO, 'triceps').map((e) => e.id)).toEqual(['3', '1']);
    expect(buscarEjercicios(CATALOGO, 'gluteos').map((e) => e.id)).toEqual(['2']);
  });

  it('exige todas las palabras en cualquier orden', () => {
    expect(buscarEjercicios(CATALOGO, 'banca press').map((e) => e.id)).toEqual(['1']);
    expect(buscarEjercicios(CATALOGO, 'press sentadilla')).toEqual([]);
  });

  it('combina el término con el filtro de músculo', () => {
    expect(buscarEjercicios(CATALOGO, 'pectoral', 'pecho').map((e) => e.id)).toEqual(['4', '1']);
    expect(buscarEjercicios(CATALOGO, '', 'piernas').map((e) => e.id)).toEqual(['2']);
  });
});
