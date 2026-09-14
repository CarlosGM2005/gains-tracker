import { type Ejercicio, type Musculo, type Nivel } from '../domain/ejercicio.model';

/**
 * Contrato de acceso a la colección de ejercicios (solo lectura).
 * Implementaciones: `mock/` ahora; `firebase/` cuando el proyecto Firebase esté activo.
 */
export abstract class EjerciciosRepository {
  abstract porNivelYMusculo(nivel: Nivel, musculo: Musculo): Promise<Ejercicio[]>;

  abstract recomendados(): Promise<Ejercicio[]>;

  abstract recomendadosPorMusculo(musculo: Musculo): Promise<Ejercicio[]>;

  abstract porId(id: string): Promise<Ejercicio | null>;

  /** Solo para redirigir enlaces antiguos `/main/info-exercice/:nombre`. */
  abstract porNombre(nombre: string): Promise<Ejercicio | null>;
}
