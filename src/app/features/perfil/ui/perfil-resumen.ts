import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AvatarInitial } from '@shared/ui/avatar-initial/avatar-initial';
import { StatBox } from '@shared/ui/stat-box/stat-box';

import { type Perfil } from '../domain/perfil.model';

/** Cabecera del perfil: avatar con inicial, nombre, email y peso/edad/altura. */
@Component({
  selector: 'app-perfil-resumen',
  imports: [AvatarInitial, StatBox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="resumen">
      <div class="resumen__glow" aria-hidden="true"></div>
      <app-avatar-initial class="stagger" [nombre]="perfil()?.nombre" />
      <div class="resumen__id stagger" style="--i: 1">
        <h1 class="resumen__nombre">{{ perfil()?.nombre || '-' }}</h1>
        <p class="resumen__email">{{ perfil()?.email || '-' }}</p>
      </div>
      <div class="resumen__stats stagger" style="--i: 2">
        <app-stat-box etiqueta="Peso" unidad="Kg" [valor]="perfil()?.peso" />
        <app-stat-box etiqueta="Edad" unidad="Años" [valor]="perfil()?.edad" />
        <app-stat-box etiqueta="Altura" unidad="m" [valor]="perfil()?.altura" />
      </div>
    </section>
  `,
  styles: `
    :host {
      display: block;
    }

    .resumen {
      position: relative;
      display: grid;
      justify-items: center;
      gap: var(--space-5);
      padding: var(--space-8) var(--space-4) var(--space-6);
      overflow: hidden;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background: var(--color-surface);
      text-align: center;
      isolation: isolate;
    }

    .resumen__glow {
      position: absolute;
      top: -60%;
      left: 50%;
      z-index: -1;
      width: 520px;
      aspect-ratio: 1;
      border-radius: 50%;
      background: radial-gradient(closest-side, var(--color-accent-glow), transparent 70%);
      opacity: 0.35;
      transform: translateX(-50%);
    }

    .resumen__id {
      display: grid;
      gap: var(--space-1);
      min-width: 0;
    }

    .resumen__nombre {
      font-size: var(--font-size-xl);
      overflow-wrap: anywhere;
    }

    .resumen__email {
      color: var(--color-text-muted);
      overflow-wrap: anywhere;
    }

    .resumen__stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-2);
      width: 100%;
      max-width: 28rem;
    }
  `,
})
export class PerfilResumen {
  readonly perfil = input.required<Perfil | null>();
}
