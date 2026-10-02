import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';

import { GuiaInstalacionIOS } from './guia-ios-dialog';
import { enModoApp, type Plataforma, plataformaActual } from './plataforma';

/** Evento de Chromium que permite abrir el diálogo de instalación cuando queramos. */
interface EventoInstalacion extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Qué hay que enseñarle al usuario para que instale la app:
 * - `automatico`: hay diálogo nativo (Chrome, Edge, Android). Un botón y listo.
 * - `guia-ios`: Safari de iOS. No hay diálogo: se explica "Compartir → Añadir a pantalla de inicio".
 * - `abrir-en-safari`: iOS fuera de Safari. Desde ahí no se puede instalar.
 * - `ninguno`: ya está instalada, o el navegador no lo soporta.
 */
export type ModoInstalacion = 'automatico' | 'guia-ios' | 'abrir-en-safari' | 'ninguno';

const CLAVE_DESCARTE = 'gt:instalacion-descartada';
/** Tras descartar el aviso no se vuelve a proponer en dos semanas. */
const DIAS_SILENCIO = 14;
/** El aviso no aparece nada más entrar: primero que el usuario vea la app. */
const RETARDO_AVISO_MS = 6000;

/**
 * Estado de la instalación de la app. Captura `beforeinstallprompt` en cuanto arranca la app
 * (si se deja pasar, el evento se pierde y ya no se puede abrir el diálogo nativo).
 */
@Injectable({ providedIn: 'root' })
export class InstalacionService {
  private readonly guia = inject(GuiaInstalacionIOS);
  private readonly evento = signal<EventoInstalacion | null>(null);
  private readonly instaladaAhora = signal(enModoApp());
  private readonly silenciadaHasta = signal(leerSilencio());
  private readonly tiempoCumplido = signal(false);

  readonly plataforma: Plataforma = plataformaActual();
  /** La app se está ejecutando instalada, no en una pestaña del navegador. */
  readonly enModoApp = this.instaladaAhora.asReadonly();

  readonly modo = computed<ModoInstalacion>(() => {
    if (this.instaladaAhora()) return 'ninguno';
    if (this.evento()) return 'automatico';
    if (this.plataforma === 'ios-safari') return 'guia-ios';
    if (this.plataforma === 'ios-otro-navegador') return 'abrir-en-safari';
    return 'ninguno';
  });

  /** Se puede ofrecer la instalación desde un botón fijo (perfil, menú…). */
  readonly disponible = computed(() => this.modo() !== 'ninguno');

  /** Toca enseñar el aviso automático: hay forma de instalar, ha pasado el retardo y no se descartó. */
  readonly avisoVisible = computed(
    () => this.disponible() && this.tiempoCumplido() && Date.now() > this.silenciadaHasta(),
  );

  constructor() {
    if (typeof window === 'undefined') return;

    const alPoderInstalar = (e: Event) => {
      // Sin `preventDefault` Chrome muestra su propia barra y perdemos el control del momento.
      e.preventDefault();
      this.evento.set(e as EventoInstalacion);
    };
    const alInstalar = () => {
      this.evento.set(null);
      this.instaladaAhora.set(true);
    };

    window.addEventListener('beforeinstallprompt', alPoderInstalar);
    window.addEventListener('appinstalled', alInstalar);

    const temporizador = setTimeout(() => this.tiempoCumplido.set(true), RETARDO_AVISO_MS);

    inject(DestroyRef).onDestroy(() => {
      window.removeEventListener('beforeinstallprompt', alPoderInstalar);
      window.removeEventListener('appinstalled', alInstalar);
      clearTimeout(temporizador);
    });
  }

  /**
   * Único punto de entrada de la instalación desde la interfaz: según la plataforma abre el
   * diálogo nativo o la ventana que explica el gesto de iOS.
   */
  async pedirInstalacion(): Promise<void> {
    switch (this.modo()) {
      case 'automatico':
        await this.instalar();
        break;
      case 'guia-ios':
        this.guia.abrirGuia();
        break;
      case 'abrir-en-safari':
        this.guia.abrirAvisoSafari();
        break;
      case 'ninguno':
        break;
    }
  }

  /**
   * Abre el diálogo nativo de instalación. Solo tiene efecto con `modo() === 'automatico'`.
   * Devuelve `true` si el usuario aceptó.
   */
  private async instalar(): Promise<boolean> {
    const evento = this.evento();
    if (!evento) return false;
    // El evento solo sirve una vez: se suelta antes de esperar la respuesta.
    this.evento.set(null);
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    return outcome === 'accepted';
  }

  /** Oculta el aviso automático durante dos semanas. El botón fijo sigue disponible. */
  descartar(): void {
    const hasta = Date.now() + DIAS_SILENCIO * 24 * 60 * 60 * 1000;
    this.silenciadaHasta.set(hasta);
    try {
      localStorage.setItem(CLAVE_DESCARTE, String(hasta));
    } catch {
      // Safari en navegación privada no deja escribir: el descarte dura solo esta sesión.
    }
  }
}

function leerSilencio(): number {
  try {
    return Number(localStorage.getItem(CLAVE_DESCARTE)) || 0;
  } catch {
    return 0;
  }
}
