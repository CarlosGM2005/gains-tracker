import { type Observable } from 'rxjs';

/** Contrato de acceso a los ejercicios favoritos del usuario (campo `favoritos` de `usuarios/{uid}`). */
export abstract class FavoritosRepository {
  /** Ids de los ejercicios favoritos, en tiempo real. */
  abstract observar(uid: string): Observable<readonly string[]>;

  abstract marcar(uid: string, ejercicioId: string, favorito: boolean): Promise<void>;
}
