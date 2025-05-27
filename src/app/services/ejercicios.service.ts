import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Ejercicio } from '../interfaces/ejercicio.interface';

@Injectable({
  providedIn: 'root'
})


export class EjerciciosService {

  private readonly musculos = ['ESPALDA', 'PECHO', 'HOMBROS', 'TRICEPS', 'BICEPS', 'ANTEBRAZOS', 'LUMBARES', 'ABDOMINALES', 'PIERNAS'];
  private readonly niveles = ['principiante', 'intermedio', 'avanzado'];

  constructor(private firestore: AngularFirestore) { }

  //Puede usarse para el main
  getEjerciciosPorMusculo(musculo: string): Observable<Ejercicio[]> {
    if (!this.musculos.includes(musculo.toUpperCase())) {
      throw new Error(`Músculo inválido: ${musculo}. Intenta con uno de los buenos 💪`);
    }

    return this.firestore.collection<Ejercicio>('ejercicios', ref =>
      ref.where('musculo', '==', musculo.toLowerCase())
    ).valueChanges({ idField: 'id' });
  }

  //Se usa para la parte de ejercicios dependiendo del nivel
  getEjerciciosPorMusculoYNivel(musculo: string, nivel: string): Observable<Ejercicio[]> {
    const musculoUpper = musculo.toUpperCase();
    const nivelLower = nivel.toLowerCase();

    if (!this.musculos.includes(musculoUpper)) {
      throw new Error(`Músculo inválido: ${musculo}. Intenta con uno de los buenos 💪`);
    }

    if (!this.niveles.includes(nivelLower)) {
      throw new Error(`Nivel inválido: ${nivel}. Los niveles válidos son Principiante, Intermedio o Avanzado.`);
    }

    return this.firestore.collection<Ejercicio>('ejercicios', ref =>
      ref
        .where('musculo', '==', musculoUpper)
        .where('nivel', '==', nivelLower)
    ).valueChanges({ idField: 'id' });
  }

  //Se usa en la parte de recomendados
  getEjerciciosRecomendadosPorMusculo(musculo: string): Observable<Ejercicio[]> {
    if (!this.musculos.includes(musculo.toUpperCase())) {
      throw new Error(`Músculo inválido: ${musculo}. Intenta con uno de los buenos 💪`);
    }

    return this.firestore.collection<Ejercicio>('ejercicios', ref =>
      ref
        .where('recomendado', '==', 'si')
        .where('musculo', '==', musculo.toLowerCase())
    ).valueChanges({ idField: 'id' });
  }

  getEjercicioPorId(id: string): Observable<Ejercicio | undefined> {
    return this.firestore.doc<Ejercicio>(`ejercicios/${id}`).valueChanges({ idField: 'id' });
  }


}
