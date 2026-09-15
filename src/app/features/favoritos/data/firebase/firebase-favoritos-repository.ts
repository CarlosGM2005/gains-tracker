import { inject, Injectable } from '@angular/core';
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

import { FIRESTORE } from '@core/firebase/firebase.providers';

import { FavoritosRepository } from '../favoritos-repository';
import { idsFavoritos } from './favoritos.mapper';

/**
 * Array `favoritos` dentro de `usuarios/{uid}`: no hace falta otra colección ni otra lectura, y se
 * borra junto al perfil al eliminar la cuenta. El perfil ya existe siempre (se crea al registrarse).
 */
@Injectable()
export class FirebaseFavoritosRepository extends FavoritosRepository {
  private readonly db = inject(FIRESTORE);

  observar(uid: string): Observable<readonly string[]> {
    return new Observable((suscriptor) =>
      onSnapshot(
        doc(this.db, 'usuarios', uid),
        (snap) => suscriptor.next(idsFavoritos(snap.get('favoritos'))),
        (error) => suscriptor.error(error),
      ),
    );
  }

  async marcar(uid: string, ejercicioId: string, favorito: boolean): Promise<void> {
    await updateDoc(doc(this.db, 'usuarios', uid), {
      favoritos: favorito ? arrayUnion(ejercicioId) : arrayRemove(ejercicioId),
    });
  }
}
