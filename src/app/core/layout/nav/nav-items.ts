export interface NavItem {
  etiqueta: string;
  ruta: string;
  icono: string;
  enEscritorio: boolean;
  enMovil: boolean;
}

/**
 * La barra móvil mantiene las 4 entradas de la app antigua. Buscar, Favoritos y Estadísticas (fase 8)
 * solo están en la barra lateral; en móvil se llega desde el inicio, el perfil y Mis registros.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { etiqueta: 'Inicio', ruta: '/inicio', icono: 'icons/logoHome.png', enEscritorio: true, enMovil: true },
  { etiqueta: 'Ejercicios', ruta: '/ejercicios', icono: 'icons/logoEntrenamientos.png', enEscritorio: true, enMovil: true },
  { etiqueta: 'Buscar', ruta: '/buscar', icono: 'icons/logoBuscar.png', enEscritorio: true, enMovil: false },
  { etiqueta: 'Recomendaciones', ruta: '/recomendados', icono: 'icons/logoRecomendados.png', enEscritorio: true, enMovil: false },
  { etiqueta: 'Favoritos', ruta: '/favoritos', icono: 'icons/logoFavoritos.png', enEscritorio: true, enMovil: false },
  { etiqueta: 'Datos Perfil', ruta: '/perfil', icono: 'icons/logoPerfil.png', enEscritorio: true, enMovil: false },
  { etiqueta: 'Registros', ruta: '/registros', icono: 'icons/logoRegistros.png', enEscritorio: true, enMovil: true },
  { etiqueta: 'Estadísticas', ruta: '/estadisticas', icono: 'icons/logoEstadisticas.png', enEscritorio: true, enMovil: false },
  { etiqueta: 'Perfil', ruta: '/perfil', icono: 'icons/logoPerfil.png', enEscritorio: false, enMovil: true },
];
