// API pública de la feature `ejercicios` para otras features (p. ej. el inicio).
// El resto de carpetas de la feature son internas: ESLint impide importarlas desde fuera.
export * from './domain/ejercicio.model';
export * from './domain/busqueda';
export { EjerciciosRepository } from './data/ejercicios-repository';
export { CatalogoStore } from './state/catalogo-store';
export { EjerciciosListado, type EstadoListado, estadoListado } from './ui/ejercicios-listado';
