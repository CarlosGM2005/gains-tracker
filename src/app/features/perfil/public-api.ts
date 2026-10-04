// API pública de la feature `perfil` para otras features (p. ej. el registro de usuarios).
export * from './domain/perfil.model';
export * from './domain/perfil.rules';
export { PerfilRepository } from './data/perfil-repository';
export * from './domain/peso-corporal.model';
export { PesoCorporalRepository } from './data/peso-corporal-repository';
export { PesoCorporal } from './ui/peso-corporal';
