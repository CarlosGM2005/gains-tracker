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
  /** Foto recortada y comprimida como data URL (WebP o JPEG). `null` si no hay foto. */
  foto: string | null;
  creadoEn: Date;
}

/** El email no está aquí: se cambia en Auth con verificación y después se sincroniza. */
export type DatosPerfilEditables = Pick<Perfil, 'nombre' | 'telefono' | 'edad' | 'peso' | 'altura'>;

/** La foto se guarda aparte del formulario, en cuanto se elige. */
export type CambiosPerfil = Partial<DatosPerfilEditables & Pick<Perfil, 'foto'>>;

export function inicialDelNombre(nombre: string | null | undefined): string {
  const limpio = nombre?.trim();
  return limpio ? limpio.charAt(0).toUpperCase() : '?';
}
