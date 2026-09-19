import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ETIQUETA_MUSCULO, type Musculo, MUSCULOS_FILTRO } from '@features/ejercicios/public-api';

import { type DiaRutina, NOMBRE_DIA_SEMANA } from '../domain/rutina';

/**
 * Tarjeta de un día de la rutina para el carrusel del inicio: número de día grande de fondo,
 * enfoque de la sesión y los grupos musculares, cada uno enlazado a sus recomendados.
 */
@Component({
  selector: 'app-rutina-dia',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = dia();
    <article class="dia" [class.dia--hoy]="hoy()">
      <span class="dia__marca" aria-hidden="true">{{ numero() }}</span>

      <header class="dia__cabecera">
        <p class="text-label dia__etiqueta">
          Día {{ d.dia }} · {{ nombreDia[d.diaSemana] }}
          @if (hoy()) {
            <span class="dia__hoy">Hoy</span>
          }
        </p>
        <h3 class="dia__enfoque">{{ d.enfoque }}</h3>
        <p class="dia__resumen">{{ resumen() }}</p>
      </header>

      <ol class="dia__musculos">
        @for (m of d.musculos; track m.musculo; let i = $index) {
          <li class="dia__fila" [style.--i]="i">
            @if (enlazable(m.musculo)) {
              <a class="musculo" routerLink="/recomendados" [queryParams]="{ musculo: m.musculo }">
                <span class="musculo__n" aria-hidden="true">0{{ i + 1 }}</span>
                <span class="musculo__nombre">{{ etiquetas[m.musculo] }}</span>
                @if (m.opcional) {
                  <span class="musculo__opcional">Opcional</span>
                }
                <span class="musculo__flecha" aria-hidden="true">→</span>
              </a>
            } @else {
              <span class="musculo musculo--sin-enlace">
                <span class="musculo__n" aria-hidden="true">0{{ i + 1 }}</span>
                <span class="musculo__nombre">{{ etiquetas[m.musculo] }}</span>
                @if (m.opcional) {
                  <span class="musculo__opcional">Opcional</span>
                }
              </span>
            }
          </li>
        }
      </ol>
    </article>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }

    .dia {
      position: relative;
      display: grid;
      align-content: space-between;
      gap: var(--space-6);
      height: 100%;
      padding: var(--space-6);
      overflow: hidden;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      background:
        radial-gradient(circle at 100% 0%, var(--color-accent-soft), transparent 60%),
        var(--color-surface);
    }

    .dia--hoy {
      border-color: var(--color-accent);
    }

    /* Número de día enorme de fondo: da carácter sin competir con el contenido. */
    .dia__marca {
      position: absolute;
      right: -0.04em;
      bottom: -0.18em;
      font-family: var(--font-display);
      font-size: clamp(9rem, 6rem + 12vw, 16rem);
      font-weight: var(--font-weight-bold);
      line-height: 1;
      color: rgb(from var(--color-text) r g b / 5%);
      pointer-events: none;
      user-select: none;
    }

    .dia__cabecera,
    .dia__musculos {
      position: relative;
    }

    .dia__cabecera {
      display: grid;
      gap: var(--space-2);
    }

    .dia__etiqueta {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      color: var(--color-accent);
    }

    .dia__hoy {
      padding: 2px var(--space-2);
      border-radius: var(--radius-pill);
      background: var(--color-accent);
      color: var(--color-on-accent);
    }

    .dia__enfoque {
      font-size: var(--font-size-2xl);
    }

    .dia__resumen {
      color: var(--color-text-muted);
    }

    .dia__musculos {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .musculo {
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      align-items: center;
      gap: var(--space-3);
      min-height: var(--tap-target);
      padding: var(--space-3) var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: rgb(from var(--color-bg) r g b / 55%);
      text-decoration: none;
      transition:
        border-color var(--duration-base) var(--easing-standard),
        transform var(--duration-fast) var(--easing-standard);
    }

    a.musculo:active {
      transform: scale(0.98);
    }

    .musculo__n {
      font-family: var(--font-display);
      font-weight: var(--font-weight-bold);
      color: var(--color-accent);
    }

    .musculo__nombre {
      font-family: var(--font-display);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      text-transform: uppercase;
    }

    .musculo__opcional {
      padding: 2px var(--space-2);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      font-size: var(--font-size-xs);
      letter-spacing: var(--letter-spacing-label);
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .musculo__flecha {
      color: var(--color-accent);
      transition: transform var(--duration-base) var(--easing-out);
    }

    @media (hover: hover) {
      a.musculo:hover {
        border-color: var(--color-accent);
      }

      a.musculo:hover .musculo__flecha {
        transform: translateX(4px);
      }
    }

    @media (width >= 768px) {
      .dia {
        grid-template-columns: 1fr 1.3fr;
        align-items: center;
        gap: var(--space-10);
        padding: var(--space-10);
      }

      /* En escritorio el número va a la izquierda, detrás de la cabecera. */
      .dia__marca {
        right: auto;
        left: var(--space-6);
      }
    }
  `,
})
export class RutinaDia {
  readonly dia = input.required<DiaRutina>();
  readonly hoy = input(false);

  protected readonly etiquetas = ETIQUETA_MUSCULO;
  protected readonly nombreDia = NOMBRE_DIA_SEMANA;
  protected readonly numero = computed(() => String(this.dia().dia).padStart(2, '0'));
  protected readonly resumen = computed(() => {
    const musculos = this.dia().musculos;
    const opcionales = musculos.filter((m) => m.opcional).length;
    return `${musculos.length} grupos musculares` + (opcionales ? ` · ${opcionales} opcional${opcionales > 1 ? 'es' : ''}` : '');
  });

  /** Lumbares no tiene filtro en recomendados, así que no se enlaza. */
  protected enlazable(musculo: Musculo): boolean {
    return MUSCULOS_FILTRO.includes(musculo);
  }
}
