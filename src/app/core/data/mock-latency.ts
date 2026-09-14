import { InjectionToken } from '@angular/core';

/** Retardo artificial (ms) de los repositorios mock. En tests vale 0. */
export const MOCK_LATENCY_MS = new InjectionToken<number>('MOCK_LATENCY_MS', {
  providedIn: 'root',
  factory: () => 0,
});

export function esperar(ms: number): Promise<void> {
  return ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();
}
