export interface ResumenGeneral {
  actasEsperadas: number;
  capturadas: number;
  pendientes: number;
  porcentajeAvance: number;
}

export interface DetalleDistrito {
  distritoId: number;
  distrito: string;
  esperadas: number;
  capturadas: number;
  pendientes: number;
  porcentajeAvance: number;
}

export interface AvanceResponse {
  resumenGeneral: ResumenGeneral;
  detalleDistritos: DetalleDistrito[];
  detalleTiposEleccion: DetalleTipoEleccion[];
}

export interface ItemSelector {
  DistritoId?: number;
  TipoEleccionId?: number;
  Nombre: string;
}

export interface DetalleTipoEleccion {
  tipoEleccionId: number;
  tipoEleccion: string;
  esperadas: number;
  capturadas: number;
  pendientes: number;
  porcentajeAvance: number;
}