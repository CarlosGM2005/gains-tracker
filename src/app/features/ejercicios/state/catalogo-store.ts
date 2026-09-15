import { inject, Injectable } from '@angular/core';

import { EjerciciosRepository } from '../data/ejercicios-repository';
import { type Ejercicio, type Musculo, type Nivel } from '../domain/ejercicio.model';

/**
 * Caché en memoria del catálogo. Los ejercicios casi no cambian, así que cada consulta se hace
 * una vez por sesión. Si una consulta falla, se olvida para poder reintentar.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoStore {
  private readonly repo = inject(EjerciciosRepository);
  private readonly cache = new Map<string, Promise<unknown>>();

  /** Una sola lectura de la colección por sesión; también sirve para resolver ids sin consultas. */
  todos(): Promise<Ejercicio[]> {
    return this.cachear('todos', () => this.repo.todos());
  }

  porNivelYMusculo(nivel: Nivel, musculo: Musculo): Promise<Ejercicio[]> {
    return this.cachear(`nivel:${nivel}|${musculo}`, () => this.repo.porNivelYMusculo(nivel, musculo));
  }

  recomendados(): Promise<Ejercicio[]> {
    return this.cachear('recomendados', () => this.repo.recomendados());
  }

  /** Reutiliza la lista de recomendados si ya está cargada (la usa también el inicio). */
  async recomendadosPorMusculo(musculo: Musculo): Promise<Ejercicio[]> {
    if (this.cache.has('recomendados')) {
      return (await this.recomendados()).filter((e) => e.musculo === musculo);
    }
    return this.cachear(`recomendados|${musculo}`, () => this.repo.recomendadosPorMusculo(musculo));
  }

  async porId(id: string): Promise<Ejercicio | null> {
    const enCache = await this.buscarEnCache(id);
    return enCache ?? this.cachear(`id:${id}`, () => this.repo.porId(id));
  }

  /** Copias para que ninguna pantalla altere la caché. */
  private async cachear<T extends Ejercicio[] | Ejercicio | null>(clave: string, cargar: () => Promise<T>): Promise<T> {
    let pendiente = this.cache.get(clave) as Promise<T> | undefined;
    if (!pendiente) {
      pendiente = cargar();
      this.cache.set(clave, pendiente);
      pendiente.catch(() => this.cache.delete(clave));
    }
    const valor = await pendiente;
    return (Array.isArray(valor) ? valor.map((e) => ({ ...e })) : valor ? { ...valor } : valor) as T;
  }

  private async buscarEnCache(id: string): Promise<Ejercicio | null> {
    for (const [clave, pendiente] of this.cache) {
      if (clave.startsWith('id:')) {
        continue;
      }
      try {
        const lista = (await pendiente) as Ejercicio[];
        const encontrado = lista.find((e) => e.id === id);
        if (encontrado) {
          return { ...encontrado };
        }
      } catch {
        // Una consulta fallida de la caché no impide buscar en el repositorio.
      }
    }
    return null;
  }
}
