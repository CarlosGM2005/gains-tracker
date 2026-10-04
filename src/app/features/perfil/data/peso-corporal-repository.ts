import { type Observable } from 'rxjs';

import { type RegistroPeso } from '../domain/peso-corporal.model';

/** Contrato de acceso a `usuarios/{uid}/pesos`: un documento por día, con el día como id. */
export abstract class PesoCorporalRepository {
  /** Emite el historial cada vez que cambia, del día más antiguo al más reciente. */
  abstract observar(uid: string): Observable<RegistroPeso[]>;

  /** Guarda el peso de un día. Si ese día ya tenía uno, lo sustituye. */
  abstract guardar(uid: string, registro: RegistroPeso): Promise<void>;

  /** Borra todo el historial (eliminar cuenta). */
  abstract borrarTodos(uid: string): Promise<void>;
}
