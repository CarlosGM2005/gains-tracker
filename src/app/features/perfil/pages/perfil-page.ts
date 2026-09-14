import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthStore } from '@core/auth/auth-store';
import { ToastService } from '@core/notifications/toast.service';
import { BackButton } from '@shared/ui/back-button/back-button';
import { EmptyState } from '@shared/ui/empty-state/empty-state';
import { Spinner } from '@shared/ui/spinner/spinner';

import { PerfilStore } from '../state/perfil-store';
import { PerfilResumen } from '../ui/perfil-resumen';

@Component({
  selector: 'app-perfil-page',
  imports: [RouterLink, BackButton, EmptyState, Spinner, PerfilResumen],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.scss',
})
export class PerfilPage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  protected readonly store = inject(PerfilStore);
  protected readonly cerrando = signal(false);

  protected async cerrarSesion(): Promise<void> {
    this.cerrando.set(true);
    try {
      await this.auth.logout();
      await this.router.navigateByUrl('/inicio');
    } catch {
      this.toasts.error('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    } finally {
      this.cerrando.set(false);
    }
  }
}
