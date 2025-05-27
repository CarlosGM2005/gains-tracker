import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { UserData } from '../interfaces/user.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private googleProvider = new GoogleAuthProvider();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) { }

  // 📌 Registro con correo y contraseña + datos personalizados
  async register(userData: UserData, password: string): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, userData.email, password);
    const uid = credential.user.uid;

    const userRef = doc(this.firestore, `usuarios/${uid}`);
    await setDoc(userRef, {
      ...userData,
      uid,
      createdAt: new Date()
    });

    this.router.navigate(['/main']);
  }

  // 📌 Inicio de sesión con correo y contraseña
  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
    this.router.navigate(['/main']);
  }

  // 📌 Inicio de sesión con Google
  async loginWithGoogle(): Promise<void> {
    const credential: UserCredential = await signInWithPopup(this.auth, this.googleProvider);
    const user = credential.user;
    const uid = user.uid;

    const userRef = doc(this.firestore, `usuarios/${uid}`);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Si el usuario entra por primera vez, creamos su doc en Firestore
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
  }

  // 📌 Logout
  async logout(): Promise<void> {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }
}
