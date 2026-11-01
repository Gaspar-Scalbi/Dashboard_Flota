import { COLORES, ESTADOS } from "../consultas/comunes.js";
import { eficienciaDeUnidades12Meses, eficienciaDeUnidadesDelMes } from "../consultas/combustible.js";
import { datosTablero } from "../controllers/tablero.controller.js";
import { datosFlota, datosEstado } from "../controllers/flota.controller.js";
import { datosCombustible, datosMes } from "../controllers/combustible.controller.js";
import { datosDocumentos, datosDocumentosDelColor } from "../controllers/documentos.controller.js";
import { datosChoferes, datosChoferesDelColor } from "../controllers/choferes.controller.js";

// Calcula de antemano las pantallas de los niveles 1 y 2, una por vez.
export async function precalentar() {
  const { consumo } = await datosCombustible();
  const tareas = [
    datosTablero,
    datosFlota,
    eficienciaDeUnidades12Meses,
    ...ESTADOS.map((estado) => () => datosEstado(estado)),
    datosDocumentos,
    ...COLORES.map((color) => () => datosDocumentosDelColor(color)),
    datosChoferes,
    ...COLORES.map((color) => () => datosChoferesDelColor(color)),
    ...consumo.map(({ mes }) => () => datosMes(mes)),
    ...consumo.map(({ mes }) => () => eficienciaDeUnidadesDelMes(mes))
  ];
  for (const tarea of tareas) {
    await tarea().catch(() => {});
  }
}
