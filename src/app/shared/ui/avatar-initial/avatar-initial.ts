import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Avatar circular con la inicial del nombre, o "?" si no hay nombre. */
@Component({
  selector: 'app-avatar-initial',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="avatar" aria-hidden="true">{{ inicial() }}</span>`,
  styles: `
    :host {
      display: block;
    }

    .avatar {
      display: grid;
      place-items: center;
      width: var(--avatar-size, 5rem);
      aspect-ratio: 1;
      border: 3px solid var(--color-accent);
      border-radius: 50%;
      background: var(--color-surface);
      box-shadow: 0 0 0 6px var(--color-accent-soft);
      font-family: var(--font-display);
      font-size: calc(var(--avatar-size, 5rem) * 0.45);
      font-weight: var(--font-weight-bold);
      color: var(--color-accent);
    }
  `,
})
export class AvatarInitial {
  readonly nombre = input<string | null>();

  protected readonly inicial = computed(() => {
    const limpio = this.nombre()?.trim();
    return limpio ? limpio.charAt(0).toUpperCase() : '?';
  });
}
