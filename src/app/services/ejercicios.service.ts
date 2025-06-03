import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, query, where, doc, docData, getDocs, getDoc } from '@angular/fire/firestore';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { Ejercicio } from '../interfaces/ejercicio.interface';

@Injectable({
  providedIn: 'root'
})
export class EjerciciosService {

  private readonly musculos = ['espalda', 'pecho', 'hombros', 'triceps', 'biceps', 'antebrazos', 'lumbares', 'abdominales', 'piernas'];
  private readonly niveles = ['principiante', 'intermedio', 'avanzado'];

  constructor(private firestore: Firestore) { }

  // Obtener ejercicios filtrando por músculo y nivel (ambos en minúsculas)
  getEjerciciosPorMusculoYNivel(musculo: string, nivel: string): Observable<Ejercicio[]> {
    // Ref de la colección
    const ejerciciosRef = collection(this.firestore, 'ejercicios');

    // Query con filtros
    const q = query(
      ejerciciosRef,
      where('musculo', '==', musculo.toLowerCase()),
      where('nivel', '==', nivel.toLowerCase())
    );

    // De promise a observable y mapear resultados
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const ejercicios: Ejercicio[] = [];
        querySnapshot.forEach(docSnap => {
          const data = docSnap.data() as Ejercicio;
          const { id, ...rest } = data; // excluimos id del contenido
          ejercicios.push({ id: docSnap.id, ...rest });
        });

        return ejercicios;
      })
    );
  }

  // Obtener ejercicios recomendados filtrando por músculo (en minúsculas)
  getEjerciciosRecomendadosPorMusculo(musculo: string): Observable<Ejercicio[]> {
    const musculoLower = musculo.toLowerCase();
    if (!this.musculos.includes(musculoLower)) {
      throw new Error(`Músculo inválido: ${musculo}. Intenta con uno de los buenos 💪`);
    }

    const ejerciciosRef = collection(this.firestore, 'ejercicios');
    const q = query(
      ejerciciosRef,
      where('recomendado', '==', true),
      where('musculo', '==', musculoLower)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const ejercicios: Ejercicio[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Ejercicio;
          const { id, ...rest } = data;
          ejercicios.push({ id: docSnap.id, ...rest });
        });
        return (ejercicios);
      })
    );
  }

  getEjerciciosRecomendados(): Observable<Ejercicio[]> {
    const ejerciciosRef = collection(this.firestore, 'ejercicios');
    const q = query(ejerciciosRef, where('recomendado', '==', true));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const ejercicios: Ejercicio[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Ejercicio;
          const { id, ...rest } = data; 
          ejercicios.push({ id: docSnap.id, ...rest });
        });

        
        const ejerciciosAleatorios = ejercicios.sort(() => Math.random() - 0.5);

        // Devolver solo 8 (o menos si hay menos de 8)
        return ejerciciosAleatorios.slice(0, 8);
      })
    );
  }


  // Obtener un ejercicio por su ID
  getEjercicioPorNombre(nombre: string): Observable<Ejercicio | undefined> {
    const ejerciciosRef = collection(this.firestore, 'ejercicios');
    const q = query(ejerciciosRef, where('nombre', '==', nombre));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) {
          return undefined;
        }
        const docSnap = snapshot.docs[0]; // coger el primero que encuentre
        const data = docSnap.data() as Ejercicio;
        const { id: _id, ...rest } = data;
        return { id: docSnap.id, ...rest };
      })
    );
  }

}
