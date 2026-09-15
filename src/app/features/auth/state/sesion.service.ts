import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AuthStore } from '@core/auth/auth-store';
import { destinoSeguro } from '@core/auth/auth.guards';
import { type AuthUser } from '@core/auth/auth.model';
import { type Perfil, PerfilRepository } from '@features/perfil/public-api';

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  edad: number;
  peso: number;
  altura: number;
}

/** Orquesta Auth + perfil en Firestore para login, registro y Google. */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly auth = inject(AuthStore);
  private readonly perfiles = inject(PerfilRepository);
  private readonly router = inject(Router);

  async loginConEmail(email: string, password: string, returnUrl?: string): Promise<void> {
    await this.auth.loginConEmail(email, password);
    await this.router.navigateByUrl(destinoSeguro(returnUrl));
  }

  async loginConGoogle(returnUrl?: string): Promise<void> {
    const usuario = await this.auth.loginConGoogle();
    await this.perfiles.crearSiNoExiste(perfilVacio(usuario));
    await this.router.navigateByUrl(destinoSeguro(returnUrl));
  }

  async registrar(datos: DatosRegistro): Promise<void> {
    const usuario = await this.auth.registrar(datos.email, datos.password, datos.nombre);
    await this.perfiles.crear({
      uid: usuario.uid,
      nombre: datos.nombre.trim(),
      email: usuario.email,
      telefono: datos.telefono,
      edad: datos.edad,
      peso: datos.peso,
      altura: datos.altura,
      foto: null,
      creadoEn: new Date(),
    });
    await this.router.navigateByUrl(destinoSeguro(undefined));
  }
}

/** Perfil de un usuario de Google la primera vez que entra: sin datos físicos. */
function perfilVacio(usuario: AuthUser): Perfil {
  return {
    uid: usuario.uid,
    nombre: usuario.nombre ?? '',
    email: usuario.email,
    telefono: null,
    edad: null,
    peso: null,
    altura: null,
    foto: null,
    creadoEn: new Date(),
  };
}
