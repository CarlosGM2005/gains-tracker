export interface Ejercicio {
  id: string;
  nombre: string;
  musculo: string;
  nivel: string;
  musculosImplicados: string;
  descripcion: string;
  imgInicio: string;
  imgFin: string;  
  recomendado: boolean;
  [key: string]: any;
}
