import { inject, Injectable } from '@angular/core';
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  onSnapshot,
  runTransaction,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { Observable } from 'rxjs';

import { FIRESTORE } from '@core/firebase/firebase.providers';

import {
  type EjercicioRegistrable,
  type NuevaSerie,
  type RegistroEjercicio,
  SerieNoEncontradaError,
} from '../../domain/registro.model';
import { RegistrosRepository } from '../registros-repository';
import { modificarSeries, type RegistroDto, registroDesdeFirestore, serieAFirestore } from './registro.mapper';

const ruta = (uid: string) => `usuarios/${uid}/registros`;

/** Máximo de operaciones por lote de escritura en Firestore. */
const TAMANO_LOTE = 500;

/** Subcolección `usuarios/{uid}/registros`: un documento por ejercicio con el array `series`. */
@Injectable()
export class FirebaseRegistrosRepository extends RegistrosRepository {
  private readonly db = inject(FIRESTORE);

  observar(uid: string): Observable<RegistroEjercicio[]> {
    return new Observable((suscriptor) =>
      onSnapshot(
        collection(this.db, ruta(uid)),
        (snap) => suscriptor.next(snap.docs.map((d) => registroDesdeFirestore(d.id, d.data() as RegistroDto))),
        (error) => suscriptor.error(error),
      ),
    );
  }

  /**
   * Una sola escritura: crea el documento si no existe y añade la serie al array.
   * La serie lleva `id` único, así que `arrayUnion` nunca la descarta por repetida.
   * `nombre` e `imagen` se actualizan con los datos vigentes del ejercicio.
   */
  async agregarSerie(uid: string, ejercicio: EjercicioRegistrable, nueva: NuevaSerie): Promise<void> {
    const serie = serieAFirestore({ ...nueva, id: crypto.randomUUID(), creadaEn: new Date() });
    await setDoc(
      doc(this.db, ruta(uid), ejercicio.id),
      { id: ejercicio.id, nombre: ejercicio.nombre, imagen: ejercicio.imagenFinal, series: arrayUnion(serie) },
      { merge: true },
    );
  }

  actualizarSerie(uid: string, ejercicioId: string, serieId: string, cambios: NuevaSerie): Promise<void> {
    return this.modificar(uid, ejercicioId, serieId, cambios);
  }

  borrarSerie(uid: string, ejercicioId: string, serieId: string): Promise<void> {
    return this.modificar(uid, ejercicioId, serieId, null);
  }

  async borrarTodos(uid: string): Promise<void> {
    const snap = await getDocs(collection(this.db, ruta(uid)));
    for (let i = 0; i < snap.docs.length; i += TAMANO_LOTE) {
      const lote = writeBatch(this.db);
      snap.docs.slice(i, i + TAMANO_LOTE).forEach((d) => lote.delete(d.ref));
      await lote.commit();
    }
  }

  /**
   * Firestore no permite editar un elemento de un array: se lee el array, se cambia y se reescribe en
   * una transacción, así una serie añadida a la vez desde otro dispositivo no se pierde.
   */
  private async modificar(uid: string, ejercicioId: string, serieId: string, cambios: NuevaSerie | null): Promise<void> {
    const ref = doc(this.db, ruta(uid), ejercicioId);
    await runTransaction(this.db, async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists()) {
        throw new SerieNoEncontradaError(serieId);
      }
      const series = modificarSeries((snap.data() as RegistroDto).series, serieId, cambios);
      if (series.length === 0) {
        tx.delete(ref);
      } else {
        tx.update(ref, { series });
      }
    });
  }
}
