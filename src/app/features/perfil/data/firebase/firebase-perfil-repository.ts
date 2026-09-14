import { inject, Injectable } from '@angular/core';
import { doc, onSnapshot, runTransaction, setDoc, updateDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

import { FIRESTORE } from '@core/firebase/firebase.providers';

import { type CambiosPerfil, type Perfil } from '../../domain/perfil.model';
import { PerfilRepository } from '../perfil-repository';
import { cambiosAFirestore, perfilAFirestore, type PerfilDto, perfilDesdeFirestore } from './perfil.mapper';

/** Documento `usuarios/{uid}`. */
@Injectable()
export class FirebasePerfilRepository extends PerfilRepository {
  private readonly db = inject(FIRESTORE);

  observar(uid: string): Observable<Perfil | null> {
    return new Observable((suscriptor) =>
      onSnapshot(
        this.ref(uid),
        (snap) => suscriptor.next(snap.exists() ? perfilDesdeFirestore(uid, snap.data() as PerfilDto) : null),
        (error) => suscriptor.error(error),
      ),
    );
  }

  async crear(perfil: Perfil): Promise<void> {
    await setDoc(this.ref(perfil.uid), perfilAFirestore(perfil));
  }

  /** Transacción: dos logins con Google a la vez no crean el perfil dos veces ni pisan datos. */
  async crearSiNoExiste(perfil: Perfil): Promise<void> {
    const ref = this.ref(perfil.uid);
    await runTransaction(this.db, async (tx) => {
      if (!(await tx.get(ref)).exists()) {
        tx.set(ref, perfilAFirestore(perfil));
      }
    });
  }

  async actualizar(uid: string, cambios: CambiosPerfil): Promise<void> {
    await updateDoc(this.ref(uid), cambiosAFirestore(cambios));
  }

  async sincronizarEmail(uid: string, email: string): Promise<void> {
    await updateDoc(this.ref(uid), { email });
  }

  private ref(uid: string) {
    return doc(this.db, 'usuarios', uid);
  }
}
