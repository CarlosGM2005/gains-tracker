import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
  onAuthStateChanged,
  User,
  signInWithRedirect,
  getRedirectResult
} from '@angular/fire/auth';

import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';

import { Router } from '@angular/router';
import { UserData } from '../interfaces/user.interface';
import { BehaviorSubject, Observable, of, switchMap, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private googleProvider = new GoogleAuthProvider();
  private userSubject = new BehaviorSubject<User | null>(null);

  user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    onAuthStateChanged(this.auth, user => {
      this.userSubject.next(user);
    });
  }

  private async guardarUsuarioSiEsNuevo(user: User): Promise<void> {
    const uid = user.uid;
    const userRef = doc(this.firestore, `usuarios/${uid}`);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData: UserData = {
        uid,
        nombre: user.displayName || '',
        email: user.email || '',
        telefono: '',
        edad: 0,
        peso: 0,
        altura: 0,
        createdAt: new Date()
      };
      await setDoc(userRef, userData);
    }
  }


  //Registarse con correo electronico, contraseña + datos 
  async register(userData: UserData, password: string): Promise<void> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, userData.email, password);
      const uid = credential.user.uid;

      const userRef = doc(this.firestore, `usuarios/${uid}`);
      await setDoc(userRef, {
        ...userData,
        uid,
        createdAt: new Date()
      });
      alert("¡Registro exitoso!");
      this.router.navigate(['/main']);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  //Iniciar sesion con usuario y contraseña
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/main']);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  //Iniciar sesion con Google
  async loginWithGoogle(): Promise<void> {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // En móvil, redirige a Google
        await signInWithRedirect(this.auth, this.googleProvider);
      } else {
        // En escritorio, usar popup como siempre
        const credential: UserCredential = await signInWithPopup(this.auth, this.googleProvider);
        await this.guardarUsuarioSiEsNuevo(credential.user);
        this.router.navigate(['/main']);
      }
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  }

  async handleRedirectResult(): Promise<void> {
    const result = await getRedirectResult(this.auth);
    if (result?.user) {
      await this.guardarUsuarioSiEsNuevo(result.user);
      this.router.navigate(['/main']);
    }
  }


  //Cerrar sesion
  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
      this.router.navigate(['/main']);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  //Obtener el uid del usuario
  async getUid(): Promise<string | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user ? user.uid : null);
      });
    });
  }

  //Obtener los datos del usuario
  getUserData(): Observable<UserData | null> {
    return this.user$.pipe(
      switchMap(user => {
        if (user?.uid) {
          const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
          return from(getDoc(userDocRef)).pipe(
            switchMap(docSnap => {
              if (docSnap.exists()) {
                return of(docSnap.data() as UserData);
              } else {
                return of(null);
              }
            })
          );
        } else {
          return of(null);
        }
      })
    );
  }

  //Actualizar usuario
  async actualizarUsuario(data: Partial<UserData>): Promise<void> {
    const uid = await this.getUid();
    if (!uid) throw new Error('Usuario no autenticado');

    const userRef = doc(this.firestore, `usuarios/${uid}`);
    await updateDoc(userRef, data);
  }
}
