import { comprimirFoto, ImagenNoValidaError, recorteCuadrado } from './imagen';

const OPCIONES = { lado: 256, maxCaracteres: 150_000, maxBytesArchivo: 1000 };

describe('utilidades de imagen', () => {
  it('recorta un cuadrado centrado en horizontal y en vertical', () => {
    expect(recorteCuadrado(1200, 800)).toEqual({ x: 200, y: 0, lado: 800 });
    expect(recorteCuadrado(600, 1001)).toEqual({ x: 0, y: 200, lado: 600 });
    expect(recorteCuadrado(300, 300)).toEqual({ x: 0, y: 0, lado: 300 });
  });

  it('rechaza archivos que no son imágenes', async () => {
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' });

    await expect(comprimirFoto(pdf, OPCIONES)).rejects.toMatchObject({ motivo: 'tipo' });
  });

  it('rechaza imágenes demasiado pesadas antes de leerlas', async () => {
    const grande = new Blob([new Uint8Array(2000)], { type: 'image/png' });

    await expect(comprimirFoto(grande, OPCIONES)).rejects.toBeInstanceOf(ImagenNoValidaError);
    await expect(comprimirFoto(grande, OPCIONES)).rejects.toMatchObject({ motivo: 'archivo-grande' });
  });
});
