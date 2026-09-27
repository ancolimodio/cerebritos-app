import { calcularTiempoEstudio, MINUTOS_POR_REGISTRO } from './tiempoEstudio';

describe('calcularTiempoEstudio', () => {
  it('debe definir la constante MINUTOS_POR_REGISTRO con valor 15', () => {
    expect(MINUTOS_POR_REGISTRO).toBe(15);
  });

  it('devuelve 0 minutos para total y thisWeek cuando ambos registros son 0 (sin mínimos inventados)', () => {
    const resultado = calcularTiempoEstudio(0, 0);
    expect(resultado).toEqual({
      total: 0,
      thisWeek: 0,
    });
  });

  it('calcula correctamente el tiempo de estudio con cantidades positivas (15 min por registro)', () => {
    const resultado = calcularTiempoEstudio(4, 2);
    expect(resultado).toEqual({
      total: 60,
      thisWeek: 30,
    });
  });

  it('calcula correctamente cuando hay registros totales pero ninguno en la semana', () => {
    const resultado = calcularTiempoEstudio(5, 0);
    expect(resultado).toEqual({
      total: 75,
      thisWeek: 0,
    });
  });

  it('calcula correctamente con un único registro', () => {
    const resultado = calcularTiempoEstudio(1, 1);
    expect(resultado).toEqual({
      total: 15,
      thisWeek: 15,
    });
  });

  it('calcula grandes cantidades de registros manteniendo la proporción exacta', () => {
    const resultado = calcularTiempoEstudio(100, 20);
    expect(resultado).toEqual({
      total: 1500,
      thisWeek: 300,
    });
  });
});
