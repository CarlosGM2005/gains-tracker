export interface Perfil {
  uid: string;
  nombre: string;
  email: string;
  /** 9 dígitos. `null` si no está informado (usuarios de Google). */
  telefono: string | null;
  edad: number | null;
  /** Kilogramos. */
  peso: number | null;
  /** Metros. */
  altura: number | null;
  creadoEn: Date;
}

/** El email no está aquí: se cambia en Auth con verificación y después se sincroniza. */
export type DatosPerfilEditables = Pick<Perfil, 'nombre' | 'telefono' | 'edad' | 'peso' | 'altura'>;

export type CambiosPerfil = Partial<DatosPerfilEditables>;

export function inicialDelNombre(nombre: string | null | undefined): string {
  const limpio = nombre?.trim();
  return limpio ? limpio.charAt(0).toUpperCase() : '?';
}
