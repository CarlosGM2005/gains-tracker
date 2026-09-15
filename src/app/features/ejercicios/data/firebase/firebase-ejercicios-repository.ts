import { inject, Injectable } from '@angular/core';
import { collection, doc, getDoc, getDocs, limit, query, type Query, where } from 'firebase/firestore';

import { FIRESTORE } from '@core/firebase/firebase.providers';

import { type Ejercicio, type Musculo, type Nivel } from '../../domain/ejercicio.model';
import { EjerciciosRepository } from '../ejercicios-repository';
import { type EjercicioDto, ejercicioDesdeFirestore } from './ejercicio.mapper';

const COLECCION = 'ejercicios';

/** Colección `ejercicios` (solo lectura). Las consultas de dos igualdades no necesitan índice compuesto. */
@Injectable()
export class FirebaseEjerciciosRepository extends EjerciciosRepository {
  private readonly db = inject(FIRESTORE);

  todos(): Promise<Ejercicio[]> {
    return this.consultar(query(this.coleccion()));
  }

  porNivelYMusculo(nivel: Nivel, musculo: Musculo): Promise<Ejercicio[]> {
    return this.consultar(query(this.coleccion(), where('musculo', '==', musculo), where('nivel', '==', nivel)));
  }

  recomendados(): Promise<Ejercicio[]> {
    return this.consultar(query(this.coleccion(), where('recomendado', '==', true)));
  }

  recomendadosPorMusculo(musculo: Musculo): Promise<Ejercicio[]> {
    return this.consultar(
      query(this.coleccion(), where('recomendado', '==', true), where('musculo', '==', musculo)),
    );
  }

  async porId(id: string): Promise<Ejercicio | null> {
    const snap = await getDoc(doc(this.db, COLECCION, id));
    return snap.exists() ? ejercicioDesdeFirestore(snap.id, snap.data() as EjercicioDto) : null;
  }

  async porNombre(nombre: string): Promise<Ejercicio | null> {
    const [primero] = await this.consultar(query(this.coleccion(), where('nombre', '==', nombre), limit(1)));
    return primero ?? null;
  }

  private coleccion() {
    return collection(this.db, COLECCION);
  }

  private async consultar(consulta: Query): Promise<Ejercicio[]> {
    const snap = await getDocs(consulta);
    return snap.docs
      .map((d) => ejercicioDesdeFirestore(d.id, d.data() as EjercicioDto))
      .filter((e): e is Ejercicio => e !== null);
  }
}
