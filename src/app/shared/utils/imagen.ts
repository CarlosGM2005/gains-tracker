export type MotivoImagenNoValida = 'tipo' | 'archivo-grande' | 'lectura' | 'resultado-grande';

export class ImagenNoValidaError extends Error {
  constructor(readonly motivo: MotivoImagenNoValida) {
    super(`Imagen no válida: ${motivo}`);
    this.name = 'ImagenNoValidaError';
  }
}

export interface OpcionesFoto {
  /** Lado del cuadrado final en píxeles. */
  lado: number;
  /** Tamaño máximo del data URL resultante (caracteres). */
  maxCaracteres: number;
  /** Tamaño máximo del archivo original (bytes) antes de intentar leerlo. */
  maxBytesArchivo: number;
}

export interface Recorte {
  x: number;
  y: number;
  lado: number;
}

/** Cuadrado centrado más grande que cabe en la imagen. */
export function recorteCuadrado(ancho: number, alto: number): Recorte {
  const lado = Math.min(ancho, alto);
  return { x: Math.floor((ancho - lado) / 2), y: Math.floor((alto - lado) / 2), lado };
}

const CALIDADES = [0.85, 0.72, 0.6, 0.45, 0.3] as const;

/**
 * Recorta la imagen en cuadrado, la reduce a `lado` px y la devuelve como data URL WebP (JPEG si el
 * navegador no sabe codificar WebP). Baja la calidad hasta que cabe en `maxCaracteres`.
 * Pensado para guardar una foto de perfil pequeña dentro de un documento de Firestore.
 */
export async function comprimirFoto(archivo: Blob, opciones: OpcionesFoto): Promise<string> {
  if (!archivo.type.startsWith('image/')) {
    throw new ImagenNoValidaError('tipo');
  }
  if (archivo.size > opciones.maxBytesArchivo) {
    throw new ImagenNoValidaError('archivo-grande');
  }

  let bitmap: ImageBitmap;
  try {
    // Por defecto los navegadores aplican la orientación EXIF de las fotos del móvil.
    bitmap = await createImageBitmap(archivo);
  } catch {
    throw new ImagenNoValidaError('lectura');
  }

  try {
    const recorte = recorteCuadrado(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = Math.min(opciones.lado, recorte.lado);
    const contexto = canvas.getContext('2d');
    if (!contexto) {
      throw new ImagenNoValidaError('lectura');
    }
    contexto.imageSmoothingQuality = 'high';
    contexto.drawImage(bitmap, recorte.x, recorte.y, recorte.lado, recorte.lado, 0, 0, canvas.width, canvas.height);

    const tipo = canvas.toDataURL('image/webp').startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg';
    for (const calidad of CALIDADES) {
      const url = canvas.toDataURL(tipo, calidad);
      if (url.length <= opciones.maxCaracteres) {
        return url;
      }
    }
    throw new ImagenNoValidaError('resultado-grande');
  } finally {
    bitmap.close();
  }
}
