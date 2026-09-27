export interface TiempoEstudio {
  total: number;
  thisWeek: number;
}

export const MINUTOS_POR_REGISTRO = 15;

export function calcularTiempoEstudio(
  registrosTotales: number,
  registrosSemana: number
): TiempoEstudio {
  return {
    total: registrosTotales * MINUTOS_POR_REGISTRO,
    thisWeek: registrosSemana * MINUTOS_POR_REGISTRO
  };
}
