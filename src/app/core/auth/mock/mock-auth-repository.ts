import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, type Observable } from 'rxjs';

import { esperar, MOCK_LATENCY_MS } from '../../data/mock-latency';
import { AuthRepository } from '../auth-repository';
import { AuthError, type AuthUser } from '../auth.model';
import { DEMO_GOOGLE_USER, DEMO_PASSWORD, DEMO_USER } from './demo-user';

interface Cuenta {
  usuario: AuthUser;
  password: string;
}

/** Autenticación en memoria. La sesión se pierde al recargar (a propósito: no hay backend). */
@Injectable()
export class MockAuthRepository extends AuthRepository {
  private readonly latencia = inject(MOCK_LATENCY_MS);
  private readonly cuentas = new Map<string, Cuenta>([
    [DEMO_USER.email, { usuario: DEMO_USER, password: DEMO_PASSWORD }],
  ]);
  private readonly usuario = new BehaviorSubject<AuthUser | null | undefined>(undefined);

  readonly usuario$: Observable<AuthUser | null | undefined> = this.usuario.asObservable();

  constructor() {
    super();
    // Simula que la sesión inicial se resuelve de forma asíncrona.
    void esperar(this.latencia).then(() => this.usuario.next(null));
  }

  async loginConEmail(email: string, password: string): Promise<AuthUser> {
    await esperar(this.latencia);
    const cuenta = this.cuentas.get(email.toLowerCase());
    if (!cuenta || cuenta.password !== password) {
      throw new AuthError('credenciales-invalidas');
    }
    this.usuario.next(cuenta.usuario);
    return cuenta.usuario;
  }

  async loginConGoogle(): Promise<AuthUser> {
    await esperar(this.latencia);
    this.usuario.next(DEMO_GOOGLE_USER);
    return DEMO_GOOGLE_USER;
  }

  async registrar(email: string, password: string, nombre: string): Promise<AuthUser> {
    await esperar(this.latencia);
    const clave = email.toLowerCase();
    if (this.cuentas.has(clave)) {
      throw new AuthError('email-en-uso');
    }
    const usuario: AuthUser = {
      uid: `mock-${crypto.randomUUID()}`,
      email: clave,
      nombre,
      proveedor: 'password',
      emailVerificado: false,
    };
    this.cuentas.set(clave, { usuario, password });
    this.usuario.next(usuario);
    return usuario;
  }

  async logout(): Promise<void> {
    await esperar(this.latencia);
    this.usuario.next(null);
  }

  async solicitarCambioEmail(nuevoEmail: string): Promise<void> {
    await esperar(this.latencia);
    const actual = this.usuarioActual();
    if (this.cuentas.has(nuevoEmail.toLowerCase())) {
      throw new AuthError('email-en-uso');
    }
    // En Firebase el cambio espera a que el usuario confirme el enlace; aquí se aplica al momento.
    const cuenta = this.cuentas.get(actual.email);
    const usuario: AuthUser = { ...actual, email: nuevoEmail.toLowerCase() };
    this.cuentas.delete(actual.email);
    this.cuentas.set(usuario.email, { usuario, password: cuenta?.password ?? '' });
    this.usuario.next(usuario);
  }

  async reautenticar(password: string): Promise<void> {
    await esperar(this.latencia);
    const actual = this.usuarioActual();
    if (this.cuentas.get(actual.email)?.password !== password) {
      throw new AuthError('credenciales-invalidas');
    }
  }

  private usuarioActual(): AuthUser {
    const actual = this.usuario.value;
    if (!actual) {
      throw new AuthError('sin-sesion');
    }
    return actual;
  }
}
