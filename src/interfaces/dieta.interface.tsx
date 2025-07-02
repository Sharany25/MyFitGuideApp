export interface DietaData {
  userId: string;
  genero: 'masculino' | 'femenino';
  altura: number;
  peso: number;
  objetivo: string;
  alergias: string[];
  presupuesto: number;
}

export interface PlatilloPatchData {
  dia: string;
  tipoComida: string;
  platillo: string;
}