/**
 * Genera los iconos de la PWA y las pantallas de arranque de iOS a partir del logo de la marca.
 *
 * No usa dependencias: rasteriza las figuras de `public/logo.svg` (insignia redondeada con
 * degradado + mancuerna girada) con un trazador propio y escribe los PNG con `zlib`.
 * Así los iconos se pueden regenerar cuando cambie el logo, sin instalar nada.
 *
 * Uso: npm run iconos
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR_ICONOS = join(RAIZ, 'public', 'icons', 'app');
const DIR_SPLASH = join(RAIZ, 'public', 'icons', 'splash');

// Colores de `src/styles/_tokens.scss` y `public/logo.svg`.
const DEGRADADO_INICIO = [0xff, 0x9d, 0x4d];
const DEGRADADO_FIN = [0xe8, 0x62, 0x0a];
const TINTA = [0x0e, 0x0e, 0x10];

/** Lado del lienzo del logo original (viewBox="0 0 64 64"). */
const LADO = 64;
/** Radio de la insignia en unidades del logo. */
const RADIO = 16;
/** Muestras por lado dentro de cada píxel: 4x4 = 16 muestras, suficiente para bordes limpios. */
const MUESTRAS = 4;

// ---------------------------------------------------------------------------
// Geometría: pruebas de pertenencia en las unidades del logo (0..64)
// ---------------------------------------------------------------------------

/** Distancia firmada a un rectángulo redondeado. Negativa dentro. */
function distanciaRect(px, py, x, y, w, h, r) {
  const qx = Math.abs(px - (x + w / 2)) - (w / 2 - r);
  const qy = Math.abs(py - (y + h / 2)) - (h / 2 - r);
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r;
}

/** Distancia firmada a un triángulo. Negativa dentro. */
function distanciaTriangulo(px, py, [ax, ay], [bx, by], [cx, cy]) {
  const lados = [
    [ax, ay, bx, by],
    [bx, by, cx, cy],
    [cx, cy, ax, ay],
  ];
  let d = Infinity;
  for (const [x1, y1, x2, y2] of lados) {
    const ex = x2 - x1;
    const ey = y2 - y1;
    const t = Math.max(0, Math.min(1, ((px - x1) * ex + (py - y1) * ey) / (ex * ex + ey * ey)));
    d = Math.min(d, Math.hypot(px - x1 - ex * t, py - y1 - ey * t));
  }
  // Dentro si los tres productos vectoriales con los lados tienen el mismo signo.
  const c1 = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
  const c2 = (cx - bx) * (py - by) - (cy - by) * (px - bx);
  const c3 = (ax - cx) * (py - cy) - (ay - cy) * (px - cx);
  const dentro = (c1 >= 0 && c2 >= 0 && c3 >= 0) || (c1 <= 0 && c2 <= 0 && c3 <= 0);
  return dentro ? -d : d;
}

/** Barras de la mancuerna, en las coordenadas locales del grupo del SVG. */
const BARRAS = [
  [8, 24, 5, 16, 2],
  [14, 19, 6, 26, 2.5],
  [16, 29.5, 31, 5, 2.5],
  [33, 19, 6, 26, 2.5],
];

const PUNTA = [
  [46, 25],
  [56, 32],
  [46, 39],
];
/** Mitad del `stroke-width="2.5"` de la punta de flecha. */
const MEDIO_TRAZO = 1.25;

const SENO = Math.sin((-35 * Math.PI) / 180);
const COSENO = Math.cos((-35 * Math.PI) / 180);

/**
 * ¿El punto (en unidades del logo) cae sobre la mancuerna?
 * Deshace `translate(1 0) rotate(-35 32 32)` para comparar en coordenadas locales.
 */
function enMancuerna(px, py) {
  const dx = px - 1 - 32;
  const dy = py - 32;
  // Rotación inversa: +35º.
  const lx = dx * COSENO + dy * SENO + 32;
  const ly = -dx * SENO + dy * COSENO + 32;
  for (const [x, y, w, h, r] of BARRAS) {
    if (distanciaRect(lx, ly, x, y, w, h, r) <= 0) return true;
  }
  return distanciaTriangulo(lx, ly, ...PUNTA) <= MEDIO_TRAZO;
}

/** Color del degradado de la insignia: diagonal de la esquina superior izquierda a la inferior derecha. */
function colorInsignia(px, py) {
  const t = Math.min(1, Math.max(0, (px + py) / (LADO * 2)));
  return [
    Math.round(DEGRADADO_INICIO[0] + (DEGRADADO_FIN[0] - DEGRADADO_INICIO[0]) * t),
    Math.round(DEGRADADO_INICIO[1] + (DEGRADADO_FIN[1] - DEGRADADO_INICIO[1]) * t),
    Math.round(DEGRADADO_INICIO[2] + (DEGRADADO_FIN[2] - DEGRADADO_INICIO[2]) * t),
  ];
}

// ---------------------------------------------------------------------------
// Dibujo
// ---------------------------------------------------------------------------

/**
 * Pinta la insignia dentro de un rectángulo del lienzo.
 *
 * @param destino  Uint8ClampedArray RGBA del lienzo completo.
 * @param ancho    Ancho del lienzo en píxeles.
 * @param caja     { x, y, lado } del cuadrado donde entra la insignia.
 * @param opciones { recorte: 'redondeado' | 'cuadrado', escalaLogo: number }
 */
function pintarInsignia(destino, ancho, caja, { recorte, escalaLogo = 1 }) {
  const { x: cajaX, y: cajaY, lado } = caja;
  const escala = LADO / lado;
  const paso = 1 / MUESTRAS;
  const total = MUESTRAS * MUESTRAS;
  // El logo se encoge hacia el centro sin mover el fondo: así cabe en la zona segura maskable.
  const centro = LADO / 2;

  for (let py = 0; py < lado; py++) {
    for (let px = 0; px < lado; px++) {
      let rojo = 0;
      let verde = 0;
      let azul = 0;
      let alfa = 0;

      for (let sy = 0; sy < MUESTRAS; sy++) {
        for (let sx = 0; sx < MUESTRAS; sx++) {
          const ux = (px + (sx + 0.5) * paso) * escala;
          const uy = (py + (sy + 0.5) * paso) * escala;

          const dentroFondo =
            recorte === 'cuadrado' ? true : distanciaRect(ux, uy, 0, 0, LADO, LADO, RADIO) <= 0;
          if (!dentroFondo) continue;

          const lx = centro + (ux - centro) / escalaLogo;
          const ly = centro + (uy - centro) / escalaLogo;
          const color = enMancuerna(lx, ly) ? TINTA : colorInsignia(ux, uy);
          rojo += color[0];
          verde += color[1];
          azul += color[2];
          alfa += 255;
        }
      }

      if (alfa === 0) continue;

      // Color medio de las muestras cubiertas y cobertura del píxel (el antialiasing del borde).
      const cubiertas = alfa / 255;
      const origen = [rojo / cubiertas, verde / cubiertas, azul / cubiertas];
      const alfaOrigen = cubiertas / total;

      // Mezcla "source-over" sobre lo que ya hubiera en el lienzo (el fondo del splash).
      const i = ((cajaY + py) * ancho + (cajaX + px)) * 4;
      const alfaDestino = destino[i + 3] / 255;
      const alfaFinal = alfaOrigen + alfaDestino * (1 - alfaOrigen);
      for (let canal = 0; canal < 3; canal++) {
        destino[i + canal] =
          (origen[canal] * alfaOrigen + destino[i + canal] * alfaDestino * (1 - alfaOrigen)) / alfaFinal;
      }
      destino[i + 3] = alfaFinal * 255;
    }
  }
}

function lienzo(ancho, alto, fondo) {
  const datos = new Uint8ClampedArray(ancho * alto * 4);
  if (fondo) {
    for (let i = 0; i < datos.length; i += 4) {
      datos[i] = fondo[0];
      datos[i + 1] = fondo[1];
      datos[i + 2] = fondo[2];
      datos[i + 3] = 255;
    }
  }
  return datos;
}

// ---------------------------------------------------------------------------
// PNG
// ---------------------------------------------------------------------------

const TABLA_CRC = (() => {
  const tabla = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    tabla[n] = c >>> 0;
  }
  return tabla;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function trozo(tipo, datos) {
  const cabecera = Buffer.alloc(8);
  cabecera.writeUInt32BE(datos.length, 0);
  cabecera.write(tipo, 4, 'ascii');
  const cola = Buffer.alloc(4);
  cola.writeUInt32BE(crc32(Buffer.concat([Buffer.from(tipo, 'ascii'), datos])), 0);
  return Buffer.concat([cabecera, datos, cola]);
}

function codificarPng(ancho, alto, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(ancho, 0);
  ihdr.writeUInt32BE(alto, 4);
  ihdr[8] = 8; // bits por canal
  ihdr[9] = 6; // RGBA
  const crudo = Buffer.alloc(alto * (ancho * 4 + 1));
  for (let y = 0; y < alto; y++) {
    const inicio = y * (ancho * 4 + 1);
    crudo[inicio] = 0; // sin filtro
    Buffer.from(rgba.buffer, y * ancho * 4, ancho * 4).copy(crudo, inicio + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    trozo('IHDR', ihdr),
    trozo('IDAT', deflateSync(crudo, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

function escribir(ruta, ancho, alto, datos) {
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, codificarPng(ancho, alto, datos));
  console.log(`  ${ruta.replace(RAIZ + '\\', '').replace(RAIZ + '/', '')}  ${ancho}x${alto}`);
}

// ---------------------------------------------------------------------------
// Salidas
// ---------------------------------------------------------------------------

/** Iconos de la app. `maskable` lleva fondo a sangre porque Android lo recorta. */
const ICONOS = [
  { archivo: 'icon-192.png', lado: 192, recorte: 'redondeado', escalaLogo: 1 },
  { archivo: 'icon-512.png', lado: 512, recorte: 'redondeado', escalaLogo: 1 },
  { archivo: 'icon-maskable-512.png', lado: 512, recorte: 'cuadrado', escalaLogo: 0.72 },
  // iOS aplica su propia máscara redondeada: el icono se entrega cuadrado y sin transparencia.
  { archivo: 'apple-touch-icon-180.png', lado: 180, recorte: 'cuadrado', escalaLogo: 1 },
];

/**
 * Pantallas de arranque de iOS, en píxeles de dispositivo y en vertical
 * (el manifest fija `orientation: portrait`).
 */
const SPLASH = [
  { ancho: 1320, alto: 2868 }, // iPhone 16/17 Pro Max
  { ancho: 1206, alto: 2622 }, // iPhone 16/17 Pro
  { ancho: 1290, alto: 2796 }, // iPhone 14/15/16 Plus y Pro Max
  { ancho: 1179, alto: 2556 }, // iPhone 14 Pro, 15, 16
  { ancho: 1284, alto: 2778 }, // iPhone 12/13 Pro Max
  { ancho: 1170, alto: 2532 }, // iPhone 12/13/14
  { ancho: 1125, alto: 2436 }, // iPhone X, XS, 11 Pro
  { ancho: 828, alto: 1792 }, // iPhone XR, 11
  { ancho: 750, alto: 1334 }, // iPhone SE 2/3, 8
  { ancho: 1536, alto: 2048 }, // iPad 9.7"
  { ancho: 1668, alto: 2388 }, // iPad Pro 11"
  { ancho: 2048, alto: 2732 }, // iPad Pro 12.9"
];

console.log('Iconos de la app:');
for (const { archivo, lado, recorte, escalaLogo } of ICONOS) {
  const datos = lienzo(lado, lado, null);
  pintarInsignia(datos, lado, { x: 0, y: 0, lado }, { recorte, escalaLogo });
  escribir(join(DIR_ICONOS, archivo), lado, lado, datos);
}

console.log('Pantallas de arranque de iOS:');
for (const { ancho, alto } of SPLASH) {
  const datos = lienzo(ancho, alto, TINTA);
  // Insignia centrada al 26% del lado corto: se ve nítida sin dominar la pantalla.
  const lado = Math.round(Math.min(ancho, alto) * 0.26);
  const caja = {
    x: Math.round((ancho - lado) / 2),
    y: Math.round((alto - lado) / 2),
    lado,
  };
  pintarInsignia(datos, ancho, caja, { recorte: 'redondeado', escalaLogo: 1 });
  escribir(join(DIR_SPLASH, `splash-${ancho}x${alto}.png`), ancho, alto, datos);
}
