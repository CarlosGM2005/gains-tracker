import { type IconName } from '@shared/ui/icon/icon';

export interface NavItem {
  etiqueta: string;
  ruta: string;
  icono: IconName;
  enEscritorio: boolean;
  enMovil: boolean;
}

/**
 * La barra móvil mantiene las 4 entradas de la app antigua. Buscar, Favoritos y Estadísticas (fase 8)
 * solo están en la barra lateral; en móvil se llega desde el inicio, el perfil y Mis registros.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { etiqueta: 'Inicio', ruta: '/inicio', icono: 'home', enEscritorio: true, enMovil: true },
  { etiqueta: 'Ejercicios', ruta: '/ejercicios', icono: 'ejercicios', enEscritorio: true, enMovil: true },
  { etiqueta: 'Buscar', ruta: '/buscar', icono: 'buscar', enEscritorio: true, enMovil: false },
  {
    etiqueta: 'Recomendaciones',
    ruta: '/recomendados',
    icono: 'recomendados',
    enEscritorio: true,
    enMovil: false,
  },
  { etiqueta: 'Favoritos', ruta: '/favoritos', icono: 'favoritos', enEscritorio: true, enMovil: false },
  { etiqueta: 'Datos Perfil', ruta: '/perfil', icono: 'perfil', enEscritorio: true, enMovil: false },
  { etiqueta: 'Registros', ruta: '/registros', icono: 'registros', enEscritorio: true, enMovil: true },
  {
    etiqueta: 'Estadísticas',
    ruta: '/estadisticas',
    icono: 'estadisticas',
    enEscritorio: true,
    enMovil: false,
  },
  { etiqueta: 'Perfil', ruta: '/perfil', icono: 'perfil', enEscritorio: false, enMovil: true },
];
