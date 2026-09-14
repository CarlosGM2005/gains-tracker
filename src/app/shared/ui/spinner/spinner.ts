import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner" role="status">
      <span class="spinner__ring" aria-hidden="true"></span>
      <span class="visually-hidden">{{ etiqueta() }}</span>
    </div>
  `,
  styles: `
    .spinner {
      display: grid;
      place-items: center;
      padding: var(--space-10);
    }

    .spinner__ring {
      width: 2.5rem;
      height: 2.5rem;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 800ms linear infinite;
    }
  `,
})
export class Spinner {
  readonly etiqueta = input('Cargando');
}
