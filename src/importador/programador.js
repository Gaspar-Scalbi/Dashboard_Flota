import { IMPORTACION_MINUTOS } from "../config.js";
import { vaciarCache } from "../libs/cache.js";
import { precalentar } from "../libs/precalentar.js";
import { importar } from "./importar.js";

let enCurso = false;

export function describirResultado(resultado) {
  if (resultado.resultado !== "ok") return `${resultado.resultado}: ${resultado.mensaje}`;
  const partes = Object.entries(resultado.detalle).map(([entidad, { cargados, rechazados }]) =>
    `${entidad} ${cargados}${rechazados ? ` (${rechazados} rechazados)` : ""}`);
  const tipo = resultado.completa ? "completa" : "incremental";
  return `ok, ${tipo} (generación ${resultado.generacion}): ${partes.join(", ")}`;
}

const hora = () => new Date().toLocaleString("es-AR", { hour12: false });

async function ejecutar() {
  if (enCurso) return;
  enCurso = true;
  try {
    const resultado = await importar();
    console.log(`[importación ${hora()}] ${describirResultado(resultado)}`);
    if (resultado.resultado === "ok") vaciarCache();
    await precalentar();
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
