import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, arrayUnion, getDocs, collection } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { ejercicioSerie } from '../interfaces/ejercicioSerie.interface';
import { collection as fbCollection } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class ConsumobbddService {

  constructor(private firestore: Firestore, private auth: Auth) { }

  async agregarSerieAEjercicio(
    idEjercicio: string,
    nombre: string,
    imagen: string,
    nuevaSerie: { dia: string; numero: number; repeticiones: number; peso: number; descanso: number }
  ): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const registroDocRef = doc(this.firestore, `usuarios/${user.uid}/registros/${idEjercicio}`);
    const registroSnap = await getDoc(registroDocRef);

    if (registroSnap.exists()) {
      await updateDoc(registroDocRef, {
        series: arrayUnion(nuevaSerie)
      });
    } else {
      await setDoc(registroDocRef, {
        id: idEjercicio,
        nombre,
        imagen,
        series: [nuevaSerie],
        isOpen: false
      });
    }
  }

  getEjerciciosRegistradosDelUsuario() {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of([] as ejercicioSerie[]);

        const registrosRef = collection(this.firestore, `usuarios/${user.uid}/registros`);

        return from(getDocs(registrosRef)).pipe(
          map(snapshot => {
            const ejercicios: ejercicioSerie[] = [];
            snapshot.forEach(doc => {
              const data = doc.data();
              ejercicios.push({
                id: doc.id,
                nombre: data['nombre'],
                imagen: data['imagen'],
                series: data['series'] || [],
                isOpen: data['isOpen'] ?? false
              });
            });
            return ejercicios;
          })
        );
      })
    );
  }
}

