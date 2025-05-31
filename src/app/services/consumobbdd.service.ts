import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class ConsumobbddService {

  constructor(private firestore: Firestore, private auth: Auth) {}

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
}
