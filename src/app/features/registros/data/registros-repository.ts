import { type Observable } from 'rxjs';

import { type EjercicioRegistrable, type NuevaSerie, type RegistroEjercicio } from '../domain/registro.model';

/** Contrato de acceso a `usuarios/{uid}/registros`. */
export abstract class RegistrosRepository {
  /** Emite la lista completa cada vez que cambia (tiempo real). */
  abstract observar(uid: string): Observable<RegistroEjercicio[]>;

  /** Añade una serie. Crea el registro del ejercicio si todavía no existe. */
  abstract agregarSerie(uid: string, ejercicio: EjercicioRegistrable, serie: NuevaSerie): Promise<void>;
}
