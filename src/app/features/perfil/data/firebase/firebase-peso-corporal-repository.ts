import { inject, Injectable } from '@angular/core';
import { collection, doc, getDocs, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { Observable } from 'rxjs';

import { FIRESTORE } from '@core/firebase/firebase.providers';

import { type RegistroPeso } from '../../domain/peso-corporal.model';
import { PesoCorporalRepository } from '../peso-corporal-repository';

const ruta = (uid: string) => `usuarios/${uid}/pesos`;

/** Máximo de operaciones por lote de escritura en Firestore. */
const TAMANO_LOTE = 500;

/**
 * Subcolección `usuarios/{uid}/pesos`, con el día (`YYYY-MM-DD`) como id del documento: así un
 * segundo registro del mismo día sustituye al primero sin tener que buscarlo.
 */
@Injectable()
export class FirebasePesoCorporalRepository extends PesoCorporalRepository {
  private readonly db = inject(FIRESTORE);

  observar(uid: string): Observable<RegistroPeso[]> {
    return new Observable((suscriptor) =>
      onSnapshot(
        collection(this.db, ruta(uid)),
        (snap) =>
          suscriptor.next(
            snap.docs
              .map((d) => ({ dia: d.id, kg: Number(d.get('kg')) }))
              .filter((p) => Number.isFinite(p.kg) && p.kg > 0)
              .sort((a, b) => a.dia.localeCompare(b.dia)),
          ),
        (error) => suscriptor.error(error),
      ),
    );
  }

  async guardar(uid: string, { dia, kg }: RegistroPeso): Promise<void> {
    await setDoc(doc(this.db, ruta(uid), dia), { dia, kg });
  }

  async borrarTodos(uid: string): Promise<void> {
    const snap = await getDocs(collection(this.db, ruta(uid)));
    for (let i = 0; i < snap.docs.length; i += TAMANO_LOTE) {
      const lote = writeBatch(this.db);
      snap.docs.slice(i, i + TAMANO_LOTE).forEach((d) => lote.delete(d.ref));
      await lote.commit();
    }
  }
}
