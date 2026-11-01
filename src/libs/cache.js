import { IMPORTACION_MINUTOS } from "../config.js";

// Resultados en memoria hasta la próxima importación con cambios o un intervalo como máximo.
const DURACION = IMPORTACION_MINUTOS * 60_000;
const memoria = new Map();

export function enCache(clave, calcular) {
  const guardado = memoria.get(clave);
  if (guardado && guardado.vence > Date.now()) return guardado.valor;
  const valor = calcular();
  memoria.set(clave, { valor, vence: Date.now() + DURACION });
  valor.catch(() => memoria.delete(clave));
  return valor;
}

export function vaciarCache() {
  memoria.clear();
}
