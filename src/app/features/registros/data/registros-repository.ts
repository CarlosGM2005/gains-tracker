import { type Observable } from 'rxjs';

import { type EjercicioRegistrable, type NuevaSerie, type RegistroEjercicio } from '../domain/registro.model';

/** Contrato de acceso a `usuarios/{uid}/registros`. */
export abstract class RegistrosRepository {
  /** Emite la lista completa cada vez que cambia (tiempo real). */
  abstract observar(uid: string): Observable<RegistroEjercicio[]>;

  /** Añade una serie. Crea el registro del ejercicio si todavía no existe. */
  abstract agregarSerie(uid: string, ejercicio: EjercicioRegistrable, serie: NuevaSerie): Promise<void>;

  /** Sustituye los datos de una serie (conserva su id y su fecha de creación). */
  abstract actualizarSerie(uid: string, ejercicioId: string, serieId: string, cambios: NuevaSerie): Promise<void>;

  /** Borra una serie. Si era la última del ejercicio, borra también su registro. */
  abstract borrarSerie(uid: string, ejercicioId: string, serieId: string): Promise<void>;

  /** Borra todos los registros del usuario (eliminar cuenta). */
  abstract borrarTodos(uid: string): Promise<void>;
}
