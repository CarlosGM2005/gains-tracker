import { inject, Injectable, Injector } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { concatMap, distinctUntilChanged, filter } from 'rxjs';

import { AuthStore } from '@core/auth/auth-store';
import { destinoSeguro } from '@core/auth/auth.guards';
import { type AuthUser } from '@core/auth/auth.model';
import { type Perfil, PerfilRepository, PesoCorporalRepository } from '@features/perfil/public-api';
import { diaLocal } from '@shared/utils/fechas';

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
  private readonly pesos = inject(PesoCorporalRepository);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  /** Mientras se registra, el perfil completo lo crea `registrar()`: no se adelanta uno vacío. */
  private registrando = false;

  /**
   * Crea el perfil vacío de cualquier sesión que llegue sin él. El login con Google por redirección
   * (app instalada o popup bloqueado) vuelve recargando la página y nunca pasa por
   * `loginConGoogle()`, y un alta cuyo perfil no llegó a guardarse se queda sin documento. Sin
   * perfil no carga la pantalla de perfil ni se pueden guardar favoritos.
   */
  iniciar(): void {
    toObservable(this.auth.sesion, { injector: this.injector })
      .pipe(
        filter((usuario): usuario is AuthUser => !!usuario),
        distinctUntilChanged((a, b) => a.uid === b.uid),
        filter(() => !this.registrando),
        concatMap((usuario) =>
          this.perfiles
            .crearSiNoExiste(perfilVacio(usuario))
            .catch((e: unknown) => console.error('No se pudo crear el perfil de la sesión', e)),
        ),
      )
      .subscribe();
  }

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
    this.registrando = true;
    try {
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
      // El peso del alta es el primer punto del historial de peso corporal. Si falla, la cuenta ya
      // está creada: no se da el registro por fallido.
      if (datos.peso > 0) {
        await this.pesos
          .guardar(usuario.uid, { dia: diaLocal(new Date()), kg: datos.peso })
          .catch((e: unknown) => console.error('No se pudo apuntar el primer peso', e));
      }
    } finally {
      this.registrando = false;
    }
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
