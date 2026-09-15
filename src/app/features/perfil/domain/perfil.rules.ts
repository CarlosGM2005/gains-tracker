import { type ValidatorFn, Validators } from '@angular/forms';

/** Reglas de validación compartidas por el registro y la edición del perfil. */
export const REGLAS_PERFIL = {
  nombre: { maxLength: 80 },
  edad: { min: 14, max: 99 },
  peso: { min: 30, max: 300 },
  altura: { min: 1, max: 2.5 },
  telefono: /^\d{9}$/,
} as const;

/**
 * Foto de perfil guardada dentro de `usuarios/{uid}` (fase 8): sin Firebase Storage. Un cuadrado de
 * 256 px en WebP ocupa ~20–40 kB; el límite deja margen y está muy lejos de 1 MiB por documento.
 * `firestore.rules` comprueba el mismo tamaño y el mismo prefijo.
 */
export const REGLAS_FOTO = {
  lado: 256,
  maxCaracteres: 150_000,
  maxBytesArchivo: 15 * 1024 * 1024,
  prefijo: /^data:image\/(webp|jpeg);base64,/,
} as const;

export function esFotoValida(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.length <= REGLAS_FOTO.maxCaracteres && REGLAS_FOTO.prefijo.test(valor);
}

/** Regla de contraseña (decisión P4): mínimo 8 caracteres de cualquier tipo. */
export const REGLAS_PASSWORD = {
  minLength: 8,
} as const;

type CampoFisico = 'telefono' | 'edad' | 'peso' | 'altura';

/**
 * Validadores de los datos del perfil. En el registro todo es obligatorio; al editar, los datos
 * físicos pueden quedar vacíos (usuarios de Google), pero si se rellenan deben ser válidos.
 */
export function validadoresPerfil(obligatorios: boolean): Readonly<Record<'nombre' | CampoFisico, ValidatorFn[]>> {
  const requerido = obligatorios ? [Validators.required] : [];
  return {
    nombre: [Validators.required, Validators.maxLength(REGLAS_PERFIL.nombre.maxLength)],
    telefono: [...requerido, Validators.pattern(REGLAS_PERFIL.telefono)],
    edad: [...requerido, Validators.min(REGLAS_PERFIL.edad.min), Validators.max(REGLAS_PERFIL.edad.max)],
    peso: [...requerido, Validators.min(REGLAS_PERFIL.peso.min), Validators.max(REGLAS_PERFIL.peso.max)],
    altura: [...requerido, Validators.min(REGLAS_PERFIL.altura.min), Validators.max(REGLAS_PERFIL.altura.max)],
  };
}

export const VALIDADORES_PASSWORD: ValidatorFn[] = [Validators.required, Validators.minLength(REGLAS_PASSWORD.minLength)];

export const VALIDADORES_EMAIL: ValidatorFn[] = [Validators.required, Validators.email];

/** Mensajes de la app actual, con la edad mínima corregida a 14 y sin restricción de caracteres en la contraseña. */
export const MENSAJES_PERFIL = {
  nombre: {
    required: 'El nombre es obligatorio.',
    maxlength: `El nombre admite como máximo ${REGLAS_PERFIL.nombre.maxLength} caracteres.`,
  },
  email: {
    required: 'El correo electrónico es obligatorio.',
    email: 'Introduce un formato de correo electrónico válido.',
  },
  password: {
    required: 'La contraseña es obligatoria.',
    minlength: `La contraseña debe tener al menos ${REGLAS_PASSWORD.minLength} caracteres.`,
  },
  telefono: {
    required: 'El número de teléfono es obligatorio.',
    pattern: 'El teléfono debe tener 9 dígitos numéricos (Ej. 600123456).',
  },
  edad: {
    required: 'La edad es obligatoria.',
    min: `Debes tener al menos ${REGLAS_PERFIL.edad.min} años.`,
    max: `La edad máxima permitida es ${REGLAS_PERFIL.edad.max} años.`,
  },
  peso: {
    required: 'El peso es obligatorio.',
    min: `El peso mínimo es ${REGLAS_PERFIL.peso.min} kg.`,
    max: `El peso máximo es ${REGLAS_PERFIL.peso.max} kg.`,
  },
  altura: {
    required: 'La altura es obligatoria.',
    min: 'La altura mínima es 1.00 metro.',
    max: 'La altura máxima es 2.50 metros.',
  },
} as const;
