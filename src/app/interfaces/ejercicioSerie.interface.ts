export interface ejercicioSerie{
  id: string;
  nombre: string;
  imagen: string;
  series: {
    dia: string;
    numero: number;
    repeticiones: number;
    peso: number;
    descanso: number;
  }[];
  isOpen: boolean;
}
