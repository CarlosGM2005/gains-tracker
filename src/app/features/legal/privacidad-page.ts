import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PageHeader } from '@shared/ui/page-header/page-header';
import { Reveal } from '@shared/ui/reveal/reveal';

interface SeccionLegal {
  titulo: string;
  parrafo?: string;
  lista?: readonly string[];
}

/** Texto de la política de la app actual (24-05-2025), sin cambios de contenido. */
const SECCIONES: readonly SeccionLegal[] = [
  {
    titulo: 'Información general',
    parrafo:
      'Gains Tracker es una aplicación desarrollada como Trabajo de Fin de Grado (TFG), cuyo propósito es facilitar a los usuarios el registro y seguimiento de su progreso en ejercicios de gimnasio. La aplicación está desplegada en Netlify y hace uso de Firebase para la autenticación de usuarios, almacenamiento de datos y otros servicios backend.',
  },
  {
    titulo: 'Datos personales recopilados',
    parrafo: 'Durante el uso de la app se recopilan los siguientes datos:',
    lista: [
      'Nombre completo',
      'Correo electrónico',
      'Número de teléfono',
      'Edad',
      'Peso',
      'Altura',
      'Foto de perfil',
      'Registros de ejercicios: día, series, repeticiones, peso y descanso',
    ],
  },
  {
    titulo: 'Autenticación de usuarios',
    parrafo: 'Se permite iniciar sesión mediante:',
    lista: ['Correo electrónico y contraseña', 'Cuenta de Google (Firebase Auth)'],
  },
  {
    titulo: 'Uso de los datos',
    parrafo: 'La información se usa para:',
    lista: [
      'Personalizar el perfil del usuario',
      'Mostrar progreso del entrenamiento',
      'Recomendar ejercicios por nivel y categoría',
    ],
  },
  {
    titulo: 'Propiedad de imágenes',
    parrafo:
      'Las imágenes mostradas en los ejercicios son propiedad exclusiva del desarrollador. Está prohibida su reproducción o uso sin permiso.',
  },
  {
    titulo: 'Seguridad y almacenamiento',
    parrafo:
      'Los datos se almacenan en Firebase Firestore y las imágenes en Firebase Storage. Cada usuario solo puede acceder a su propia información mediante reglas de seguridad de Firebase.',
  },
  {
    titulo: 'Derechos del usuario',
    parrafo: 'El usuario puede:',
    lista: [
      'Consultar y editar sus datos',
      'Eliminar su cuenta y datos',
      'Contactar con el desarrollador para más información',
    ],
  },
  {
    titulo: 'Cambios en la política',
    parrafo: 'Esta política puede cambiar. Las modificaciones se notificarán en la aplicación.',
  },
  {
    titulo: 'Contacto',
    parrafo:
      'Para cualquier consulta, contacta con el desarrollador a través del correo que figura en tu perfil.',
  },
];

@Component({
  selector: 'app-privacidad-page',
  imports: [PageHeader, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="page legal">
      <app-page-header titulo="Política de privacidad" antetitulo="Última actualización · 24 de mayo de 2025" />

      <ol class="legal__list">
        @for (seccion of secciones; track seccion.titulo; let i = $index) {
          <li class="legal__item" appReveal>
            <span class="legal__num" aria-hidden="true">{{ (i + 1).toString().padStart(2, '0') }}</span>
            <div class="legal__body">
              <h2 class="legal__title">{{ seccion.titulo }}</h2>
              @if (seccion.parrafo) {
                <p>{{ seccion.parrafo }}</p>
              }
              @if (seccion.lista) {
                <ul>
                  @for (punto of seccion.lista; track punto) {
                    <li>{{ punto }}</li>
                  }
                </ul>
              }
            </div>
          </li>
        }
      </ol>

      <p class="legal__thanks">Gracias por confiar en <strong class="text-accent">Gains Tracker</strong>.</p>
    </article>
  `,
  styles: `
    .legal {
      max-width: 52rem;
    }

    .legal__list {
      display: grid;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .legal__item {
      display: grid;
      grid-template-columns: 3.5rem 1fr;
      gap: var(--space-4);
      padding-block: var(--space-6);
      border-top: 1px solid var(--color-border);
    }

    .legal__num {
      font-family: var(--font-display);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      line-height: 1;
      color: var(--color-accent);
    }

    .legal__body {
      display: grid;
      gap: var(--space-3);
      color: var(--color-text-muted);
    }

    .legal__title {
      font-size: var(--font-size-lg);
      color: var(--color-text);
    }

    .legal__body ul {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding-left: var(--space-5);
    }

    .legal__body li::marker {
      color: var(--color-accent);
    }

    .legal__thanks {
      padding-top: var(--space-8);
      border-top: 1px solid var(--color-border);
      font-size: var(--font-size-lg);
    }

    @media (width >= 768px) {
      .legal__item {
        grid-template-columns: 5rem 1fr;
        gap: var(--space-8);
      }
    }
  `,
})
export class PrivacidadPage {
  protected readonly secciones = SECCIONES;
}
