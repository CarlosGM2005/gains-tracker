import { fecha, positivoONull, texto, textoONull } from '@core/firebase/conversiones';

import { type CambiosPerfil, type Perfil } from '../../domain/perfil.model';

/** Documento `usuarios/{uid}` (mismos campos que la app antigua). */
export interface PerfilDto {
  uid?: unknown;
  nombre?: unknown;
  email?: unknown;
  telefono?: unknown;
  edad?: unknown;
  peso?: unknown;
  altura?: unknown;
  createdAt?: unknown;
}

/** La app antigua guardaba `''` y `0` en los perfiles de Google: se leen como `null`. */
export function perfilDesdeFirestore(uid: string, dto: PerfilDto): Perfil {
  return {
    uid,
    nombre: texto(dto.nombre),
    email: texto(dto.email),
    telefono: textoONull(dto.telefono),
    edad: positivoONull(dto.edad),
    peso: positivoONull(dto.peso),
    altura: positivoONull(dto.altura),
    creadoEn: fecha(dto.createdAt) ?? new Date(0),
  };
}

export function perfilAFirestore(perfil: Perfil): PerfilDto {
  return {
    uid: perfil.uid,
    nombre: perfil.nombre,
    email: perfil.email,
    telefono: perfil.telefono,
    edad: perfil.edad,
    peso: perfil.peso,
    altura: perfil.altura,
    createdAt: perfil.creadoEn,
  };
}

/** Solo los campos presentes; los nombres coinciden con el documento. */
export function cambiosAFirestore(cambios: CambiosPerfil): Partial<PerfilDto> {
  const dto: Partial<PerfilDto> = {};
  for (const [campo, valor] of Object.entries(cambios)) {
    if (valor !== undefined) {
      dto[campo as keyof CambiosPerfil] = valor;
    }
  }
  return dto;
}
