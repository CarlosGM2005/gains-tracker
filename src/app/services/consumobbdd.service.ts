import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class ConsumobbddService {

  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth) {}




  //Agregar 
  async agregarSerieAEjercicio(
    idEjercicio: string, 
    nombre: string, 
    imagen: string, 
    nuevaSerie: { dia: string, numero: number, repeticiones: number, peso: number, descanso: number }
  ): Promise<void> {
    const user = await this.auth.currentUser;
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const registroDocRef = this.firestore.doc(`usuarios/${user.uid}/registros/${idEjercicio}`);
    
    const registroSnap = await registroDocRef.ref.get();

    if (registroSnap.exists) {
      
      return registroDocRef.update({
        series: firebase.firestore.FieldValue.arrayUnion(nuevaSerie)
      });
    } else {
      return registroDocRef.set({
        id: idEjercicio,
        nombre,
        imagen,
        series: [nuevaSerie],
        isOpen: false
      });
    }
  }
}
