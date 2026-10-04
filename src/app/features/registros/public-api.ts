// API pública de la feature `registros` para otras features (p. ej. el detalle de ejercicio).
export * from './domain/registro.model';
export { LlamaRacha } from './ui/llama-racha';
export { RegistrarSerieService } from './ui/registrar-serie.service';
export { RegistrosRepository } from './data/registros-repository';
export { RegistrosStore } from './state/registros-store';
