import { type Observable } from 'rxjs';

import { type CambiosPerfil, type Perfil } from '../domain/perfil.model';

/** Contrato de acceso a `usuarios/{uid}`. */
export abstract class PerfilRepository {
  /** Emite el perfil cada vez que cambia; `null` si no existe. */
  abstract observar(uid: string): Observable<Perfil | null>;

  abstract crear(perfil: Perfil): Promise<void>;

  /** Crea el perfil solo si no existe (primer login con Google o alta incompleta). */
  abstract crearSiNoExiste(perfil: Perfil): Promise<void>;

  abstract actualizar(uid: string, cambios: CambiosPerfil): Promise<void>;

  /** Sincroniza el email tras confirmar el cambio en Auth. */
  abstract sincronizarEmail(uid: string, email: string): Promise<void>;

  /** Borra el documento del perfil (incluye foto y favoritos). */
  abstract borrar(uid: string): Promise<void>;
}
