import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router';

export const NOMBRE_APP = 'GainsTracker';

/** Título de pestaña: "Ejercicios · GainsTracker", o solo "GainsTracker" si la ruta no declara `title`. */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const titulo = this.buildTitle(snapshot);
    this.title.setTitle(titulo ? `${titulo} · ${NOMBRE_APP}` : NOMBRE_APP);
  }
}
