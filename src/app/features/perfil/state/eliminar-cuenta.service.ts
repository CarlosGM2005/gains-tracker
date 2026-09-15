import { inject, Injectable } from '@angular/core';

import { AuthStore } from '@core/auth/auth-store';
import { AuthError } from '@core/auth/auth.model';
import { RegistrosRepository } from '@features/registros/public-api';

import { PerfilRepository } from '../data/perfil-repository';

/**
 * Elimina la cuenta y todos sus datos (lo promete la política de privacidad).
 * Orden pensado para no dejar a medias lo importante:
 * 1. Reautenticar primero: `deleteUser` exige un login reciente y así no falla después de borrar datos.
 * 2. Registros (subcolección) y perfil (incluye foto y favoritos). Las reglas solo dejan borrar al dueño,
 *    así que tiene que hacerse antes de borrar el usuario de Auth.
 * 3. Usuario de Auth, que además cierra la sesión.
 */
@Injectable({ providedIn: 'root' })
export class EliminarCuentaService {
  private readonly auth = inject(AuthStore);
  private readonly perfiles = inject(PerfilRepository);
  private readonly registros = inject(RegistrosRepository);

  /** `password` solo se usa con cuentas de correo; las de Google confirman en una ventana de Google. */
  async eliminar(password: string | null): Promise<void> {
    const usuario = this.auth.sesion();
    if (!usuario) {
      throw new AuthError('sin-sesion');
    }

    if (usuario.proveedor === 'google') {
      await this.auth.reautenticarConGoogle();
    } else {
      await this.auth.reautenticar(password ?? '');
    }

    await this.registros.borrarTodos(usuario.uid);
    await this.perfiles.borrar(usuario.uid);
    await this.auth.eliminarCuenta();
  }
}
