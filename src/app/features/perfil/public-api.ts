// API pública de la feature `perfil` para otras features (p. ej. el registro de usuarios).
export * from './domain/perfil.model';
export * from './domain/perfil.rules';
export { PerfilRepository } from './data/perfil-repository';
