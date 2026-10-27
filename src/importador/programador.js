import { IMPORTACION_MINUTOS } from "../config.js";
import { importar } from "./importar.js";

let enCurso = false;

export function describirResultado(resultado) {
  if (resultado.resultado !== "ok") return `${resultado.resultado}: ${resultado.mensaje}`;
  const partes = Object.entries(resultado.detalle).map(([entidad, { cargados, rechazados }]) =>
    `${entidad} ${cargados}${rechazados ? ` (${rechazados} rechazados)` : ""}`);
  return `ok (generación ${resultado.generacion}): ${partes.join(", ")}`;
}

async function ejecutar() {
  if (enCurso) return;
  enCurso = true;
  try {
    const resultado = await importar();
    console.log(`[importación ${new Date().toLocaleString("es-AR")}] ${describirResultado(resultado)}`);
  } catch (error) {
    console.error("[importación] Error inesperado:", error);
  } finally {
    enCurso = false;
  }
}

export function programarImportacion() {
  ejecutar();
  setInterval(ejecutar, IMPORTACION_MINUTOS * 60_000);
}
