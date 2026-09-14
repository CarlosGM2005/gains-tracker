import { inject, Injectable } from '@angular/core';
import { arrayUnion, collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';

import { FIRESTORE } from '@core/firebase/firebase.providers';

import { type EjercicioRegistrable, type NuevaSerie, type RegistroEjercicio } from '../../domain/registro.model';
import { RegistrosRepository } from '../registros-repository';
import { type RegistroDto, registroDesdeFirestore, serieAFirestore } from './registro.mapper';

const ruta = (uid: string) => `usuarios/${uid}/registros`;

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
}
