export interface NavItem {
  etiqueta: string;
  ruta: string;
  icono: string;
  enEscritorio: boolean;
  enMovil: boolean;
}

/** Mismas entradas que la app actual: la barra móvil no incluye Recomendaciones. */
export const NAV_ITEMS: readonly NavItem[] = [
  { etiqueta: 'Inicio', ruta: '/inicio', icono: 'icons/logoHome.png', enEscritorio: true, enMovil: true },
  { etiqueta: 'Ejercicios', ruta: '/ejercicios', icono: 'icons/logoEntrenamientos.png', enEscritorio: true, enMovil: true },
  { etiqueta: 'Recomendaciones', ruta: '/recomendados', icono: 'icons/logoRecomendados.png', enEscritorio: true, enMovil: false },
  { etiqueta: 'Datos Perfil', ruta: '/perfil', icono: 'icons/logoPerfil.png', enEscritorio: true, enMovil: false },
  { etiqueta: 'Registros', ruta: '/registros', icono: 'icons/logoRegistros.png', enEscritorio: true, enMovil: true },
  { etiqueta: 'Perfil', ruta: '/perfil', icono: 'icons/logoPerfil.png', enEscritorio: false, enMovil: true },
];
