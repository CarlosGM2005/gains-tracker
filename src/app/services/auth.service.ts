import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, UserCredential, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, docData } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { UserData } from '../interfaces/user.interface';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';

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

  // Registro con correo y contraseña + datos personalizados
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

      this.router.navigate(['/main']);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // Inicio de sesión con correo y contraseña
  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/main']);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Inicio de sesión con Google
  async loginWithGoogle(): Promise<void> {
    try {
      const credential: UserCredential = await signInWithPopup(this.auth, this.googleProvider);
      const user = credential.user;
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

      this.router.navigate(['/main']);
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.auth.signOut();
      this.router.navigate(['/main']);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  // Obtener uid actual (async porque auth puede tardar en cargar usuario)
  async getUid(): Promise<string | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe();
        resolve(user ? user.uid : null);
      });
    });
  }

  /// Devuelve los datos del usuario completos desde Firestore en tiempo real
  getUserData(): Observable<UserData | null> {
    return this.user$.pipe(
      switchMap(user => {
        if (user?.uid) {
          const userDocRef = doc(this.firestore, `usuarios/${user.uid}`);
          return docData(userDocRef) as Observable<UserData>;
        } else {
          return of(null);
        }
      })
    );
  }

}
