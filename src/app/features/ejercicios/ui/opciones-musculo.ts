import { type ChipOption } from '@shared/ui/chip-group/chip-group';

import { ETIQUETA_MUSCULO, type Musculo, MUSCULOS_FILTRO } from '../domain/ejercicio.model';

/** Chips de músculo del catálogo y de recomendados (sin `lumbares`, como la app actual). */
export const OPCIONES_MUSCULO: readonly ChipOption<Musculo>[] = MUSCULOS_FILTRO.map((m) => ({
  valor: m,
  etiqueta: ETIQUETA_MUSCULO[m],
}));
