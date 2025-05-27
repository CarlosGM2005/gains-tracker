export interface Ejercicio {
  id: string;
  nombre: string;
  musculo: string;
  nivel: string;
  musculosImplicados: string
  descripcion: string;
  imgInicio: string;
  imgFinal: string;
  recomendado: 'si' | 'no';
  [key: string]: any;
}
